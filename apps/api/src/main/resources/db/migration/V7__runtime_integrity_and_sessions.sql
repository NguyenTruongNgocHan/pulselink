-- Runtime integrity, session metadata, private storage ownership, and search indexes.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_reason VARCHAR(500);

ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS family_id UUID;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS device_name VARCHAR(160) NOT NULL DEFAULT 'Unknown device';
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS browser VARCHAR(120) NOT NULL DEFAULT 'Unknown browser';
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS operating_system VARCHAR(120) NOT NULL DEFAULT 'Unknown operating system';
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS ip_address VARCHAR(64) NOT NULL DEFAULT 'Unknown';
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS location VARCHAR(160);
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
UPDATE refresh_tokens SET family_id = id WHERE family_id IS NULL;
ALTER TABLE refresh_tokens ALTER COLUMN family_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active_sessions
  ON refresh_tokens(user_id, revoked, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS moderation_reason VARCHAR(500);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE message_attachments ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
ALTER TABLE message_attachments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE message_attachments a
SET conversation_id = m.conversation_id
FROM messages m
WHERE a.message_id = m.id AND a.conversation_id IS NULL;
ALTER TABLE message_attachments DROP CONSTRAINT IF EXISTS chk_message_attachment_status;
ALTER TABLE message_attachments ADD CONSTRAINT chk_message_attachment_status
  CHECK (status IN ('STAGED','READY','DELETED'));
CREATE INDEX IF NOT EXISTS idx_attachments_conversation ON message_attachments(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_staged_cleanup ON message_attachments(status, created_at);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_active
  ON conversation_participants(user_id, conversation_id) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_friendships_requester_status ON friendships(requester_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_created ON reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_comments_report ON report_comments(report_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_full_text
  ON messages USING GIN (to_tsvector('simple', coalesce(content, '')))
  WHERE deleted_at IS NULL;

-- Prevent duplicate unresolved reports for the same reporter and target.
CREATE UNIQUE INDEX IF NOT EXISTS uq_open_report_user_target
  ON reports(reporter_id, target_user_id)
  WHERE target_type='USER' AND status IN ('OPEN','IN_REVIEW') AND target_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_open_report_message_target
  ON reports(reporter_id, target_message_id)
  WHERE target_type='MESSAGE' AND status IN ('OPEN','IN_REVIEW') AND target_message_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_open_report_group_target
  ON reports(reporter_id, target_conversation_id)
  WHERE target_type='GROUP' AND status IN ('OPEN','IN_REVIEW') AND target_conversation_id IS NOT NULL;
