"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { generateMockReportData } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Calendar, Download, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

type ReportPeriod = "week" | "month" | "quarter" | "year"

export default function ReportsPage() {
  const { tenantId, loading: tenantLoading } = useTenant()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<ReportPeriod>("month")

  const mockReportData = generateMockReportData(period)
  const [categoryData, setCategoryData] = useState<any[]>(mockReportData.categoryData)
  const [trendData, setTrendData] = useState<any[]>(mockReportData.trendData)
  const [accountsData, setAccountsData] = useState<any[]>(mockReportData.accountsData)
  const [summary, setSummary] = useState(mockReportData.summary)

  useEffect(() => {
    // Update mock data when period changes
    const newMockData = generateMockReportData(period)
    setCategoryData(newMockData.categoryData)
    setTrendData(newMockData.trendData)
    setAccountsData(newMockData.accountsData)
    setSummary(newMockData.summary)

    if (tenantId) {
      fetchReportData()
    } else {
      setLoading(false)
    }
  }, [tenantId, period])

  const getDateRange = () => {
    const now = new Date()
    const start = new Date()

    switch (period) {
      case "week":
        start.setDate(now.getDate() - 7)
        break
      case "month":
        start.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        start.setMonth(now.getMonth() - 3)
        break
      case "year":
        start.setFullYear(now.getFullYear() - 1)
        break
    }

    return { start: start.toISOString(), end: now.toISOString() }
  }

  const fetchReportData = async () => {
    if (!tenantId) return

    setLoading(true)

    try {
      const { start, end } = getDateRange()

      // Fetch all transactions in range
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*, categories(name, icon, color)")
        .eq("tenant_id", tenantId)
        .gte("date", start)
        .lte("date", end)
        .order("date")

      if (!transactions || transactions.length === 0) {
        // Use mock data
        setLoading(false)
        return
      }

      // Calculate summary
      const income = transactions.filter((t) => t.type === "income")
      const expenses = transactions.filter((t) => t.type === "expense")
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
      const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0)

      // Category breakdown
      const categoryMap = new Map()
      expenses.forEach((t) => {
        const categoryName = t.categories?.name || "Uncategorized"
        const current = categoryMap.get(categoryName) || {
          name: categoryName,
          value: 0,
          color: t.categories?.color || "#64748b",
        }
        current.value += t.amount
        categoryMap.set(categoryName, current)
      })

      const sortedCategories = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)

      // Trend data (daily aggregation)
      const trendMap = new Map()
      transactions.forEach((t) => {
        const date = new Date(t.date).toISOString().split("T")[0]
        const current = trendMap.get(date) || { date, income: 0, expense: 0 }

        if (t.type === "income") {
          current.income += t.amount
        } else if (t.type === "expense") {
          current.expense += t.amount
        }

        trendMap.set(date, current)
      })

      const sortedTrend = Array.from(trendMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      )

      // Fetch accounts for breakdown
      const { data: accounts } = await supabase
        .from("accounts")
        .select("name, current_balance, type")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)

      setSummary({
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense,
        topCategory: sortedCategories[0]?.name || "N/A",
        transactionCount: transactions.length,
      })
      setCategoryData(sortedCategories)
      setTrendData(sortedTrend)
      setAccountsData(
        accounts?.map((a) => ({
          name: a.name,
          value: a.current_balance,
          type: a.type,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching report data:", error)
      // Keep mock data on error
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

  const hasRealData = tenantId && summary.transactionCount > 0

  if (tenantLoading || loading) {
    return <LoadingSpinner message="Carregando relatórios..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Relatórios & Análises
            </h1>
            <p className="text-slate-400 mt-1">Visualize seus dados financeiros</p>
          </div>

          <div className="flex gap-3">
            {!hasRealData && (
              <div className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Showing sample data
              </div>
            )}
            {/* Period Selector */}
            <div className="flex gap-2">
              {(["week", "month", "quarter", "year"] as ReportPeriod[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  onClick={() => setPeriod(p)}
                  className={
                    period === p
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600"
                      : "border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                  }
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal">Net Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summary.netIncome >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(summary.netIncome)}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                {summary.netIncome >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                Este {period}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal">Total de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(summary.totalIncome)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Dinheiro recebido</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {formatCurrency(summary.totalExpense)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Dinheiro gasto</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal">
                Categoria Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-200">{summary.topCategory}</div>
              <p className="text-xs text-slate-500 mt-1">{summary.transactionCount} transações</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tendência Receitas vs Despesas */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100">Tendência Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8" }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
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
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Expense"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  Nenhum dado disponível para este período
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
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
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  Nenhum dado de despesas disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categories Bar Chart */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100">Principais Categorias de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
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
                    <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]}>
                      {categoryData.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  Nenhum dado de categorias disponível
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição de Contas */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100">Distribuição de Contas</CardTitle>
            </CardHeader>
            <CardContent>
              {accountsData.length > 0 ? (
                <div className="space-y-4">
                  {accountsData.map((account, index) => {
                    const total = accountsData.reduce((sum, a) => sum + a.value, 0)
                    const percentage = total > 0 ? (account.value / total) * 100 : 0

                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-300">{account.name}</span>
                          <span className="text-sm font-semibold text-cyan-400">
                            {formatCurrency(account.value)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {percentage.toFixed(1)}% do saldo total
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  Nenhum dado de contas disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
