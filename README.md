# MetaLearn - AI-Powered Meta-Learning Platform

MetaLearn is an intelligent learning companion that helps you optimize your study sessions through AI-powered insights, voice coaching, and personalized analytics.

## Features

- 🧠 **AI-Powered Insights**: Get personalized learning recommendations based on your study patterns
- 🎯 **Session Tracking**: Log and analyze your study sessions with detailed metrics
- 📊 **Advanced Analytics**: Visualize your learning progress with interactive dashboards
- 🎤 **Voice Coaching**: Receive AI-generated voice feedback on your performance
- 🔬 **The Lab**: Conduct learning experiments and track confidence levels
- 📈 **Progress Timeline**: Monitor your learning journey over time
- 👤 **User Profiles**: Track your rank, achievements, and learning DNA

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter API (Meta Llama models)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom dark mode theme

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- An OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Aditya0292/WEB---METALEARN.git
cd WEB---METALEARN
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys and configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database:
   - Run the SQL schema in `schema.sql` in your Supabase SQL editor
   - This will create all necessary tables and functions

5. Configure Supabase Authentication:
   - Go to Authentication → Providers → Email
   - Disable "Confirm email" if you want direct login (recommended for development)
   - Add `http://localhost:3000/email-confirmed` to Redirect URLs

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
metalearn-ai/
├── components/          # Reusable React components
├── lib/                 # Utility functions and API clients
├── pages/               # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   ├── auth.js         # Authentication page
│   ├── dashboard.js    # Main dashboard
│   ├── experiments.js  # The Lab page
│   ├── insights.js     # AI insights page
│   └── ...
├── public/             # Static assets
├── styles/             # Global styles and Tailwind config
└── schema.sql          # Database schema
```

## Key Features Explained

### Dashboard
- View your learning metrics (Neural Speed, Retention, Consistency, Recovery)
- See recent session history
- Access quick stats and AI insights

### The Lab
- Conduct learning experiments
- Rate your confidence levels
- Track performance across different topics

### AI Insights
- Get personalized learning advice
- Analyze performance by topic
- Receive AI-generated coaching

### Progress Timeline
- Visualize your learning journey
- Track sessions over time
- Monitor consistency and growth

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `OPENROUTER_API_KEY` | Your OpenRouter API key for AI features | Yes |
| `NEXT_PUBLIC_APP_URL` | Your application URL | No (defaults to localhost) |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

**Aditya Hawaldar**
- LinkedIn: [Aditya Havaldar](https://www.linkedin.com/in/aditya-havaldar-205951288/)

## Acknowledgments

- Built with Next.js and Supabase
- AI powered by OpenRouter and Meta Llama models
- Design inspired by modern learning platforms

---

© 2025 MetaLearn. Neural Design by Aditya Hawaldar.
