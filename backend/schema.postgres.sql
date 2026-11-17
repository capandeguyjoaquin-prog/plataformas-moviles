-- Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run

CREATE TABLE IF NOT EXISTS usuarios (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ranking (
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    puntaje    INT NOT NULL,
    creado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ranking_puntaje ON ranking (puntaje DESC, id);

CREATE TABLE IF NOT EXISTS push_tokens (
    token      TEXT PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_usuario ON push_tokens (usuario_id);

-- Seguridad: Supabase expone las tablas por su API REST con la anon key.
-- Activar RLS sin politicas bloquea ese acceso (tu backend conecta directo y no se ve afectado).
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking  ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
