"""1EYE Carbon API.

Only one thing is exposed: chat with the one model baked into this Space. Ollama itself listens on
localhost, so nobody can pull, delete or swap models from outside. Chats are not stored or logged.
"""
import json, os, time, asyncio
from collections import defaultdict, deque
import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

MODEL = os.environ.get("MODEL", "hf.co/mradermacher/Qwen2.5-1.5B-Instruct-abliterated-SFT-GGUF:Q4_K_M")
OLLAMA = "http://127.0.0.1:11434"
ORIGINS = [o.strip() for o in os.environ.get("ALLOW_ORIGINS", "https://1eye.dpdns.org,https://1eye.pages.dev,http://localhost:8770").split(",") if o.strip()]
SYSTEM = ("You are Carbon, the open AI of 1EYE (1eye.dpdns.org), an open source lab. "
          "Answer directly and helpfully, without moralising or needless disclaimers. "
          "Be concise unless asked for detail. Use Markdown for code and lists.")
PER_MIN, PER_DAY = 12, 300          # requests per visitor
MAX_MSGS, MAX_CHARS = 16, 12000     # history sent to the model
BUSY = asyncio.Semaphore(2)         # two answers at a time on the free CPU

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_methods=["GET", "POST"], allow_headers=["Content-Type"], max_age=86400)
hits: dict[str, deque] = defaultdict(deque)

def visitor(req: Request) -> str:
    cf = req.headers.get("cf-connecting-ip")
    if cf: return cf.strip()
    fwd = req.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() or (req.client.host if req.client else "?")

def limited(ip: str) -> str | None:
    now, q = time.time(), hits[ip]
    while q and now - q[0] > 86400: q.popleft()
    if len(q) >= PER_DAY: return "Daily limit reached. Come back tomorrow."
    if sum(1 for t in q if now - t < 60) >= PER_MIN: return "Slow down a little: too many messages this minute."
    q.append(now); return None

@app.get("/")
async def root():
    return {"name": "1EYE Carbon", "model": "Qwen2.5 1.5B abliterated (Q4_K_M)", "chat": "POST /api/chat"}

@app.get("/api/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=3) as c:
            ok = (await c.get(f"{OLLAMA}/api/version")).status_code == 200
    except Exception:
        ok = False
    return {"ok": ok}

@app.post("/api/chat")
async def chat(req: Request):
    try:
        body = await req.json()
    except Exception:
        return JSONResponse({"error": "Bad request"}, 400)
    msgs = [m for m in (body.get("messages") or []) if isinstance(m, dict) and m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str)]
    if not msgs or msgs[-1]["role"] != "user" or not msgs[-1]["content"].strip():
        return JSONResponse({"error": "Send a message"}, 400)
    msgs = msgs[-MAX_MSGS:]
    while sum(len(m["content"]) for m in msgs) > MAX_CHARS and len(msgs) > 1: msgs.pop(0)
    msgs[-1]["content"] = msgs[-1]["content"][:MAX_CHARS]
    why = limited(visitor(req))
    if why: return JSONResponse({"error": why}, 429)
    payload = {"model": MODEL, "stream": True, "keep_alive": -1,
               "messages": [{"role": "system", "content": SYSTEM}] + [{"role": m["role"], "content": m["content"]} for m in msgs],
               "options": {"num_ctx": 4096, "num_predict": 1024, "temperature": 0.7}}

    async def stream():
        async with BUSY:
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(300, connect=10)) as c:
                    async with c.stream("POST", f"{OLLAMA}/api/chat", json=payload) as r:
                        async for line in r.aiter_lines():
                            if not line: continue
                            d = json.loads(line)
                            if d.get("message", {}).get("content"):
                                yield json.dumps({"t": d["message"]["content"]}) + "\n"
                            if d.get("done"):
                                yield json.dumps({"done": True, "tps": round(d.get("eval_count", 0) / max(d.get("eval_duration", 1) / 1e9, 1e-3), 1)}) + "\n"
            except Exception:
                yield json.dumps({"error": "Carbon is waking up or busy. Try again in a moment."}) + "\n"
    return StreamingResponse(stream(), media_type="application/x-ndjson", headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"})
