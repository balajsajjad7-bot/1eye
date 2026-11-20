---
title: 1EYE Carbon
emoji: 👁
colorFrom: gray
colorTo: red
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
short_description: Carbon, the open AI behind 1eye.dpdns.org/carbon
---

# 1EYE Carbon

The engine behind [1eye.dpdns.org/carbon](https://1eye.dpdns.org/carbon/): Ollama running
[Qwen2.5-1.5B-Instruct-abliterated-SFT (Q4_K_M GGUF)](https://huggingface.co/mradermacher/Qwen2.5-1.5B-Instruct-abliterated-SFT-GGUF)
behind a small API that only allows chat with that one model, with per-visitor rate limits and no logging.

`POST /api/chat` `{"messages":[{"role":"user","content":"hi"}]}` → NDJSON stream of `{"t": "..."}` chunks.
