// Comprehensive mock data for Finance Management SaaS

export const generateMockDashboardData = () => {
  // Monthly trend data (last 30 days)
  const generateMonthlyTrend = () => {
    const data = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayOfWeek = date.getDay()

      // Higher income on weekdays, especially Fridays (payday)
      const baseIncome = dayOfWeek === 5 ? 1200 : dayOfWeek === 0 || dayOfWeek === 6 ? 50 : 200
      const income = baseIncome + Math.random() * 300

      // Higher expenses on weekends
      const baseExpense = dayOfWeek === 0 || dayOfWeek === 6 ? 300 : 150
      const expense = baseExpense + Math.random() * 200

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: Math.round(income),
        expense: Math.round(expense),
      })
    }
    return data
  }

  // Weekly trend (last 7 days)
  const generateWeeklyTrend = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days.map((day, index) => ({
      day,
      income: index === 4 ? 1500 : Math.floor(Math.random() * 300) + 100, // Friday payday
      expense: index >= 5 ? Math.floor(Math.random() * 400) + 200 : Math.floor(Math.random() * 300) + 50,
    }))
  }

  // Category breakdown with realistic data
  const generateCategoryBreakdown = () => {
    return [
      { name: "Food & Dining", value: 1250, color: "#ef4444", icon: "🍔", percentage: 28 },
      { name: "Transportation", value: 850, color: "#f59e0b", icon: "🚗", percentage: 19 },
      { name: "Shopping", value: 720, color: "#a855f7", icon: "🛍️", percentage: 16 },
      { name: "Utilities", value: 680, color: "#eab308", icon: "💡", percentage: 15 },
      { name: "Entertainment", value: 450, color: "#ec4899", icon: "🎬", percentage: 10 },
      { name: "Healthcare", value: 320, color: "#14b8a6", icon: "🏥", percentage: 7 },
      { name: "Other", value: 230, color: "#64748b", icon: "📝", percentage: 5 },
    ]
  }

  // Recent transactions with detailed info
  const generateRecentTransactions = () => {
    return [
      {
        id: "1",
        type: "expense",
        amount: 85.50,
        description: "Grocery Shopping",
        date: new Date().toISOString(),
        category: { name: "Food & Dining", icon: "🍔", color: "#ef4444" },
        account: { name: "Chase Checking" },
      },
      {
        id: "2",
        type: "income",
        amount: 3500,
        description: "Monthly Salary",
        date: new Date(Date.now() - 86400000).toISOString(),
        category: { name: "Salary", icon: "💰", color: "#10b981" },
        account: { name: "Chase Checking" },
      },
      {
        id: "3",
        type: "expense",
        amount: 45.00,
        description: "Gas Station",
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        category: { name: "Transportation", icon: "🚗", color: "#f59e0b" },
        account: { name: "Chase Checking" },
      },
      {
        id: "4",
        type: "expense",
        amount: 129.99,
        description: "Electric Bill",
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        category: { name: "Utilities", icon: "💡", color: "#eab308" },
        account: { name: "Chase Checking" },
      },
      {
        id: "5",
        type: "transfer",
        amount: 500,
        description: "Savings Transfer",
        date: new Date(Date.now() - 86400000 * 4).toISOString(),
        fromAccount: { name: "Chase Checking" },
        toAccount: { name: "Savings Account" },
      },
    ]
  }

  // Account balances
  const generateAccounts = () => {
    return [
      { name: "Chase Checking", balance: 5420.50, type: "bank", color: "#3b82f6" },
      { name: "Savings Account", balance: 12500.00, type: "bank", color: "#10b981" },
      { name: "Credit Card", balance: -850.25, type: "card", color: "#ef4444" },
      { name: "Cash Wallet", balance: 250.00, type: "cash", color: "#f59e0b" },
    ]
  }

  // Spending insights
  const generateSpendingInsights = () => {
    return [
      {
        category: "Food & Dining",
        current: 1250,
        average: 980,
        change: 27.5,
        trend: "up",
      },
      {
        category: "Transportation",
        current: 850,
        average: 920,
        change: -7.6,
        trend: "down",
      },
      {
        category: "Shopping",
        current: 720,
        average: 650,
        change: 10.8,
        trend: "up",
      },
    ]
  }

  // Budget progress
  const generateBudgetProgress = () => {
    return [
      { category: "Food & Dining", spent: 1250, budget: 1500, percentage: 83 },
      { category: "Transportation", spent: 850, budget: 1000, percentage: 85 },
      { category: "Shopping", spent: 720, budget: 800, percentage: 90 },
      { category: "Entertainment", spent: 450, budget: 500, percentage: 90 },
      { category: "Utilities", spent: 680, budget: 700, percentage: 97 },
    ]
  }

  return {
    totalBalance: 17320.25,
    totalIncome: 5200,
    totalExpense: 4500,
    accountsCount: 4,
    savingsRate: 13.5,
    weeklyTrend: generateWeeklyTrend(),
    monthlyTrend: generateMonthlyTrend(),
    categoryBreakdown: generateCategoryBreakdown(),
    recentTransactions: generateRecentTransactions(),
    accounts: generateAccounts(),
    spendingInsights: generateSpendingInsights(),
    budgetProgress: generateBudgetProgress(),
    topExpenseCategory: "Food & Dining",
    topIncomeSource: "Salary",
  }
}

// Mock accounts for accounts page
export const generateMockAccounts = () => {
  return [
    {
      id: "1",
      name: "Chase Checking",
      type: "bank",
      currency: "USD",
      current_balance: 5420.50,
      initial_balance: 5000,
      is_active: true,
      institution_name: "Chase Bank",
      color: "#3b82f6",
      created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
    },
    {
      id: "2",
      name: "Savings Account",
      type: "bank",
      currency: "USD",
      current_balance: 12500.00,
      initial_balance: 10000,
      is_active: true,
      institution_name: "Chase Bank",
      color: "#10b981",
      created_at: new Date(Date.now() - 86400000 * 150).toISOString(),
    },
    {
      id: "3",
      name: "Credit Card",
      type: "card",
      currency: "USD",
      current_balance: -850.25,
      initial_balance: 0,
      is_active: true,
      institution_name: "Visa",
      color: "#ef4444",
      created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
    },
    {
      id: "4",
      name: "Cash Wallet",
      type: "cash",
      currency: "USD",
      current_balance: 250.00,
      initial_balance: 200,
      is_active: true,
      institution_name: null,
      color: "#f59e0b",
      created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    },
    {
      id: "5",
      name: "Investment Account",
      type: "investment",
      currency: "USD",
      current_balance: 8420.75,
      initial_balance: 8000,
      is_active: true,
      institution_name: "Fidelity",
      color: "#8b5cf6",
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
    {
      id: "6",
      name: "Emergency Fund",
      type: "bank",
      currency: "USD",
      current_balance: 3500.00,
      initial_balance: 3000,
      is_active: true,
      institution_name: "Ally Bank",
      color: "#06b6d4",
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ]
}

// Mock transactions for transactions page
export const generateMockTransactions = () => {
  const categories = [
    { id: "1", name: "Food & Dining", icon: "🍔", color: "#ef4444", type: "expense" },
    { id: "2", name: "Transportation", icon: "🚗", color: "#f59e0b", type: "expense" },
    { id: "3", name: "Shopping", icon: "🛍️", color: "#a855f7", type: "expense" },
    { id: "4", name: "Utilities", icon: "💡", color: "#eab308", type: "expense" },
    { id: "5", name: "Entertainment", icon: "🎬", color: "#ec4899", type: "expense" },
    { id: "6", name: "Healthcare", icon: "🏥", color: "#14b8a6", type: "expense" },
    { id: "7", name: "Salary", icon: "💰", color: "#10b981", type: "income" },
    { id: "8", name: "Freelance", icon: "💼", color: "#3b82f6", type: "income" },
    { id: "9", name: "Investment", icon: "📈", color: "#8b5cf6", type: "income" },
  ]

  const accounts = generateMockAccounts()

  const transactions = [
    {
      id: "1",
      type: "expense",
      amount: 85.50,
      description: "Whole Foods Market",
      notes: "Weekly grocery shopping",
      date: new Date().toISOString(),
      category_id: "1",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date().toISOString(),
      category: categories[0],
      account: accounts[0],
    },
    {
      id: "2",
      type: "income",
      amount: 3500.00,
      description: "Monthly Salary - Tech Corp",
      notes: "November salary payment",
      date: new Date(Date.now() - 86400000).toISOString(),
      category_id: "7",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      category: categories[6],
      account: accounts[0],
    },
    {
      id: "3",
      type: "expense",
      amount: 45.00,
      description: "Shell Gas Station",
      notes: "Fill up the tank",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      category_id: "2",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      category: categories[1],
      account: accounts[0],
    },
    {
      id: "4",
      type: "expense",
      amount: 129.99,
      description: "Electric Company",
      notes: "October electricity bill",
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      category_id: "4",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      category: categories[3],
      account: accounts[0],
    },
    {
      id: "5",
      type: "transfer",
      amount: 500.00,
      description: "Monthly Savings",
      notes: "Transfer to emergency fund",
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
      from_account_id: "1",
      to_account_id: "2",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      fromAccount: accounts[0],
      toAccount: accounts[1],
    },
    {
      id: "6",
      type: "expense",
      amount: 75.00,
      description: "Restaurant - Italian Bistro",
      notes: "Dinner with friends",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      category_id: "1",
      account_id: "3",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      category: categories[0],
      account: accounts[2],
    },
    {
      id: "7",
      type: "income",
      amount: 850.00,
      description: "Freelance Web Design Project",
      notes: "Client: ABC Company",
      date: new Date(Date.now() - 86400000 * 6).toISOString(),
      category_id: "8",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      category: categories[7],
      account: accounts[0],
    },
    {
      id: "8",
      type: "expense",
      amount: 199.99,
      description: "Amazon - Electronics",
      notes: "New wireless headphones",
      date: new Date(Date.now() - 86400000 * 7).toISOString(),
      category_id: "3",
      account_id: "3",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      category: categories[2],
      account: accounts[2],
    },
    {
      id: "9",
      type: "expense",
      amount: 25.00,
      description: "Netflix Subscription",
      notes: "Monthly streaming service",
      date: new Date(Date.now() - 86400000 * 8).toISOString(),
      category_id: "5",
      account_id: "3",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      category: categories[4],
      account: accounts[2],
    },
    {
      id: "10",
      type: "expense",
      amount: 150.00,
      description: "Doctor Visit - Checkup",
      notes: "Annual physical examination",
      date: new Date(Date.now() - 86400000 * 9).toISOString(),
      category_id: "6",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
      category: categories[5],
      account: accounts[0],
    },
    {
      id: "11",
      type: "expense",
      amount: 120.00,
      description: "Grocery Store",
      notes: "Weekly shopping",
      date: new Date(Date.now() - 86400000 * 10).toISOString(),
      category_id: "1",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      category: categories[0],
      account: accounts[0],
    },
    {
      id: "12",
      type: "expense",
      amount: 60.00,
      description: "Uber Rides",
      notes: "Multiple trips this week",
      date: new Date(Date.now() - 86400000 * 11).toISOString(),
      category_id: "2",
      account_id: "3",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
      category: categories[1],
      account: accounts[2],
    },
    {
      id: "13",
      type: "income",
      amount: 125.50,
      description: "Dividend Payment",
      notes: "Quarterly dividend from stocks",
      date: new Date(Date.now() - 86400000 * 12).toISOString(),
      category_id: "9",
      account_id: "5",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      category: categories[8],
      account: accounts[4],
    },
    {
      id: "14",
      type: "expense",
      amount: 89.99,
      description: "Gym Membership",
      notes: "Monthly fitness center fee",
      date: new Date(Date.now() - 86400000 * 13).toISOString(),
      category_id: "5",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 13).toISOString(),
      category: categories[4],
      account: accounts[0],
    },
    {
      id: "15",
      type: "expense",
      amount: 250.00,
      description: "Phone & Internet Bill",
      notes: "Monthly utilities",
      date: new Date(Date.now() - 86400000 * 14).toISOString(),
      category_id: "4",
      account_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      category: categories[3],
      account: accounts[0],
    },
  ]

  return transactions
}

// Mock categories for categories page
export const generateMockCategories = () => {
  return [
    {
      id: "1",
      name: "Food & Dining",
      icon: "🍔",
      color: "#ef4444",
      type: "expense",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
      transaction_count: 25,
      total_amount: 1250.50,
    },
    {
      id: "2",
      name: "Transportation",
      icon: "🚗",
      color: "#f59e0b",
      type: "expense",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 170).toISOString(),
      transaction_count: 18,
      total_amount: 850.00,
    },
    {
      id: "3",
      name: "Shopping",
      icon: "🛍️",
      color: "#a855f7",
      type: "expense",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 160).toISOString(),
      transaction_count: 12,
      total_amount: 720.99,
    },
    {
      id: "4",
      name: "Utilities",
      icon: "💡",
      color: "#eab308",
      type: "expense",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 150).toISOString(),
      transaction_count: 8,
      total_amount: 680.00,
    },
    {
      id: "5",
      name: "Entertainment",
      icon: "🎬",
      color: "#ec4899",
      type: "expense",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 140).toISOString(),
      transaction_count: 15,
      total_amount: 450.00,
    },
    {
      id: "6",
      name: "Healthcare",
      icon: "🏥",
      color: "#14b8a6",
      type: "expense",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 130).toISOString(),
      transaction_count: 5,
      total_amount: 320.00,
    },
    {
      id: "7",
      name: "Salary",
      icon: "💰",
      color: "#10b981",
      type: "income",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
      transaction_count: 12,
      total_amount: 42000.00,
    },
    {
      id: "8",
      name: "Freelance",
      icon: "💼",
      color: "#3b82f6",
      type: "income",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 110).toISOString(),
      transaction_count: 8,
      total_amount: 6800.00,
    },
    {
      id: "9",
      name: "Investment",
      icon: "📈",
      color: "#8b5cf6",
      type: "income",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 100).toISOString(),
      transaction_count: 4,
      total_amount: 502.00,
    },
    {
      id: "10",
      name: "Gifts",
      icon: "🎁",
      color: "#f472b6",
      type: "income",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
      transaction_count: 3,
      total_amount: 450.00,
    },
    {
      id: "11",
      name: "Education",
      icon: "📚",
      color: "#06b6d4",
      type: "expense",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 80).toISOString(),
      transaction_count: 6,
      total_amount: 890.00,
    },
    {
      id: "12",
      name: "Insurance",
      icon: "🛡️",
      color: "#64748b",
      type: "expense",
      is_active: true,
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 70).toISOString(),
      transaction_count: 3,
      total_amount: 1200.00,
    },
  ]
}

// Mock recurring transactions for recurring page
export const generateMockRecurringTransactions = () => {
  const categories = [
    { id: "1", name: "Food & Dining", icon: "🍔", color: "#ef4444" },
    { id: "7", name: "Salary", icon: "💰", color: "#10b981" },
    { id: "4", name: "Utilities", icon: "💡", color: "#eab308" },
    { id: "5", name: "Entertainment", icon: "🎬", color: "#ec4899" },
    { id: "8", name: "Freelance", icon: "💼", color: "#3b82f6" },
    { id: "12", name: "Insurance", icon: "🛡️", color: "#64748b" },
  ]

  const accounts = generateMockAccounts()

  return [
    {
      id: "1",
      type: "income",
      name: "Monthly Salary",
      amount: 3500.00,
      frequency: "monthly",
      start_date: new Date(Date.now() - 86400000 * 180).toISOString(),
      end_date: null,
      description: "Regular monthly salary payment",
      is_active: true,
      last_generated: new Date(Date.now() - 86400000 * 5).toISOString(),
      account_id: "1",
      category_id: "7",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
      accounts: accounts[0],
      categories: categories[1],
    },
    {
      id: "2",
      type: "expense",
      name: "Netflix Subscription",
      amount: 15.99,
      frequency: "monthly",
      start_date: new Date(Date.now() - 86400000 * 120).toISOString(),
      end_date: null,
      description: "Monthly streaming subscription",
      is_active: true,
      last_generated: new Date(Date.now() - 86400000 * 3).toISOString(),
      account_id: "3",
      category_id: "5",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
      accounts: accounts[2],
      categories: categories[3],
    },
    {
      id: "3",
      type: "expense",
      name: "Electric Bill",
      amount: 120.00,
      frequency: "monthly",
      start_date: new Date(Date.now() - 86400000 * 150).toISOString(),
      end_date: null,
      description: "Monthly electricity payment",
      is_active: true,
      last_generated: new Date(Date.now() - 86400000 * 10).toISOString(),
      account_id: "1",
      category_id: "4",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 150).toISOString(),
      accounts: accounts[0],
      categories: categories[2],
    },
    {
      id: "4",
      type: "income",
      name: "Freelance Retainer",
      amount: 850.00,
      frequency: "monthly",
      start_date: new Date(Date.now() - 86400000 * 90).toISOString(),
      end_date: null,
      description: "Monthly freelance retainer fee",
      is_active: true,
      last_generated: new Date(Date.now() - 86400000 * 2).toISOString(),
      account_id: "1",
      category_id: "8",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
      accounts: accounts[0],
      categories: categories[4],
    },
    {
      id: "5",
      type: "expense",
      name: "Gym Membership",
      amount: 49.99,
      frequency: "monthly",
      start_date: new Date(Date.now() - 86400000 * 200).toISOString(),
      end_date: null,
      description: "Monthly gym membership fee",
      is_active: true,
      last_generated: new Date(Date.now() - 86400000 * 8).toISOString(),
      account_id: "1",
      category_id: "5",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 200).toISOString(),
      accounts: accounts[0],
      categories: categories[3],
    },
    {
      id: "6",
      type: "expense",
      name: "Car Insurance",
      amount: 125.00,
      frequency: "monthly",
      start_date: new Date(Date.now() - 86400000 * 365).toISOString(),
      end_date: null,
      description: "Monthly car insurance premium",
      is_active: true,
      last_generated: new Date(Date.now() - 86400000 * 15).toISOString(),
      account_id: "1",
      category_id: "12",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 365).toISOString(),
      accounts: accounts[0],
      categories: categories[5],
    },
    {
      id: "7",
      type: "expense",
      name: "Coffee Subscription",
      amount: 24.99,
      frequency: "monthly",
      start_date: new Date(Date.now() - 86400000 * 60).toISOString(),
      end_date: new Date(Date.now() + 86400000 * 30).toISOString(),
      description: "Monthly coffee delivery service",
      is_active: false,
      last_generated: new Date(Date.now() - 86400000 * 45).toISOString(),
      account_id: "3",
      category_id: "1",
      tenant_id: "mock-tenant",
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
      accounts: accounts[2],
      categories: categories[0],
    },
  ]
}

// Mock report data for reports page
export const generateMockReportData = (period: "week" | "month" | "quarter" | "year" = "month") => {
  const getDaysForPeriod = () => {
    switch (period) {
      case "week": return 7
      case "month": return 30
      case "quarter": return 90
      case "year": return 365
    }
  }

  const days = getDaysForPeriod()

  // Generate trend data
  const generateTrendData = () => {
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Simulate realistic patterns
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isFriday = dayOfWeek === 5

      const baseIncome = isFriday ? 1200 : isWeekend ? 50 : 200
      const baseExpense = isWeekend ? 300 : 150

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: baseIncome + Math.random() * 200,
        expense: baseExpense + Math.random() * 150,
      })
    }
    return data
  }

  // Category breakdown
  const categoryData = [
    { name: "Food & Dining", value: 1250, color: "#ef4444", percentage: 28 },
    { name: "Transportation", value: 850, color: "#f59e0b", percentage: 19 },
    { name: "Shopping", value: 720, color: "#a855f7", percentage: 16 },
    { name: "Utilities", value: 680, color: "#eab308", percentage: 15 },
    { name: "Entertainment", value: 450, color: "#ec4899", percentage: 10 },
    { name: "Healthcare", value: 320, color: "#14b8a6", percentage: 7 },
    { name: "Other", value: 230, color: "#64748b", percentage: 5 },
  ]

  // Account breakdown
  const accountsData = [
    { name: "Chase Checking", balance: 5420.50, transactions: 45 },
    { name: "Savings Account", balance: 12500.00, transactions: 12 },
    { name: "Credit Card", balance: -850.25, transactions: 38 },
    { name: "Cash Wallet", balance: 250.00, transactions: 15 },
  ]

  const totalIncome = 5200
  const totalExpense = 4500
  const topCategory = "Food & Dining"
  const transactionCount = 110

  return {
    trendData: generateTrendData(),
    categoryData,
    accountsData,
    summary: {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      topCategory,
      transactionCount,
    },
  }
}

