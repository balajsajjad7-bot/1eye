#!/bin/bash
# 1EYE Carbon — one-shot setup for an Oracle Cloud "Always Free" Ubuntu VM (Ampere A1, arm64).
# Use as the VM's cloud-init script, or run once:  sudo CF_TUNNEL_TOKEN=... bash oracle-setup.sh
# Installs Ollama (localhost only), pulls the model, runs the locked-down Carbon API on 127.0.0.1:7860,
# and publishes it through a Cloudflare Tunnel (no open ports needed).
set -euxo pipefail
CF_TUNNEL_TOKEN="${CF_TUNNEL_TOKEN:-__CF_TUNNEL_TOKEN__}"
MODEL="hf.co/mradermacher/Qwen2.5-1.5B-Instruct-abliterated-SFT-GGUF:Q4_K_M"
REPO="https://raw.githubusercontent.com/balajsajjad7-bot/1eye/main/projects/carbon-space"

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y python3-venv curl ca-certificates

# Ollama, bound to localhost
curl -fsSL https://ollama.com/install.sh | sh
mkdir -p /etc/systemd/system/ollama.service.d
cat >/etc/systemd/system/ollama.service.d/carbon.conf <<EOF
[Service]
Environment=OLLAMA_HOST=127.0.0.1:11434
Environment=OLLAMA_KEEP_ALIVE=-1
Environment=OLLAMA_NUM_PARALLEL=2
EOF
systemctl daemon-reload && systemctl enable --now ollama && systemctl restart ollama
for i in $(seq 1 60); do curl -sf http://127.0.0.1:11434/api/version && break; sleep 2; done
ollama pull "$MODEL"

# Carbon API
id carbon >/dev/null 2>&1 || useradd -r -m -d /opt/carbon -s /usr/sbin/nologin carbon
mkdir -p /opt/carbon && curl -fsSL "$REPO/app.py" -o /opt/carbon/app.py
python3 -m venv /opt/carbon/venv
/opt/carbon/venv/bin/pip install -q fastapi==0.115.* "uvicorn[standard]==0.32.*" httpx==0.27.*
chown -R carbon:carbon /opt/carbon
cat >/etc/systemd/system/carbon.service <<EOF
[Unit]
Description=1EYE Carbon API
After=network-online.target ollama.service
Wants=ollama.service
[Service]
User=carbon
WorkingDirectory=/opt/carbon
Environment=MODEL=$MODEL
Environment=ALLOW_ORIGINS=https://1eye.dpdns.org,https://1eye.pages.dev
ExecStart=/opt/carbon/venv/bin/uvicorn app:app --host 127.0.0.1 --port 7860 --proxy-headers --forwarded-allow-ips=127.0.0.1
Restart=always
RestartSec=3
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload && systemctl enable --now carbon

# Cloudflare Tunnel → carbon.1eye.dpdns.org
ARCH=$(dpkg --print-architecture)
curl -fsSL -o /tmp/cloudflared.deb "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb"
dpkg -i /tmp/cloudflared.deb
if [ "$CF_TUNNEL_TOKEN" != "__CF_TUNNEL_TOKEN__" ]; then cloudflared service install "$CF_TUNNEL_TOKEN"; fi

# warm the model
curl -s http://127.0.0.1:11434/api/generate -d "{\"model\":\"$MODEL\",\"prompt\":\"hi\",\"stream\":false,\"options\":{\"num_predict\":1}}" >/dev/null || true
echo "CARBON READY"
