# Push to GitHub — Step-by-Step Guide

Since your GitHub PAT is confidential (smart!), here's how to push this project yourself.

---

## Method 1: Using GitHub Desktop (Easiest)

1. **Download** [GitHub Desktop](https://desktop.github.com/)
2. **Sign in** with your GitHub account
3. **File → Add local repository** → choose `/workspace/app-cjdt0pt39m9t`
4. Click **Publish repository** → name it `cultural-event-platform` → make public or private
5. Done!

---

## Method 2: Command Line (Terminal)

### Step 1: Open your terminal / command prompt

### Step 2: Navigate to the project folder
```bash
cd /workspace/app-cjdt0pt39m9t
```

### Step 3: Initialize git (if not already)
```bash
git init
git add .
git commit -m "Initial commit - Cultural Event Management Platform"
```

### Step 4: Create a repo on GitHub
- Go to [github.com/new](https://github.com/new)
- Name: `cultural-event-platform`
- Choose Public or Private
- **Do NOT** initialize with README (you already have one)

### Step 5: Link and push
```bash
git remote add origin https://github.com/YOUR_USERNAME/cultural-event-platform.git
git branch -M main
git push -u origin main
```

### Authentication
When prompted for a password, use a **Personal Access Token** (PAT):
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → check **repo** scope
3. Copy and paste the token as your password

> ⚠️ Never share this token with anyone (including me).

---

## What's Included

- React + Vite + TypeScript frontend
- shadcn/ui + Tailwind CSS
- Supabase backend (database, auth, Edge Functions)
- Full admin, organizer, and visitor role system
- Demo accounts and seeded data
- AI assistant integration
- Stripe payment support

---

## After Pushing

Anyone with your repo link can clone and run:

```bash
git clone https://github.com/YOUR_USERNAME/cultural-event-platform.git
cd cultural-event-platform
npm install
npm run dev
```

They'll need to connect their own Supabase project (see `.env.example`).
