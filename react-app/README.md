# KeyDrop Simulator - React Version

KeyDrop case opening simulator built with React, TypeScript, Vite, and Supabase.

## Features

- 🎮 Case opening with roulette animation
- 💰 Virtual balance management
- 📦 Inventory system
- 🔄 Item upgrader
- 🔐 User authentication
- 🎨 Modern UI with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start development server:
```bash
npm run dev
```

## Database Schema

The application uses Supabase with the following tables:
- `users` - User accounts
- `sessions` - Login sessions
- `items` - User inventory items
- `global_inventory_items` - Available items
- `cases` - Available cases
- `case_drops` - Possible drops from cases

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend & Database
- **Zustand** - State management
- **React Router** - Routing
