# 1EYE Carbon — Ollama + a small locked-down API, for a Hugging Face Docker Space (free CPU tier).
FROM ollama/ollama:latest
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip curl \
 && pip3 install --no-cache-dir --break-system-packages fastapi==0.115.* "uvicorn[standard]==0.32.*" httpx==0.27.* \
 && rm -rf /var/lib/apt/lists/*
ENV OLLAMA_HOST=127.0.0.1:11434 OLLAMA_MODELS=/models OLLAMA_KEEP_ALIVE=-1 OLLAMA_NUM_PARALLEL=2 HOME=/tmp
ARG MODEL=hf.co/mradermacher/Qwen2.5-1.5B-Instruct-abliterated-SFT-GGUF:Q4_K_M
ENV MODEL=${MODEL}
# bake the model into the image so a cold start doesn't download 1 GB
RUN mkdir -p /models && (ollama serve >/tmp/o.log 2>&1 &) && sleep 6 && ollama pull "$MODEL" && chmod -R a+rX /models
WORKDIR /app
COPY app.py start.sh /app/
RUN chmod +x /app/start.sh
EXPOSE 7860
ENTRYPOINT []
CMD ["/app/start.sh"]
