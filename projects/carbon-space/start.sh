#!/bin/sh
ollama serve >/tmp/ollama.log 2>&1 &
for i in $(seq 1 60); do curl -sf http://127.0.0.1:11434/api/version >/dev/null && break; sleep 1; done
# warm the model into memory
curl -s http://127.0.0.1:11434/api/generate -d "{\"model\":\"$MODEL\",\"prompt\":\"hi\",\"stream\":false,\"options\":{\"num_predict\":1}}" >/dev/null &
exec python3 -m uvicorn app:app --host 0.0.0.0 --port 7860 --workers 1
