-- Tighten domain invariants without rewriting previous Flyway history.
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_client_message_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_messages_sender_conversation_client
  ON messages(sender_id, conversation_id, client_message_id)
  WHERE client_message_id IS NOT NULL;

ALTER TABLE friendships DROP CONSTRAINT IF EXISTS chk_friendship_requester_in_pair;
ALTER TABLE friendships ADD CONSTRAINT chk_friendship_requester_in_pair
  CHECK (requester_id IN (user_low_id, user_high_id));

ALTER TABLE reports DROP CONSTRAINT IF EXISTS chk_reports_target_type;
ALTER TABLE reports ADD CONSTRAINT chk_reports_target_type
  CHECK (target_type IN ('USER', 'MESSAGE', 'GROUP'));
ALTER TABLE reports DROP CONSTRAINT IF EXISTS chk_reports_status;
ALTER TABLE reports ADD CONSTRAINT chk_reports_status
  CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'));
ALTER TABLE reports DROP CONSTRAINT IF EXISTS chk_reports_single_target;
ALTER TABLE reports ADD CONSTRAINT chk_reports_single_target CHECK (
  (target_type='USER' AND target_user_id IS NOT NULL
    AND target_message_id IS NULL AND target_conversation_id IS NULL)
  OR
  (target_type='MESSAGE' AND target_user_id IS NULL
    AND target_message_id IS NOT NULL AND target_conversation_id IS NOT NULL)
  OR
  (target_type='GROUP' AND target_user_id IS NULL
    AND target_message_id IS NULL AND target_conversation_id IS NOT NULL)
);

ALTER TABLE report_comments DROP CONSTRAINT IF EXISTS chk_report_comment_visibility;
ALTER TABLE report_comments ADD CONSTRAINT chk_report_comment_visibility
  CHECK (visibility IN ('REPORTER_VISIBLE', 'STAFF_ONLY'));

ALTER TABLE message_attachments ALTER COLUMN conversation_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender_conversation_created
  ON messages(sender_id, conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_assignee_queue
  ON reports(assignee_id, status, updated_at DESC);
