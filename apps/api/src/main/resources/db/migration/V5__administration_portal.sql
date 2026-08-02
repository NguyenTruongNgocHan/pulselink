ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('USER','MODERATOR','ADMIN','SUPER_ADMIN'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_status;
ALTER TABLE users ADD CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE','SUSPENDED','BANNED','DISABLED'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS metadata_jsonb JSONB;
CREATE INDEX IF NOT EXISTS idx_users_admin_filters ON users(role,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_queue ON reports(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs(created_at DESC);

-- Local-only bootstrap account. Change immediately outside local development.
-- email: admin@pulselink.local / password: password
INSERT INTO users(id, username, email, password_hash, display_name, status, email_verified, role)
VALUES ('00000000-0000-0000-0000-000000000001','admin','admin@pulselink.local',
        '$2a$10$Y.wU5YIEfBAd4fOaS7QC6OllcocQbKWg4DJImYkEYDKEgh0/SiCCm','PulseLink Admin','ACTIVE',true,'SUPER_ADMIN')
ON CONFLICT (email) DO UPDATE SET role='SUPER_ADMIN', status='ACTIVE';
