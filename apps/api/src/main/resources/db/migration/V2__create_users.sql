CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    display_name VARCHAR(100),
    avatar_object_key VARCHAR(500),

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),

    CONSTRAINT chk_users_username_length
        CHECK (char_length(username) BETWEEN 3 AND 30),

    CONSTRAINT chk_users_status
        CHECK (status IN ('ACTIVE', 'DISABLED'))
);

CREATE INDEX idx_users_created_at
    ON users (created_at);