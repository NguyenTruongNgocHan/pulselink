ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(160);
ALTER TABLE users ADD COLUMN IF NOT EXISTS discoverable BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_friend_requests BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_direct_messages BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS send_read_receipts BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_typing_indicators BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) NOT NULL DEFAULT 'FRIENDS';
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_last_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS saved_messages (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,message_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_messages_user ON saved_messages(user_id,created_at DESC);

-- Seed realistic local demo accounts and data. Password for every account: password
INSERT INTO users(id,username,email,password_hash,display_name,bio,status,email_verified,role)
VALUES
('10000000-0000-0000-0000-000000000001','sarahchen','sarah@pulselink.local','$2a$10$Y.wU5YIEfBAd4fOaS7QC6OllcocQbKWg4DJImYkEYDKEgh0/SiCCm','Sarah Chen','Product designer who enjoys calm, focused conversations.','ACTIVE',true,'USER'),
('10000000-0000-0000-0000-000000000002','emmawilson','emma@pulselink.local','$2a$10$Y.wU5YIEfBAd4fOaS7QC6OllcocQbKWg4DJImYkEYDKEgh0/SiCCm','Emma Wilson','Creative thinker building thoughtful digital products.','ACTIVE',true,'USER'),
('10000000-0000-0000-0000-000000000003','michaeltorres','michael@pulselink.local','$2a$10$Y.wU5YIEfBAd4fOaS7QC6OllcocQbKWg4DJImYkEYDKEgh0/SiCCm','Michael Torres','Engineering lead and weekend photographer.','ACTIVE',true,'USER'),
('10000000-0000-0000-0000-000000000004','miannguyen','mia@pulselink.local','$2a$10$Y.wU5YIEfBAd4fOaS7QC6OllcocQbKWg4DJImYkEYDKEgh0/SiCCm','Mia Nguyen','Researcher, reader and quiet coffee-shop regular.','ACTIVE',true,'USER'),
('10000000-0000-0000-0000-000000000005','jordanlee','jordan@pulselink.local','$2a$10$Y.wU5YIEfBAd4fOaS7QC6OllcocQbKWg4DJImYkEYDKEgh0/SiCCm','Jordan Lee','Brand designer and illustrator.','ACTIVE',true,'USER'),
('10000000-0000-0000-0000-000000000006','alexjohnson','alex@pulselink.local','$2a$10$Y.wU5YIEfBAd4fOaS7QC6OllcocQbKWg4DJImYkEYDKEgh0/SiCCm','Alex Johnson','Frontend engineer and accessibility advocate.','ACTIVE',true,'USER'),
('10000000-0000-0000-0000-000000000007','moderator','moderator@pulselink.local','$2a$10$Y.wU5YIEfBAd4fOaS7QC6OllcocQbKWg4DJImYkEYDKEgh0/SiCCm','PulseLink Moderator','Community safety moderator.','ACTIVE',true,'MODERATOR')
ON CONFLICT (email) DO NOTHING;

INSERT INTO friendships(user_low_id,user_high_id,requester_id,status)
VALUES
('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','ACCEPTED'),
('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','ACCEPTED'),
('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004','ACCEPTED'),
('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000005','PENDING')
ON CONFLICT DO NOTHING;

INSERT INTO conversations(id,type,name,direct_key,created_by,created_at,updated_at)
VALUES
('20000000-0000-0000-0000-000000000001','DIRECT',NULL,'10000000-0000-0000-0000-000000000001:10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',now()-interval '5 day',now()),
('20000000-0000-0000-0000-000000000002','GROUP','Weekend Plans',NULL,'10000000-0000-0000-0000-000000000001',now()-interval '20 day',now()-interval '12 minute'),
('20000000-0000-0000-0000-000000000003','GROUP','Design Circle',NULL,'10000000-0000-0000-0000-000000000002',now()-interval '40 day',now()-interval '1 hour')
ON CONFLICT DO NOTHING;

INSERT INTO conversation_participants(conversation_id,user_id,role)
VALUES
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','MEMBER'),
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','MEMBER'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','ADMIN'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','MEMBER'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','MEMBER'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','MEMBER'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','MEMBER'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','ADMIN'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000005','MEMBER')
ON CONFLICT DO NOTHING;

INSERT INTO messages(id,conversation_id,sender_id,client_message_id,content,created_at)
VALUES
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','seed-1','Hey Sarah! That golden-hour photo was beautiful.',now()-interval '25 minute'),
('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','seed-2','Thank you! We found a quiet spot near the river just before sunset.',now()-interval '23 minute'),
('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','seed-3','That photo made my day ✨',now()-interval '20 minute'),
('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','seed-4','Saturday works for me. Should we meet near the station first?',now()-interval '12 minute'),
('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000005','seed-5','Final color exploration is ready for review.',now()-interval '1 hour')
ON CONFLICT DO NOTHING;

UPDATE conversations SET latest_message_id='30000000-0000-0000-0000-000000000003' WHERE id='20000000-0000-0000-0000-000000000001';
UPDATE conversations SET latest_message_id='30000000-0000-0000-0000-000000000004' WHERE id='20000000-0000-0000-0000-000000000002';
UPDATE conversations SET latest_message_id='30000000-0000-0000-0000-000000000005' WHERE id='20000000-0000-0000-0000-000000000003';

INSERT INTO notifications(user_id,type,title,body,payload_jsonb,created_at)
VALUES
('10000000-0000-0000-0000-000000000001','REPORT_RESOLVED','Your report was resolved','The reported message in Design Circle was removed.','{"reportId":"40000000-0000-0000-0000-000000000001"}',now()-interval '5 minute'),
('10000000-0000-0000-0000-000000000001','SECURITY','New sign-in detected','A new session signed in from Chrome on Windows.','{}',now()-interval '22 minute'),
('10000000-0000-0000-0000-000000000001','GROUP_CLOSED','Weekend Plans was closed','You can still view previous messages, but no new activity is allowed.','{"conversationId":"20000000-0000-0000-0000-000000000002"}',now()-interval '1 hour')
ON CONFLICT DO NOTHING;

INSERT INTO reports(id,reporter_id,target_type,target_user_id,target_message_id,target_conversation_id,reason,description,status,outcome,resolution_summary,created_at,updated_at)
VALUES
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','MESSAGE',NULL,'30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000003','Hate speech','The message contained insulting language.','RESOLVED','CONTENT_REMOVED','The reported content was removed.',now()-interval '2 day',now()-interval '1 day'),
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','USER','10000000-0000-0000-0000-000000000006',NULL,NULL,'Harassment','Repeated unwanted messages.','OPEN',NULL,NULL,now()-interval '2 hour',now()-interval '2 hour')
ON CONFLICT DO NOTHING;

INSERT INTO saved_messages(user_id,message_id)
VALUES
('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000004'),
('10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;
