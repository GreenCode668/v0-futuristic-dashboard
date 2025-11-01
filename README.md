# Finance Management SaaS

A modern, multi-tenant finance management system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Features
- **Multi-Tenant Architecture**: Complete data isolation by company/organization
- **Transaction Management**: Income, expenses, and transfers with full categorization
- **Account Management**: Support for banks, cards, cash, wallets, and investments
- **Categories & Tags**: Hierarchical category structure with custom tags
- **Real-time Dashboard**: Live KPIs, cash flow analysis, and insights
- **Recurring Transactions**: Automated scheduling for regular income/expenses
- **Budget Tracking**: Set and monitor budgets by category
- **Contact Management**: Track customers and suppliers
- **Project/Cost Center**: Organize transactions by projects
- **Attachments**: Upload receipts and documents
- **Import/Export**: CSV support (OFX coming soon)
- **Reconciliation**: Match and verify transactions
- **Audit Logs**: Complete activity tracking

### Security & Access Control
- **Row Level Security (RLS)**: Tenant-level data isolation at database level
- **Role-Based Access**: Owner, Admin, Editor, Viewer roles
- **Secure Authentication**: Powered by Supabase Auth
- **Audit Trail**: Track all user actions

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Shadcn/ui (Radix UI)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([https://supabase.com](https://supabase.com))

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Migrations

In your Supabase dashboard:

1. Go to SQL Editor
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query
5. Repeat for `supabase/migrations/002_row_level_security.sql`

Alternatively, if you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Main Tables

- **tenants**: Companies/organizations
- **users**: User profiles
- **user_tenants**: User-tenant relationships with roles
- **accounts**: Financial accounts (bank, cash, cards, etc.)
- **categories**: Hierarchical income/expense categories
- **transactions**: All financial transactions
- **contacts**: Customers and suppliers
- **projects**: Cost centers/projects
- **budgets**: Budget definitions
- **recurring_templates**: Recurring transaction templates
- **attachments**: File attachments for transactions
- **audit_logs**: Activity audit trail

### Views

- **dashboard_kpis**: Materialized view for fast dashboard metrics

## User Roles

- **Owner**: Full access, can delete tenant
- **Admin**: Manage users, settings, and all data
- **Editor**: Create and edit transactions, accounts, categories
- **Viewer**: Read-only access

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # UI components (Shadcn)
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase client & types
│   └── utils.ts          # Helper functions
├── supabase/
│   └── migrations/       # Database migration files
├── middleware.ts         # Auth middleware
└── dashboard.tsx         # Main dashboard (to be refactored)
```

## Development Roadmap

### Phase 1: Foundation ✅ COMPLETED
- [x] Database schema design
- [x] Supabase integration
- [x] Authentication setup
- [x] Row Level Security policies
- [x] User registration and login UI
- [x] Tenant creation workflow (onboarding)

### Phase 2: Core Features ✅ COMPLETED
- [x] Account management CRUD
- [x] Transaction CRUD (income, expense, transfer)
- [x] Category management
- [x] Dashboard with real-time KPIs
- [x] Transaction filtering and search
- [x] Sidebar navigation

### Phase 3: Advanced Features ✅ COMPLETED
- [x] Recurring transactions
- [x] Reports and analytics with charts
- [x] Settings page
- [ ] Budget tracking
- [ ] CSV import/export
- [ ] Attachment uploads (Supabase Storage)
- [ ] Mobile responsive UI improvements

### Phase 4: Enterprise Features (Planned)
- [ ] Multi-currency support
- [ ] Advanced reporting (PDF export)
- [ ] Team collaboration
- [ ] API access
- [ ] Webhooks
- [ ] Subscription management

## API Routes (Planned)

```
/api/transactions       # CRUD operations
/api/accounts          # Account management
/api/categories        # Category management
/api/dashboard         # Dashboard KPIs
/api/reports          # Report generation
/api/import           # Import transactions
/api/export           # Export data
```

## Contributing

This is a private project. Contributions are managed internally.

## License

Proprietary - All rights reserved

## Support

For support, contact your system administrator.

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
supabase db push     # Push migrations
supabase db pull     # Pull schema
supabase gen types typescript --project-id YOUR_ID > lib/supabase/database.types.ts
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for admin operations) | No |

## Notes

- All monetary amounts are stored as `DECIMAL(15, 2)` for precision
- Timestamps use `TIMESTAMPTZ` for proper timezone handling
- UUIDs are used for all primary keys
- Multi-tenant isolation is enforced at the database level using RLS
- Account balances are automatically calculated via database triggers
