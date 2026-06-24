# Cultural Event Management Platform

A comprehensive cultural events management system supporting event creation, venue & artist management, ticket reservations, role-based access control, and AI-powered assistance.

## Features

- **Role-Based Access**: Admin, Organizer, and Visitor roles with granular permissions
- **Event Management**: Create, edit, publish events with rich descriptions, images, and ticketing
- **Venue & Artist Directory**: Full CRUD with real image support via Supabase Storage
- **Ticket System**: General, VIP, and Early Bird ticket types with reservation tracking
- **Payment Integration**: Stripe checkout for paid reservations
- **AI Assistant**: Built-in LLM-powered chat for event recommendations and Q&A
- **Dark Mode**: Fully supported with system preference detection
- **Responsive Design**: Desktop-first with mobile sidebar navigation

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime, Storage)
- **Payments**: Stripe (via Supabase Edge Functions)
- **AI**: Gemini 2.5 Flash (via SSE streaming)

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components (shadcn/ui + custom)
│   ├── components/layouts/  # AppLayout with sidebar + mobile navigation
│   ├── contexts/       # AuthContext, ThemeProvider
│   ├── hooks/          # useAuth, useTheme, useMediaQuery
│   ├── pages/          # Route pages (Dashboard, Events, Venues, etc.)
│   ├── services/       # Supabase API wrappers
│   ├── types/          # TypeScript definitions
│   └── lib/            # Utility functions
├── supabase/
│   └── functions/      # Edge Functions (auth, payment, AI)
├── public/             # Static assets
└── .env.example        # Environment variable template
```

## Quick Start

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A Supabase project (free tier works)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/cultural-event-platform.git
cd cultural-event-platform

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase project URL and anon key

# 4. Start dev server
npm run dev
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/` to create tables
3. Deploy Edge Functions in `supabase/functions/`
4. Update `.env` with your project credentials

See `GITHUB_PUSH.md` for detailed push instructions.

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@Cult2026!#Ev` |
| Organizer | `organizer_demo` | `Organizer@Demo2026!` |
| Visitor | `visitor_demo` | `Visitor@Demo2026!` |

## License

MIT
