# 1EYE Carbon Engine

Serves Carbon (Ollama model `hf.co/mradermacher/Qwen2.5-1.5B-Instruct-abliterated-SFT-GGUF:Q4_K_M`) from your PC
to https://1eye.dpdns.org/carbon/ through the `1eye-pc` Cloudflare Tunnel (`carbon.1eye.dpdns.org` → `http://localhost:7860`).

- Listens on 127.0.0.1:7860 only; only chat with the Carbon model is exposed.
- 12 messages/minute and 300/day per visitor; only the 1EYE website may call it; no chat logs.
- Starts Ollama if needed, keeps the model loaded, and starts with Windows.
- Turn off autostart: run `"Carbon Engine.exe" --uninstall`, then end it in Task Manager.
- Log: `%APPDATA%\1EYE\carbon-engine.log`.

Build: `GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "-s -w -H windowsgui" -o "Carbon Engine.exe" .`
