CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_low_id UUID NOT NULL REFERENCES users(id),
  user_high_id UUID NOT NULL REFERENCES users(id),
  requester_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','ACCEPTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_friend_pair CHECK (user_low_id < user_high_id), UNIQUE(user_low_id,user_high_id)
);
CREATE TABLE user_blocks (
  blocker_id UUID NOT NULL REFERENCES users(id), blocked_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(blocker_id,blocked_id),
  CONSTRAINT chk_block_self CHECK(blocker_id <> blocked_id)
);
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), type VARCHAR(10) NOT NULL CHECK(type IN('DIRECT','GROUP')),
  name VARCHAR(100), avatar_object_key VARCHAR(500), direct_key VARCHAR(80) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN('ACTIVE','CLOSED')),
  created_by UUID REFERENCES users(id), latest_message_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id), role VARCHAR(10) NOT NULL DEFAULT 'MEMBER' CHECK(role IN('MEMBER','ADMIN')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), left_at TIMESTAMPTZ, last_read_message_id UUID,
  PRIMARY KEY(conversation_id,user_id)
);
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id), client_message_id VARCHAR(80), content TEXT,
  edited_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sender_id,client_message_id)
);
ALTER TABLE conversations ADD CONSTRAINT fk_conversation_latest_message FOREIGN KEY(latest_message_id) REFERENCES messages(id);
ALTER TABLE conversation_participants ADD CONSTRAINT fk_participant_last_read FOREIGN KEY(last_read_message_id) REFERENCES messages(id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id,created_at);
CREATE TABLE message_attachments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
 uploader_id UUID NOT NULL REFERENCES users(id), object_key VARCHAR(500) NOT NULL UNIQUE, file_name VARCHAR(255) NOT NULL,
 mime_type VARCHAR(120) NOT NULL, size_bytes BIGINT NOT NULL CHECK(size_bytes <= 10485760), status VARCHAR(10) NOT NULL DEFAULT 'READY', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE message_reactions (
 message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES users(id), emoji VARCHAR(16) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(message_id,user_id)
);
CREATE TABLE message_read_receipts (
 message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES users(id), seen_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(message_id,user_id)
);
CREATE TABLE push_subscriptions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id), endpoint TEXT NOT NULL UNIQUE,
 p256dh TEXT NOT NULL, auth_secret TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE reports (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id UUID NOT NULL REFERENCES users(id), target_type VARCHAR(10) NOT NULL,
 target_user_id UUID REFERENCES users(id), target_message_id UUID REFERENCES messages(id), target_conversation_id UUID REFERENCES conversations(id),
 reason VARCHAR(80) NOT NULL, description TEXT, status VARCHAR(20) NOT NULL DEFAULT 'OPEN', outcome VARCHAR(80), resolution_summary TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE report_evidence (report_id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE, evidence_jsonb JSONB NOT NULL, content_hash VARCHAR(128), captured_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE report_comments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE, author_id UUID NOT NULL REFERENCES users(id), visibility VARCHAR(30) NOT NULL DEFAULT 'REPORTER_VISIBLE', body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id), type VARCHAR(50) NOT NULL, title VARCHAR(160) NOT NULL, body TEXT NOT NULL, payload_jsonb JSONB, read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX idx_notifications_user ON notifications(user_id,read_at,created_at DESC);
CREATE TABLE admin_audit_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_user_id UUID REFERENCES users(id), action VARCHAR(80) NOT NULL, target_type VARCHAR(40), target_id UUID, reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
