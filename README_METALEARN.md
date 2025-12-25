# MetaLearn AI

A meta-learning coach that analyzes user study behavior and provides AI-powered personalized coaching via voice.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   - Run the SQL in `schema.sql` in your Supabase SQL Editor.
   - Create a `.env.local` file with:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Features**:
   - **Log Session**: Tracks study time, confidence, and errors.
   - **Dashboard**: Radar chart of Learning Vector + Line chart of Progress.
   - **AI Coaching**: Mocked integration with Claude/ElevenLabs (see `lib/claudeAPI.js`).

## Architecture

- **Pages**: `/pages/index.js` (Landing), `/pages/dashboard.js` (App).
- **Components**: `SessionLogger`, `VoiceCoachingPlayer`, `LearningVectorDashboard`, `ProgressTimeline`.
- **API**: `/api/log-session`, `/api/generate-coaching`, `/api/analyze-learning`.
- **Styling**: Tailwind CSS + Framer Motion (Glassmorphism).

## Note on Windows
If you encounter `symlink` errors during build with Turbopack, ensure you have Developer Mode enabled or run as Administrator. Alternatively, stick to `npm run dev`.
