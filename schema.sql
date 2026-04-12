-- =============================================================================
-- ERP-SDA · Database Schema
-- Engine   : PostgreSQL (Neon)
-- Auth     : Permission-based (NO roles, NO role-groups)
--            Permissions are assigned directly to each user.
-- Entities : Users · Groups (teams) · Tickets · Comments · History
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "citext";    -- case-insensitive text for emails

-- ---------------------------------------------------------------------------
-- Schema namespace
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS erp;

-- ---------------------------------------------------------------------------
-- Reusable updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SECTION 1 · PERMISSIONS CATALOG
-- Mirrors the PERMISSIONS constant in permission.model.ts exactly.
-- =============================================================================

CREATE TABLE erp.permissions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'ticket:create'
  resource    VARCHAR(50)  NOT NULL,          -- e.g. 'ticket'
  action      VARCHAR(50)  NOT NULL,          -- e.g. 'create'
  description TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (resource, action)
);

-- Seed: exactly the permissions defined in permission.model.ts
INSERT INTO erp.permissions (code, resource, action, description) VALUES
  ('ticket:create',           'ticket', 'create',             'Create new tickets'),
  ('ticket:edit',             'ticket', 'edit',               'Edit existing tickets'),
  ('ticket:delete',           'ticket', 'delete',             'Delete tickets'),
  ('ticket:view',             'ticket', 'view',               'View tickets'),
  ('group:add',               'group',  'add',                'Create new groups/teams'),
  ('group:edit',              'group',  'edit',               'Edit group details'),
  ('group:delete',            'group',  'delete',             'Delete groups'),
  ('user:create',             'user',   'create',             'Create new users'),
  ('user:edit',               'user',   'edit',               'Edit user profiles'),
  ('user:delete',             'user',   'delete',             'Delete users'),
  ('user:view',               'user',   'view',               'View user list and profiles'),
  ('user:manage-permissions', 'user',   'manage-permissions', 'Assign or revoke user permissions');

-- =============================================================================
-- SECTION 2 · USERS
-- Mirrors User interface: id, name, email, password, permissions, avatar?
-- =============================================================================

CREATE TABLE erp.users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  email         CITEXT       NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  avatar_url    TEXT,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON erp.users
  FOR EACH ROW EXECUTE FUNCTION erp.set_updated_at();

-- ---------------------------------------------------------------------------
-- Password history (prevent reuse of last N passwords)
-- ---------------------------------------------------------------------------
CREATE TABLE erp.password_history (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES erp.users(id) ON DELETE CASCADE,
  password_hash TEXT        NOT NULL,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pw_history_user ON erp.password_history(user_id, changed_at DESC);

-- =============================================================================
-- SECTION 3 · USER <-> PERMISSION  (direct assignment — NO roles)
-- =============================================================================

CREATE TABLE erp.user_permissions (
  user_id       UUID        NOT NULL REFERENCES erp.users(id)       ON DELETE CASCADE,
  permission_id UUID        NOT NULL REFERENCES erp.permissions(id) ON DELETE CASCADE,
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by    UUID        REFERENCES erp.users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, permission_id)
);

CREATE INDEX idx_user_perms_user ON erp.user_permissions(user_id);

-- =============================================================================
-- SECTION 4 · GROUPS  (teams / workspaces — NOT permission containers)
-- Mirrors Group interface: id, name, category, level, author, memberIds,
--                          tickets (computed), status
-- =============================================================================

CREATE TABLE erp.groups (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  level       erp.group_level NOT NULL,
  author_id   UUID         NOT NULL REFERENCES erp.users(id) ON DELETE RESTRICT,
  status      VARCHAR(20)  NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_groups_updated_at
  BEFORE UPDATE ON erp.groups
  FOR EACH ROW EXECUTE FUNCTION erp.set_updated_at();

-- ---------------------------------------------------------------------------
-- Group members  (memberIds[] -> normalized junction table)
-- ---------------------------------------------------------------------------
CREATE TABLE erp.group_members (
  group_id  UUID        NOT NULL REFERENCES erp.groups(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES erp.users(id)  ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by  UUID        REFERENCES erp.users(id) ON DELETE SET NULL,
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_members_user  ON erp.group_members(user_id);
CREATE INDEX idx_group_members_group ON erp.group_members(group_id);

-- =============================================================================
-- SECTION 5 · TICKETS
-- Mirrors Ticket interface. Comments and history in separate child tables.
-- =============================================================================

CREATE TYPE erp.group_level     AS ENUM ('Junior', 'Mid', 'Senior');
CREATE TYPE erp.ticket_status   AS ENUM ('Pendiente', 'En Progreso', 'Revisión', 'Finalizado');
CREATE TYPE erp.ticket_priority AS ENUM ('Baja', 'Media', 'Alta', 'Urgente');

CREATE TABLE erp.tickets (
  id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255)        NOT NULL,
  description TEXT,
  status      erp.ticket_status   NOT NULL DEFAULT 'Pendiente',
  priority    erp.ticket_priority NOT NULL DEFAULT 'Media',
  group_id    UUID                NOT NULL REFERENCES erp.groups(id) ON DELETE CASCADE,
  assigned_to UUID                REFERENCES erp.users(id) ON DELETE SET NULL,  -- optional (matches frontend)
  created_by  UUID                NOT NULL REFERENCES erp.users(id) ON DELETE RESTRICT,
  due_date    DATE,
  created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON erp.tickets
  FOR EACH ROW EXECUTE FUNCTION erp.set_updated_at();

CREATE INDEX idx_tickets_group      ON erp.tickets(group_id);
CREATE INDEX idx_tickets_assigned   ON erp.tickets(assigned_to);
CREATE INDEX idx_tickets_created_by ON erp.tickets(created_by);
CREATE INDEX idx_tickets_status     ON erp.tickets(status);

-- ---------------------------------------------------------------------------
-- Ticket comments  (comments[] -> normalized child table)
-- author_id maps to TicketComment.author (name resolved via JOIN in views)
-- ---------------------------------------------------------------------------
CREATE TABLE erp.ticket_comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID        NOT NULL REFERENCES erp.tickets(id) ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES erp.users(id)   ON DELETE RESTRICT,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Comments are immutable by design; no updated_at.
);

CREATE INDEX idx_comments_ticket ON erp.ticket_comments(ticket_id, created_at);

-- ---------------------------------------------------------------------------
-- Ticket history  (history[] -> auto-populated via trigger)
-- Mirrors TicketHistoryEntry: field, oldValue, newValue, changedBy, date
-- ---------------------------------------------------------------------------
CREATE TABLE erp.ticket_history (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID         NOT NULL REFERENCES erp.tickets(id) ON DELETE CASCADE,
  field      VARCHAR(100) NOT NULL,   -- 'status' | 'priority' | 'assigned_to' | 'title' | 'due_date' | 'description'
  old_value  TEXT,
  new_value  TEXT,
  changed_by UUID         REFERENCES erp.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_history_ticket ON erp.ticket_history(ticket_id, changed_at);

-- ---------------------------------------------------------------------------
-- Trigger: auto-record history on ticket field changes.
-- The app layer must SET LOCAL erp.current_user_id = '<uuid>'
-- before every UPDATE on erp.tickets inside a transaction.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.record_ticket_history()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_by UUID;
BEGIN
  BEGIN
    v_changed_by := current_setting('erp.current_user_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_changed_by := NULL;
  END;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO erp.ticket_history(ticket_id, field, old_value, new_value, changed_by)
    VALUES (NEW.id, 'status', OLD.status::TEXT, NEW.status::TEXT, v_changed_by);
  END IF;

  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO erp.ticket_history(ticket_id, field, old_value, new_value, changed_by)
    VALUES (NEW.id, 'priority', OLD.priority::TEXT, NEW.priority::TEXT, v_changed_by);
  END IF;

  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO erp.ticket_history(ticket_id, field, old_value, new_value, changed_by)
    VALUES (NEW.id, 'assigned_to', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT, v_changed_by);
  END IF;

  IF OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO erp.ticket_history(ticket_id, field, old_value, new_value, changed_by)
    VALUES (NEW.id, 'title', OLD.title, NEW.title, v_changed_by);
  END IF;

  IF OLD.due_date IS DISTINCT FROM NEW.due_date THEN
    INSERT INTO erp.ticket_history(ticket_id, field, old_value, new_value, changed_by)
    VALUES (NEW.id, 'due_date', OLD.due_date::TEXT, NEW.due_date::TEXT, v_changed_by);
  END IF;

  -- Tracks description edits (truncated to 500 chars to avoid storing large diffs)
  IF OLD.description IS DISTINCT FROM NEW.description THEN
    INSERT INTO erp.ticket_history(ticket_id, field, old_value, new_value, changed_by)
    VALUES (NEW.id, 'description', LEFT(OLD.description, 500), LEFT(NEW.description, 500), v_changed_by);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_history
  AFTER UPDATE ON erp.tickets
  FOR EACH ROW EXECUTE FUNCTION erp.record_ticket_history();

-- =============================================================================
-- SECTION 6 · SESSIONS
-- =============================================================================

CREATE TABLE erp.user_sessions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES erp.users(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,   -- hash of the JWT, never the raw token
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,                   -- NULL = still active
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user    ON erp.user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON erp.user_sessions(expires_at)
  WHERE revoked_at IS NULL;

-- =============================================================================
-- SECTION 7 · AUDIT LOG
-- =============================================================================

CREATE TABLE erp.audit_log (
  id         BIGSERIAL    PRIMARY KEY,
  user_id    UUID         REFERENCES erp.users(id) ON DELETE SET NULL,
  action     VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id  UUID,
  old_data   JSONB,
  new_data   JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user    ON erp.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_table   ON erp.audit_log(table_name, record_id);
CREATE INDEX idx_audit_created ON erp.audit_log(created_at DESC);

-- =============================================================================
-- SECTION 8 · FUNCTIONS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. LOGIN
--    Returns user data + permissions[] as TEXT[] (ready for Go/frontend).
--    Does NOT create a session — call fn_create_session separately from Go
--    after generating the JWT.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_login(
  p_email    TEXT,
  p_password TEXT,
  p_ip       INET DEFAULT NULL
)
RETURNS TABLE (
  user_id     UUID,
  name        VARCHAR,
  email       CITEXT,
  avatar_url  TEXT,
  is_verified BOOLEAN,
  permissions TEXT[]
) AS $$
DECLARE
  v_user erp.users%ROWTYPE;
BEGIN
  SELECT * INTO v_user
  FROM erp.users
  WHERE erp.users.email = p_email::CITEXT
    AND is_active = TRUE;

  IF NOT FOUND OR v_user.password_hash <> crypt(p_password, v_user.password_hash) THEN
    INSERT INTO erp.audit_log(action, ip_address)
    VALUES ('LOGIN_FAILED', p_ip);
    RETURN;
  END IF;

  UPDATE erp.users SET last_login_at = NOW() WHERE id = v_user.id;

  INSERT INTO erp.audit_log(user_id, action, ip_address)
  VALUES (v_user.id, 'LOGIN_SUCCESS', p_ip);

  RETURN QUERY
    SELECT
      v_user.id,
      v_user.name,
      v_user.email,
      v_user.avatar_url,
      v_user.is_verified,
      COALESCE(
        ARRAY(
          SELECT p.code
          FROM   erp.user_permissions up
          JOIN   erp.permissions p ON p.id = up.permission_id
          WHERE  up.user_id = v_user.id
          ORDER  BY p.code
        ),
        '{}'::TEXT[]
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 1b. CREATE SESSION  (call from Go after generating JWT)
--     Usage: SELECT erp.fn_create_session(userID, sha256(jwt), ip, userAgent)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_create_session(
  p_user_id    UUID,
  p_token_hash TEXT,
  p_ip_address INET     DEFAULT NULL,
  p_user_agent TEXT     DEFAULT NULL,
  p_duration   INTERVAL DEFAULT INTERVAL '7 days'
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO erp.user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
  VALUES (p_user_id, p_token_hash, p_ip_address, p_user_agent, NOW() + p_duration)
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 1c. REVOKE SESSION  (logout)
--     Usage: SELECT erp.fn_revoke_session(sha256(jwt))
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_revoke_session(p_token_hash TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE erp.user_sessions
  SET    revoked_at = NOW()
  WHERE  token_hash = p_token_hash
    AND  revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 2. CREATE USER  (admin creates another user -> is_verified = TRUE)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_create_user(
  p_name       VARCHAR(150),
  p_email      TEXT,
  p_password   TEXT,
  p_avatar_url TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_hash TEXT;
  v_id   UUID;
BEGIN
  v_hash := crypt(p_password, gen_salt('bf', 12));

  INSERT INTO erp.users (name, email, password_hash, avatar_url, is_verified)
  VALUES (p_name, p_email::CITEXT, v_hash, p_avatar_url, TRUE)
  RETURNING id INTO v_id;

  INSERT INTO erp.password_history(user_id, password_hash)
  VALUES (v_id, v_hash);

  INSERT INTO erp.audit_log(user_id, action, table_name, record_id)
  VALUES (p_created_by, 'CREATE_USER', 'users', v_id);

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 3. REGISTER USER  (self-registration -> is_verified = FALSE)
--    Default permissions: ticket:view + ticket:create  (matches AuthService.register)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_register_user(
  p_name     VARCHAR(150),
  p_email    TEXT,
  p_password TEXT
)
RETURNS UUID AS $$
DECLARE
  v_hash TEXT;
  v_id   UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM erp.users WHERE email = p_email::CITEXT) THEN
    RAISE EXCEPTION 'EMAIL_ALREADY_REGISTERED';
  END IF;

  v_hash := crypt(p_password, gen_salt('bf', 12));

  INSERT INTO erp.users (name, email, password_hash, is_verified)
  VALUES (p_name, p_email::CITEXT, v_hash, FALSE)
  RETURNING id INTO v_id;

  INSERT INTO erp.password_history(user_id, password_hash)
  VALUES (v_id, v_hash);

  -- Matches AuthService.register() default permissions
  INSERT INTO erp.user_permissions (user_id, permission_id)
  SELECT v_id, id FROM erp.permissions
  WHERE code IN ('ticket:view', 'ticket:create');

  INSERT INTO erp.audit_log(user_id, action, table_name, record_id)
  VALUES (v_id, 'SELF_REGISTER', 'users', v_id);

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 4. UPDATE USER PROFILE
--    p_clear_avatar = TRUE -> sets avatar_url to NULL (removes avatar).
--    Without this flag, passing NULL for p_avatar_url keeps the existing value.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_update_profile(
  p_user_id     UUID,
  p_name        VARCHAR(150) DEFAULT NULL,
  p_avatar_url  TEXT         DEFAULT NULL,
  p_clear_avatar BOOLEAN     DEFAULT FALSE,
  p_updated_by  UUID         DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE erp.users
  SET
    name       = COALESCE(p_name, name),
    avatar_url = CASE
                   WHEN p_clear_avatar THEN NULL
                   ELSE COALESCE(p_avatar_url, avatar_url)
                 END
  WHERE id = p_user_id;

  INSERT INTO erp.audit_log(user_id, action, table_name, record_id)
  VALUES (p_updated_by, 'UPDATE_PROFILE', 'users', p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 5. UPDATE PASSWORD
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_update_password(
  p_user_id      UUID,
  p_old_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_hash TEXT;
  v_new_hash     TEXT;
  v_reused       BOOLEAN;
BEGIN
  SELECT password_hash INTO v_current_hash
  FROM erp.users WHERE id = p_user_id AND is_active = TRUE;

  IF v_current_hash IS NULL OR
     v_current_hash <> crypt(p_old_password, v_current_hash) THEN
    RETURN FALSE;
  END IF;

  -- FIX: Fetch the last 5 hashes first (ORDER BY + LIMIT),
  --      then check if new password matches any of them.
  --      The original had LIMIT inside EXISTS which checked only matched rows.
  SELECT EXISTS (
    SELECT 1
    FROM (
      SELECT password_hash
      FROM   erp.password_history
      WHERE  user_id = p_user_id
      ORDER  BY changed_at DESC
      LIMIT  5
    ) recent
    WHERE recent.password_hash = crypt(p_new_password, recent.password_hash)
  ) INTO v_reused;

  IF v_reused THEN
    RAISE EXCEPTION 'CANNOT_REUSE_RECENT_PASSWORD';
  END IF;

  v_new_hash := crypt(p_new_password, gen_salt('bf', 12));

  UPDATE erp.users SET password_hash = v_new_hash WHERE id = p_user_id;

  INSERT INTO erp.password_history(user_id, password_hash)
  VALUES (p_user_id, v_new_hash);

  INSERT INTO erp.audit_log(user_id, action, table_name, record_id)
  VALUES (p_user_id, 'UPDATE_PASSWORD', 'users', p_user_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 6. ASSIGN PERMISSIONS  (replaces the full permission set of a user)
--    Pass an array of codes: ARRAY['ticket:view','ticket:create']
--    Matches UserService.update(id, { permissions: [...] })
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_set_user_permissions(
  p_user_id    UUID,
  p_codes      TEXT[],
  p_granted_by UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_old_perms TEXT[];
BEGIN
  SELECT ARRAY(
    SELECT p.code FROM erp.user_permissions up
    JOIN erp.permissions p ON p.id = up.permission_id
    WHERE up.user_id = p_user_id
  ) INTO v_old_perms;

  -- Full replace
  DELETE FROM erp.user_permissions WHERE user_id = p_user_id;

  INSERT INTO erp.user_permissions (user_id, permission_id)
  SELECT p_user_id, id
  FROM   erp.permissions
  WHERE  code = ANY(p_codes);

  INSERT INTO erp.audit_log(user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    p_granted_by,
    'ASSIGN_PERMISSIONS',
    'user_permissions',
    p_user_id,
    jsonb_build_object('permissions', v_old_perms),
    jsonb_build_object('permissions', p_codes)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- Helper: check single permission — use this in Go Chi middleware
--   Usage: SELECT erp.fn_has_permission('<user_uuid>', 'ticket:create');
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION erp.fn_has_permission(
  p_user_id UUID,
  p_code    TEXT
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   erp.user_permissions up
    JOIN   erp.permissions p ON p.id = up.permission_id
    WHERE  up.user_id = p_user_id
      AND  p.code     = p_code
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================================
-- SECTION 9 · VIEWS
-- =============================================================================

-- User with permission codes as TEXT[] — matches frontend User interface
CREATE OR REPLACE VIEW erp.v_user_with_permissions AS
SELECT
  u.id,
  u.name,
  u.email,
  u.avatar_url,
  u.is_active,
  u.is_verified,
  u.last_login_at,
  u.created_at,
  COALESCE(
    ARRAY_AGG(p.code ORDER BY p.code) FILTER (WHERE p.code IS NOT NULL),
    ARRAY[]::TEXT[]
  ) AS permissions
FROM      erp.users u
LEFT JOIN erp.user_permissions up ON up.user_id = u.id
LEFT JOIN erp.permissions p       ON p.id = up.permission_id
GROUP BY  u.id;

-- Group summary — matches Group interface (name, category, level, author,
-- memberIds count, tickets count, status).
-- author_id is included so the Go layer can do permission checks without extra JOINs.
CREATE OR REPLACE VIEW erp.v_group_summary AS
SELECT
  g.id,
  g.name,
  g.category,
  g.level,
  g.status,
  g.author_id,
  ua.name                                  AS author_name,
  COALESCE(COUNT(DISTINCT gm.user_id), 0) AS member_count,
  COALESCE(COUNT(DISTINCT t.id),       0) AS ticket_count,
  g.created_at
FROM      erp.groups g
LEFT JOIN erp.users        ua ON ua.id = g.author_id
LEFT JOIN erp.group_members gm ON gm.group_id = g.id
LEFT JOIN erp.tickets       t  ON t.group_id  = g.id
GROUP BY  g.id, g.author_id, ua.name;

-- Ticket with resolved user names — avoids N+1 queries in the Go layer.
-- Mirrors v_ticket_detail used in the tickets-page component.
CREATE OR REPLACE VIEW erp.v_ticket_detail AS
SELECT
  t.id,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.due_date,
  t.created_at,
  t.updated_at,
  t.group_id,
  g.name       AS group_name,
  t.assigned_to,
  ua.name      AS assigned_to_name,
  t.created_by,
  uc.name      AS created_by_name
FROM      erp.tickets t
LEFT JOIN erp.groups g  ON g.id  = t.group_id
LEFT JOIN erp.users  ua ON ua.id = t.assigned_to
LEFT JOIN erp.users  uc ON uc.id = t.created_by;

-- =============================================================================
-- SECTION 10 · SEED DATA
-- Mirrors the hardcoded data in all Angular services exactly.
-- Users    -> UserService._users signal
-- Groups   -> GroupService._groups signal
-- Tickets  -> TicketService._tickets signal (including comments and history)
-- =============================================================================

DO $$
DECLARE
  -- Users (match UserService seed)
  v_superadmin UUID;
  v_carlos     UUID;
  v_ana        UUID;
  v_laura      UUID;
  v_miguel     UUID;

  -- Groups (match GroupService seed)
  v_g_alpha  UUID;
  v_g_design UUID;
  v_g_sales  UUID;

  -- Tickets (match TicketService seed)
  v_t001 UUID;
  v_t002 UUID;
  v_t003 UUID;
  v_t004 UUID;
  v_t005 UUID;
  v_t006 UUID;
BEGIN

  -- ── Users ──────────────────────────────────────────────────────────────────

  INSERT INTO erp.users (name, email, password_hash, is_verified)
  VALUES ('Super Admin', 'admin@erp.com', crypt('admin123', gen_salt('bf', 12)), TRUE)
  RETURNING id INTO v_superadmin;

  INSERT INTO erp.users (name, email, password_hash, is_verified)
  VALUES ('Carlos Méndez', 'carlos@erp.com', crypt('carlos123', gen_salt('bf', 12)), TRUE)
  RETURNING id INTO v_carlos;

  INSERT INTO erp.users (name, email, password_hash, is_verified)
  VALUES ('Ana García', 'ana@erp.com', crypt('ana123', gen_salt('bf', 12)), TRUE)
  RETURNING id INTO v_ana;

  INSERT INTO erp.users (name, email, password_hash, is_verified)
  VALUES ('Laura Torres', 'laura@erp.com', crypt('laura123', gen_salt('bf', 12)), TRUE)
  RETURNING id INTO v_laura;

  INSERT INTO erp.users (name, email, password_hash, is_verified)
  VALUES ('Miguel Ríos', 'miguel@erp.com', crypt('miguel123', gen_salt('bf', 12)), TRUE)
  RETURNING id INTO v_miguel;

  -- ── Permissions (mirrors UserService permissions exactly) ──────────────────

  -- Super Admin: ALL permissions (matches ALL_PERMISSIONS / grantAllPermissions)
  INSERT INTO erp.user_permissions (user_id, permission_id)
  SELECT v_superadmin, id FROM erp.permissions;

  -- Carlos: ticket:edit + ticket:view
  INSERT INTO erp.user_permissions (user_id, permission_id)
  SELECT v_carlos, id FROM erp.permissions
  WHERE code IN ('ticket:edit', 'ticket:view');

  -- Ana: ticket:create + ticket:edit + ticket:view + group:add + group:edit + group:delete
  INSERT INTO erp.user_permissions (user_id, permission_id)
  SELECT v_ana, id FROM erp.permissions
  WHERE code IN (
    'ticket:create', 'ticket:edit', 'ticket:view',
    'group:add', 'group:edit', 'group:delete'
  );

  -- Laura: ticket:view + ticket:create
  INSERT INTO erp.user_permissions (user_id, permission_id)
  SELECT v_laura, id FROM erp.permissions
  WHERE code IN ('ticket:view', 'ticket:create');

  -- Miguel: ticket:view only
  INSERT INTO erp.user_permissions (user_id, permission_id)
  SELECT v_miguel, id FROM erp.permissions
  WHERE code = 'ticket:view';

  -- ── Groups (mirrors GroupService._groups signal) ───────────────────────────
  -- Note: author is 'Admin ERP' as a string in the frontend; here it maps
  -- to v_superadmin (the admin@erp.com user) as a proper FK.
  -- memberIds are [] in the seed, so no group_members rows are needed.

  INSERT INTO erp.groups (name, category, level, author_id)
  VALUES ('Alpha Team', 'Ingeniería', 'Senior', v_superadmin)
  RETURNING id INTO v_g_alpha;

  INSERT INTO erp.groups (name, category, level, author_id)
  VALUES ('Design Hub', 'Diseño', 'Mid', v_superadmin)
  RETURNING id INTO v_g_design;

  INSERT INTO erp.groups (name, category, level, author_id)
  VALUES ('Sales Force', 'Ventas', 'Junior', v_superadmin)
  RETURNING id INTO v_g_sales;

  -- ── Tickets (mirrors TicketService._tickets signal) ───────────────────────

  -- t-001: Configurar entorno de desarrollo
  INSERT INTO erp.tickets
    (title, description, status, priority, group_id, assigned_to, created_by, due_date, created_at)
  VALUES (
    'Configurar entorno de desarrollo',
    'Instalar todas las dependencias y configurar el entorno local para el equipo.',
    'Finalizado', 'Alta', v_g_alpha, v_carlos, v_superadmin, '2026-02-28', '2026-02-15'
  ) RETURNING id INTO v_t001;

  -- t-002: Diseñar wireframes del dashboard
  INSERT INTO erp.tickets
    (title, description, status, priority, group_id, assigned_to, created_by, due_date, created_at)
  VALUES (
    'Diseñar wireframes del dashboard',
    'Crear wireframes de baja fidelidad para la vista principal del ERP.',
    'En Progreso', 'Media', v_g_design, v_ana, v_ana, '2026-03-15', '2026-02-20'
  ) RETURNING id INTO v_t002;

  -- t-003: Implementar módulo de autenticación
  INSERT INTO erp.tickets
    (title, description, status, priority, group_id, assigned_to, created_by, due_date, created_at)
  VALUES (
    'Implementar módulo de autenticación',
    'Login, registro y recuperación de contraseña con JWT.',
    'Revisión', 'Urgente', v_g_alpha, v_superadmin, v_superadmin, '2026-03-10', '2026-02-18'
  ) RETURNING id INTO v_t003;

  -- t-004: Preparar presentación de ventas Q1
  INSERT INTO erp.tickets
    (title, description, status, priority, group_id, assigned_to, created_by, due_date, created_at)
  VALUES (
    'Preparar presentación de ventas Q1',
    'Slides con métricas del primer trimestre para el board meeting.',
    'Pendiente', 'Baja', v_g_sales, v_laura, v_laura, '2026-03-20', '2026-03-01'
  ) RETURNING id INTO v_t004;

  -- t-005: Corregir bug en formulario de contacto
  INSERT INTO erp.tickets
    (title, description, status, priority, group_id, assigned_to, created_by, due_date, created_at)
  VALUES (
    'Corregir bug en formulario de contacto',
    'El campo email no valida correctamente los dominios con TLD largo.',
    'Pendiente', 'Alta', v_g_alpha, v_carlos, v_superadmin, '2026-03-12', '2026-03-05'
  ) RETURNING id INTO v_t005;

  -- t-006: Actualizar guía de estilos
  INSERT INTO erp.tickets
    (title, description, status, priority, group_id, assigned_to, created_by, due_date, created_at)
  VALUES (
    'Actualizar guía de estilos',
    'Documentar la paleta de colores y tipografía actualizada del sistema.',
    'En Progreso', 'Media', v_g_design, v_ana, v_superadmin, '2026-03-18', '2026-03-02'
  ) RETURNING id INTO v_t006;

  -- ── Ticket comments (mirrors TicketService comments[]) ─────────────────────
  -- author_id maps from TicketComment.author (string name) to the user UUID

  -- t-001 / c1: author='Super Admin'
  INSERT INTO erp.ticket_comments (ticket_id, author_id, content, created_at)
  VALUES (v_t001, v_superadmin, 'Ya está listo el repo base.', '2026-02-16');

  -- t-003 / c2: author='Ana García'
  INSERT INTO erp.ticket_comments (ticket_id, author_id, content, created_at)
  VALUES (v_t003, v_ana, 'Revisar la validación del token.', '2026-03-05');

  -- t-006 / c3: author='Super Admin'
  INSERT INTO erp.ticket_comments (ticket_id, author_id, content, created_at)
  VALUES (v_t006, v_superadmin, 'Incluir los nuevos tokens del tema Lara.', '2026-03-03');

  -- ── Ticket history (mirrors TicketService history[]) ──────────────────────
  -- changedBy maps from TicketHistoryEntry.changedBy (string name) to UUID

  -- t-001 / h1, h2: changedBy='Carlos Méndez'
  INSERT INTO erp.ticket_history (ticket_id, field, old_value, new_value, changed_by, changed_at)
  VALUES (v_t001, 'status', 'Pendiente', 'En Progreso', v_carlos, '2026-02-17');

  INSERT INTO erp.ticket_history (ticket_id, field, old_value, new_value, changed_by, changed_at)
  VALUES (v_t001, 'status', 'En Progreso', 'Finalizado', v_carlos, '2026-02-25');

  -- t-002 / h3: changedBy='Ana García'
  INSERT INTO erp.ticket_history (ticket_id, field, old_value, new_value, changed_by, changed_at)
  VALUES (v_t002, 'status', 'Pendiente', 'En Progreso', v_ana, '2026-02-22');

  -- t-003 / h4, h5: changedBy='Super Admin'
  INSERT INTO erp.ticket_history (ticket_id, field, old_value, new_value, changed_by, changed_at)
  VALUES (v_t003, 'status', 'Pendiente', 'En Progreso', v_superadmin, '2026-02-20');

  INSERT INTO erp.ticket_history (ticket_id, field, old_value, new_value, changed_by, changed_at)
  VALUES (v_t003, 'status', 'En Progreso', 'Revisión', v_superadmin, '2026-03-04');

  -- t-006 / h6: changedBy='Ana García'
  INSERT INTO erp.ticket_history (ticket_id, field, old_value, new_value, changed_by, changed_at)
  VALUES (v_t006, 'status', 'Pendiente', 'En Progreso', v_ana, '2026-03-04');

END;
$$;

-- =============================================================================
-- END OF SCHEMA
--
-- HOW TO USE FROM GO (Chi)
-- -----------------------------------------------------------------------------
--
-- 1. Permission check middleware:
--    var ok bool
--    db.QueryRow(`SELECT erp.fn_has_permission($1, $2)`, userID, "ticket:create").Scan(&ok)
--
-- 2. Ticket update with history (always inside a tx):
--    tx.Exec(`SET LOCAL erp.current_user_id = $1`, userID)
--    tx.Exec(`UPDATE erp.tickets SET status=$1 WHERE id=$2`, newStatus, ticketID)
--    // history is written automatically by the trigger
--
-- 3. Login + session creation:
--    rows, _ := db.Query(`SELECT * FROM erp.fn_login($1, $2, $3)`, email, pass, ip)
--    // generate JWT in Go, then:
--    db.Exec(`SELECT erp.fn_create_session($1, $2, $3, $4)`, userID, hash(jwt), ip, userAgent)
--
-- 4. Logout:
--    db.Exec(`SELECT erp.fn_revoke_session($1)`, hash(jwt))
--
-- 5. Assign permissions (from user:manage-permissions protected endpoint):
--    db.Exec(`SELECT erp.fn_set_user_permissions($1, $2, $3)`,
--            targetUserID, pq.Array(permCodes), currentUserID)
--
-- 6. Register (self-registration):
--    db.QueryRow(`SELECT erp.fn_register_user($1, $2, $3)`, name, email, pass).Scan(&newID)
--
-- =============================================================================
