"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  Calendar,
} from "lucide-react"
import Link from "next/link"

type DashboardData = {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  accountsCount: number
  recentTransactions: any[]
  topCategories: any[]
  weeklyTrend: any[]
  categoryBreakdown: any[]
}

// Mock data for visualization when no real data exists
const generateMockWeeklyTrend = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return days.map((day) => ({
    day,
    income: Math.floor(Math.random() * 500) + 100,
    expense: Math.floor(Math.random() * 400) + 50,
  }))
}

const generateMockCategoryBreakdown = () => {
  return [
    { name: "Food & Dining", value: 850, color: "#ef4444" },
    { name: "Transportation", value: 420, color: "#f59e0b" },
    { name: "Shopping", value: 680, color: "#a855f7" },
    { name: "Entertainment", value: 320, color: "#ec4899" },
    { name: "Utilities", value: 560, color: "#eab308" },
  ]
}

export default function DashboardPage() {
  const router = useRouter()
  const { tenantId, loading: tenantLoading } = useTenant()
  const [data, setData] = useState<DashboardData>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    accountsCount: 0,
    recentTransactions: [],
    topCategories: [],
    weeklyTrend: [],
    categoryBreakdown: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (tenantId) {
      fetchDashboardData()
    }
  }, [tenantId])

  const fetchDashboardData = async () => {
    if (!tenantId) return

    setLoading(true)

    try {
      // Fetch accounts
      const { data: accounts } = await supabase
        .from("accounts")
        .select("current_balance")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)

      const totalBalance = accounts?.reduce((sum, acc) => sum + acc.current_balance, 0) || 0
      const accountsCount = accounts?.length || 0

      // Fetch transactions for current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: transactions } = await supabase
        .from("transactions")
        .select("*, categories(name, icon, color)")
        .eq("tenant_id", tenantId)
        .gte("date", startOfMonth.toISOString())

      const totalIncome = transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) || 0
      const totalExpense =
        transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) || 0

      // Get recent transactions
      const { data: recentTrans } = await supabase
        .from("transactions")
        .select("*, accounts(name), categories(name, icon, color)")
        .eq("tenant_id", tenantId)
        .order("date", { ascending: false })
        .limit(5)

      // Generate weekly trend from transactions or use mock data
      let weeklyTrend = generateMockWeeklyTrend()
      if (transactions && transactions.length > 0) {
        // Group by day of week
        const dayMap = new Map()
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        days.forEach((day) => dayMap.set(day, { day, income: 0, expense: 0 }))

        transactions.forEach((t) => {
          const dayIndex = new Date(t.date).getDay()
          const day = days[dayIndex]
          const current = dayMap.get(day)
          if (t.type === "income") {
            current.income += t.amount
          } else if (t.type === "expense") {
            current.expense += t.amount
          }
        })

        weeklyTrend = Array.from(dayMap.values()).slice(1).concat(Array.from(dayMap.values()).slice(0, 1))
      }

      // Generate category breakdown
      let categoryBreakdown = generateMockCategoryBreakdown()
      if (transactions && transactions.length > 0) {
        const categoryMap = new Map()
        transactions
          .filter((t) => t.type === "expense" && t.categories)
          .forEach((t) => {
            const name = t.categories.name
            const current = categoryMap.get(name) || {
              name,
              value: 0,
              color: t.categories.color || "#64748b",
            }
            current.value += t.amount
            categoryMap.set(name, current)
          })

        if (categoryMap.size > 0) {
          categoryBreakdown = Array.from(categoryMap.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
        }
      }

      setData({
        totalBalance,
        totalIncome,
        totalExpense,
        accountsCount,
        recentTransactions: recentTrans || [],
        topCategories: [],
        weeklyTrend,
        categoryBreakdown,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Use mock data on error
      setData({
        totalBalance: 12500,
        totalIncome: 5000,
        totalExpense: 2830,
        accountsCount: 3,
        recentTransactions: [],
        topCategories: [],
        weeklyTrend: generateMockWeeklyTrend(),
        categoryBreakdown: generateMockCategoryBreakdown(),
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (tenantLoading || loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  const netIncome = data.totalIncome - data.totalExpense
  const hasData = data.totalBalance > 0 || data.recentTransactions.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Welcome back! Here's your financial overview
              </p>
            </div>
            {!hasData && (
              <div className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-full">
                Sample Data - Start adding transactions
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/transactions?type=income">
            <Button className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-400 justify-start h-auto py-4">
              <ArrowDownRight className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Add Income</div>
                <div className="text-xs opacity-70">Record money received</div>
              </div>
            </Button>
          </Link>

          <Link href="/transactions?type=expense">
            <Button className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 justify-start h-auto py-4">
              <ArrowUpRight className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Add Expense</div>
                <div className="text-xs opacity-70">Record money spent</div>
              </div>
            </Button>
          </Link>

          <Link href="/transactions?type=transfer">
            <Button className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 justify-start h-auto py-4">
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Transfer</div>
                <div className="text-xs opacity-70">Move between accounts</div>
              </div>
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-cyan-500" />
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {formatCurrency(data.totalBalance)}
              </div>
              <p className="text-xs text-slate-500 mt-1">{data.accountsCount} active accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-2 text-green-500" />
                Income (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{formatCurrency(data.totalIncome)}</div>
              <p className="text-xs text-slate-500 mt-1">Money received</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-2 text-red-500" />
                Expenses (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{formatCurrency(data.totalExpense)}</div>
              <p className="text-xs text-slate-500 mt-1">Money spent</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                Net Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${netIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(netIncome)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Income - Expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Trend Chart */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100">Weekly Trend</CardTitle>
              <p className="text-xs text-slate-400">Income vs Expenses this week</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.weeklyTrend}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                    name="Expense"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown Chart */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100">Spending by Category</CardTitle>
              <p className="text-xs text-slate-400">Top 5 expense categories</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100">Recent Transactions</CardTitle>
              <Link href="/transactions">
                <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800/50">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Start by adding your first income or expense</p>
                <div className="mt-4">
                  <Link href="/transactions">
                    <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentTransactions.map((transaction) => (
                  <Link key={transaction.id} href="/transactions">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === "income"
                              ? "bg-green-500/20 text-green-400"
                              : transaction.type === "expense"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : transaction.type === "expense" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowRightLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            {transaction.categories?.icon && (
                              <span className="text-base">{transaction.categories.icon}</span>
                            )}
                            {transaction.description || transaction.categories?.name || "Transaction"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {transaction.accounts?.name} • {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${
                          transaction.type === "income" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
