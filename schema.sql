-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    time_spent_minutes INTEGER CHECK (time_spent_minutes >= 5 AND time_spent_minutes <= 360),
    confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 5),
    errors_made BOOLEAN DEFAULT FALSE,
    revision_done BOOLEAN DEFAULT FALSE,
    session_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(session_timestamp);

-- TABLE 2: user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    learning_speed FLOAT,
    retention_score FLOAT,
    consistency_score FLOAT,
    error_recovery_rate FLOAT,
    optimal_session_duration INTEGER,
    total_sessions INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 3: coaching_history
CREATE TABLE IF NOT EXISTS coaching_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    insight_text TEXT,
    audio_url TEXT,
    strategy_recommended TEXT,
    pattern_detected TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaching_user_id ON coaching_history(user_id);

-- TABLE 4: experiments (The Lab)
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    hypothesis TEXT,
    variable_a TEXT NOT NULL,
    variable_b TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
    scores_a JSONB DEFAULT '[]'::jsonb,
    scores_b JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_experiments_user_id ON experiments(user_id);
