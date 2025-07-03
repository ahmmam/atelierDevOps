CREATE TABLE IF NOT EXISTS votes (
    player TEXT PRIMARY KEY,
    count INT NOT NULL DEFAULT 0
);

INSERT INTO votes (player, count) VALUES ('messi', 0)
ON CONFLICT (player) DO NOTHING;

INSERT INTO votes (player, count) VALUES ('cruyff', 0)
ON CONFLICT (player) DO NOTHING;

