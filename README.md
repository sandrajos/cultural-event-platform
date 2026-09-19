# Cultural Event Management Platform

A full-stack cultural event management platform supporting event creation, venue and artist management, ticket reservations, role-based access control, payments, and AI-powered assistance.

## 🚀 Features

* **Role-Based Access**: Admin, Organizer, and Visitor roles with granular permissions
* **Event Management**: Create, edit, and publish events with descriptions, images, and ticketing
* **Venue & Artist Management**: CRUD operations with image support through Supabase Storage
* **Ticket System**: General, VIP, and Early Bird ticket types with reservation tracking
* **Payment Integration**: Stripe checkout for paid reservations
* **AI Assistant**: LLM-powered chat for event recommendations and Q&A
* **Authentication**: User authentication and role-based authorization
* **Dark Mode**: System preference support
* **Responsive UI**: Responsive application layout for different screen sizes

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
* **Backend**: Supabase, PostgreSQL, Edge Functions
* **Authentication**: Supabase Auth
* **Storage**: Supabase Storage
* **Realtime**: Supabase Realtime
* **Payments**: Stripe via Supabase Edge Functions
* **AI**: Gemini 2.5 Flash
* **CI/CD**: GitHub Actions
* **Package Manager**: pnpm

## 🏗️ Project Structure

```text
├── src/
│   ├── components/          # Reusable UI components
│   ├── components/layouts/  # Application layouts and navigation
│   ├── contexts/            # Authentication and theme providers
│   ├── hooks/               # Reusable React hooks
│   ├── pages/               # Application pages
│   ├── services/            # Supabase API integrations
│   ├── types/               # TypeScript definitions
│   └── lib/                 # Shared utilities
├── supabase/
│   └── functions/           # Supabase Edge Functions
├── public/                  # Static assets
└── .env.example             # Environment variable template
```

## 🚀 Quick Start

### Prerequisites

* Node.js 20+
* pnpm 9+
* A Supabase project

### Installation

Clone the repository:

```bash
git clone https://github.com/sandrajos/cultural-event-platform.git
cd cultural-event-platform
```

Install dependencies:

```bash
pnpm install
```

Create the environment configuration:

```bash
cp .env.example .env
```

Configure the required Supabase and application environment variables in `.env`.

Start the development server:

```bash
pnpm run dev
```

## 🗄️ Supabase Setup

1. Create a Supabase project.
2. Configure the required environment variables.
3. Apply the database migrations in the `supabase/` directory.
4. Deploy the required Edge Functions.
5. Configure the application with the appropriate Supabase credentials.

**Never commit passwords, API keys, service-role keys, Stripe secrets, or other sensitive credentials to the repository.**

## 🔐 Demo Accounts

Demo credentials are **not stored in this public repository**.

For local or demonstration environments, create test users through the configured authentication provider.

## 💳 Payments

The application includes Stripe payment functionality through Supabase Edge Functions.

Stripe credentials must be configured through environment variables and must not be committed to Git.

## 🤖 AI Assistant

The application includes an AI-powered assistant for event recommendations and user questions.

AI credentials and configuration should be provided through environment variables.

## 🔄 Continuous Integration

GitHub Actions validates the frontend application on pushes and pull requests targeting `main`.

The CI workflow:

1. Checks out the repository
2. Installs pnpm
3. Configures Node.js 20
4. Installs dependencies using the lockfile
5. Builds the application

## 🌐 Deployment

The project has previously been deployed using Vercel.

Deployment requires the appropriate environment variables for Supabase and any enabled third-party integrations.

## 🎯 Portfolio Context

This project demonstrates practical full-stack and cloud-integrated application development, including:

* React and TypeScript
* Supabase and PostgreSQL
* Authentication and authorization
* Role-based access control
* Serverless Edge Functions
* API and third-party service integration
* Payment integration
* AI integration
* Environment and secret management
* CI/CD with GitHub Actions

## 📄 License

MIT
