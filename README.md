# Kwegofx - P2P Forex Platform

Kwegofx is a modern, secure, and scalable Peer-to-Peer (P2P) Forex trading platform. It allows users to exchange NGN (Nigerian Naira) with other major currencies like USD, CAD, GBP, and EUR.

## ✨ Features

*   **Multi-Currency Wallets:** Manage funds in NGN, USD, CAD, GBP, EUR.
*   **P2P Marketplace:** Create, browse, and accept buy/sell offers.
*   **Secure Authentication:** Email/password login with 2FA support.
*   **KYC Verification:** Secure document upload and verification process.
*   **Transaction History:** Detailed logs of all platform activities.
*   **Admin Panel:** Tools for platform management and oversight.
*   **Dark Mode:** User-selectable dark and light themes.
*   **Responsive Design:** Mobile-first and fully responsive layout.

## ቴክኖሎጂ ቁልል

*   **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui
*   **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
*   **Styling:** Tailwind CSS
*   **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm/yarn/pnpm
*   Supabase Account & Project
*   Vercel Account

### Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # If needed for server-side operations
\`\`\`

You can get these from your Supabase project settings.

### Installation

1.  **Clone the repository (or download from v0):**
    \`\`\`bash
    # If downloaded from v0, use the v0 CLI or manual setup
    # Example: npx @v0/cli add <component_id_or_url>
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    \`\`\`

3.  **Set up Supabase Database:**
    *   Run the SQL schema provided in `belfx-schema.sql` (or as executed via v0) in your Supabase SQL Editor.
    *   Configure Supabase Storage: Create buckets for `kyc-documents` and `avatars` with appropriate access policies.

4.  **Run the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

\`\`\`
belfx-platform/
├── app/                      # Next.js App Router (pages, layouts)
│   ├── (auth)/               # Auth-related pages (login, register)
│   ├── (main)/               # Main app pages (dashboard, wallets)
│   ├── admin/                # Admin panel pages
│   ├── api/                  # API Routes (Supabase Edge Functions can also be used)
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── components/               # Shared UI components
│   ├── auth/                 # Auth-specific components
│   ├── core/                 # Core UI elements (buttons, cards)
│   ├── layout/               # Layout components (navbar, sidebar)
│   └── ui/                   # shadcn/ui components (pre-built)
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions, API clients
│   ├── api.ts                # API call functions
│   ├── constants.ts          # App constants
│   ├── helpers.ts            # Helper functions
│   └── supabase/             # Supabase client instances (client, server)
├── public/                   # Static assets
├── styles/                   # Additional global styles or themes
├── types/                    # TypeScript type definitions
├── tailwind.config.ts        # Tailwind CSS configuration
├── next.config.mjs           # Next.js configuration
└── tsconfig.json             # TypeScript configuration
\`\`\`

## 🎨 Design System

*   **UI Library:** shadcn/ui
*   **Styling:** Tailwind CSS
*   **Typography:** Inter
*   **Color Scheme:**
    *   Primary Background (Dark): Deep Navy (`#0A192F`)
    *   Text (Dark): White/Light Gray
    *   Primary Background (Light): White/Off-White
    *   Text (Light): Dark Navy/Black
    *   Accent 1 (Gold): `#F0B90B`
    *   Accent 2 (Green): `#2EBD85`
*   **Icons:** Lucide React

## 🔒 Security

*   Row Level Security (RLS) on Supabase tables.
*   Input validation (frontend and backend).
*   Secure handling of API keys and secrets using environment variables.
*   CSRF protection (Next.js default).
*   HTTPS enforced by Vercel.

## 🤝 Contributing

Contributions are welcome! Please follow standard Git practices (fork, feature branch, pull request).

## 📄 License

This project is licensed under the MIT License - see the LICENSE.md file for details (if applicable).
