# Quick Start Guide - FinanceOS

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Supabase (2 minutes)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - Project name: `finance-os` (or any name)
   - Database password: (create a strong password)
   - Region: Choose closest to you
4. Click "Create new project" and wait ~2 minutes

### Step 2: Run Database Migrations (2 minutes)

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `supabase/migrations/001_initial_schema.sql` from this project
4. Copy and paste the entire content into the SQL editor
5. Click **Run** (bottom right)
6. Repeat for `supabase/migrations/006_complete_rls_reset.sql`

### Step 3: Configure Environment (1 minute)

1. In Supabase dashboard, go to **Project Settings** > **API**
2. Copy your:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

3. In your project, create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

### Step 4: Install & Run (1 minute)

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or 3000 if available)

## 🎯 First Steps in the App

### 1. Create Your Account
- Click **Sign Up**
- Enter your email and password
- Full name (optional)
- Click **Sign Up**

### 2. Complete Onboarding
**Step 1: Company Information**
- Company Name: Your company name
- Workspace URL: auto-generated slug
- Default Currency: USD (or your preference)
- Click **Continue**

**Step 2: Initial Account**
- Account Name: e.g., "Main Bank Account"
- Account Type: Bank Account
- Initial Balance: Your starting balance
- Click **Complete Setup**

### 3. Explore the Dashboard
You'll land on the dashboard showing:
- Total Balance
- Income/Expense for this month
- Quick action buttons
- Recent transactions (empty for now)

### 4. Create Your First Transaction

**Add an Expense:**
1. Click **Dashboard** in sidebar
2. Click **Add Expense** button
3. Fill in:
   - Amount: 50.00
   - Date: Today
   - Description: Coffee
   - Account: Your account
   - Category: Food & Dining
4. Click **Create**

**Add an Income:**
1. Click **Add Income** button
2. Fill in:
   - Amount: 1000.00
   - Date: Today
   - Description: Salary
   - Account: Your account
   - Category: Salary
3. Click **Create**

### 5. Explore Other Features

**Accounts:**
- Click **Accounts** in sidebar
- Add different account types (Cash, Credit Card, etc.)
- Set colors for visual organization

**Categories:**
- Click **Categories** in sidebar
- View default categories
- Create custom categories with emojis and colors

**Transactions:**
- Click **Transactions** in sidebar
- View all transactions
- Use filters (type, search, date range)
- Click any transaction to edit

**Reports:**
- Click **Reports** in sidebar
- View charts and analytics
- Change time period (Week/Month/Quarter/Year)
- See spending by category

**Recurring:**
- Click **Recurring** in sidebar
- Set up automatic transactions
- Monthly rent, weekly salary, etc.
- Pause/resume as needed

## 📱 Navigation

```
Sidebar Menu:
├── Dashboard       → Overview & quick actions
├── Accounts        → Manage bank accounts, cash, cards
├── Transactions    → All income, expenses, transfers
├── Categories      → Organize with custom categories
├── Reports         → Analytics & charts
├── Recurring       → Automate regular transactions
└── Settings        → Profile & workspace settings
```

## 🎨 Pro Tips

1. **Color Code Your Accounts**
   - Use different colors for different account types
   - Makes visual scanning easier

2. **Use Categories Effectively**
   - Create specific categories for better insights
   - Use emojis for quick recognition

3. **Set Up Recurring Transactions Early**
   - Add monthly bills, salary, subscriptions
   - Saves time and ensures nothing is forgotten

4. **Check Reports Regularly**
   - Weekly check helps stay on budget
   - Identify spending patterns

5. **Use Transfers for Account Management**
   - Track money movement between accounts
   - Keeps balances accurate

## 🔧 Troubleshooting

### "Authentication Error"
- Check `.env.local` file exists
- Verify Supabase URL and key are correct
- Restart dev server after changing env vars

### "Permission Denied" or "RLS Policy"
- Make sure you ran migration `006_complete_rls_reset.sql`
- Check in Supabase SQL Editor if policies exist

### "No transactions showing"
- Create your first transaction
- Check account filter isn't excluding data
- Verify tenant was created during onboarding

### Port 3000 Already in Use
- App will automatically use port 3001
- Or stop other processes using port 3000
- Or change port: `npm run dev -- -p 3002`

## 📞 Need Help?

1. Check [README.md](README.md) for detailed documentation
2. Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
3. Inspect browser console for error messages
4. Check Supabase logs in dashboard

## 🎉 You're All Set!

You now have a fully functional finance management system. Start tracking your income and expenses, and gain insights into your financial health!

---

**Next Steps:**
- Customize categories for your needs
- Import historical transactions
- Set up all your accounts
- Create recurring transactions
- Invite team members (coming soon)
