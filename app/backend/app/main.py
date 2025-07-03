import os
import httpx
from fastapi import FastAPI, HTTPException

API_URL = os.getenv("API_URL", "http://api:9000")

app = FastAPI(title="Goat Vote – Backend")

@app.post("/vote/{player}")
async def vote(player: str):
    player = player.lower()
    if player not in {"messi", "cruyff"}:
        raise HTTPException(status_code=400, detail="Player must be messi or cruyff")

    async with httpx.AsyncClient() as client:
        r = await client.post(f"{API_URL}/vote/{player}")
        r.raise_for_status()
        return r.json()

@app.get("/scores")
async def scores():
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{API_URL}/scores")
        r.raise_for_status()
        return r.json()

