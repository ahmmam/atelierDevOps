import os
import asyncpg
from fastapi import FastAPI, HTTPException

DB_HOST = os.getenv("POSTGRES_HOST", "db")
DB_PORT = int(os.getenv("POSTGRES_PORT", 5432))
DB_NAME = os.getenv("POSTGRES_DB", "goatvote")
DB_USER = os.getenv("POSTGRES_USER", "goatuser")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "goatpass")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

app = FastAPI(title="Goat Vote – API")
pool = None

@app.on_event("startup")
async def startup():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    await pool.close()

async def init_db():
    query = """
    CREATE TABLE IF NOT EXISTS votes (
        player TEXT PRIMARY KEY,
        count INT NOT NULL DEFAULT 0
    );
    INSERT INTO votes (player, count) VALUES ('messi', 0)
    ON CONFLICT (player) DO NOTHING;
    INSERT INTO votes (player, count) VALUES ('cruyff', 0)
    ON CONFLICT (player) DO NOTHING;
    """
    async with pool.acquire() as conn:
        await conn.execute(query)

@app.post("/vote/{player}")
async def vote(player: str):
    player = player.lower()
    if player not in {"messi", "cruyff"}:
        raise HTTPException(status_code=400, detail="Player must be messi or cruyff")

    async with pool.acquire() as conn:
        await conn.execute("UPDATE votes SET count = count + 1 WHERE player = $1", player)
        row = await conn.fetchrow("SELECT player, count FROM votes WHERE player = $1", player)
    return {"player": row["player"], "count": row["count"]}

@app.get("/scores")
async def scores():
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT player, count FROM votes")
    return {row["player"]: row["count"] for row in rows}

