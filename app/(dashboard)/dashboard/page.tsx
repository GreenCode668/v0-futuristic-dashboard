"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { generateMockDashboardData } from "@/lib/mockData"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRightLeft,
  Calendar,
  PiggyBank,
  CreditCard,
  Target,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { tenantId, loading: tenantLoading } = useTenant()
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Use mock data with real data fallback
  const mockData = generateMockDashboardData()
  const [data, setData] = useState(mockData)

  useEffect(() => {
    if (tenantId) {
      fetchDashboardData()
    } else {
      // Use mock data immediately if no tenant
      setLoading(false)
    }
  }, [tenantId])

  const fetchDashboardData = async () => {
    if (!tenantId) return

    setLoading(true)

    try {
      // Fetch real data from Supabase
      const { data: accounts } = await supabase
        .from("accounts")
        .select("current_balance, name, type")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)

      const { data: transactions } = await supabase
        .from("transactions")
        .select("*, accounts(name), categories(name, icon, color)")
        .eq("tenant_id", tenantId)
        .order("date", { ascending: false })
        .limit(5)

      // If real data exists, merge with mock structure
      if (accounts && accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0)
        setData({
          ...mockData,
          totalBalance,
          accountsCount: accounts.length,
          recentTransactions: transactions || mockData.recentTransactions,
        })
      } else {
        // Use mock data with "sample" indicator
        setData(mockData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setData(mockData)
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

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (tenantLoading || loading) {
    return <LoadingSpinner message="Carregando painel..." />
  }

  const netIncome = data.totalIncome - data.totalExpense
  const hasRealData = data.accountsCount > 0 && tenantId

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Painel
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {!hasRealData && (
            <div className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-full flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Mostrando dados de exemplo - Comece adicionando suas transações
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/transactions?type=income">
            <Button className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-400 justify-start h-auto py-4">
              <ArrowDownRight className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Adicionar Receita</div>
                <div className="text-xs opacity-70">Registrar dinheiro recebido</div>
              </div>
            </Button>
          </Link>

          <Link href="/transactions?type=expense">
            <Button className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 justify-start h-auto py-4">
              <ArrowUpRight className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Adicionar Despesa</div>
                <div className="text-xs opacity-70">Registrar dinheiro gasto</div>
              </div>
            </Button>
          </Link>

          <Link href="/transactions?type=transfer">
            <Button className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 justify-start h-auto py-4">
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Transferência</div>
                <div className="text-xs opacity-70">Mover entre contas</div>
              </div>
            </Button>
          </Link>
        </div>

        {/* KPI Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-cyan-500" />
                Saldo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {formatCurrencyDetailed(data.totalBalance)}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                {data.accountsCount} contas ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-2 text-green-500" />
                Receitas (Este Mês)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{formatCurrency(data.totalIncome)}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                +12.5% do mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-2 text-red-500" />
                Despesas (Este Mês)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{formatCurrency(data.totalExpense)}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-green-400" />
                -5.2% do mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <PiggyBank className="h-4 w-4 mr-2 text-blue-500" />
                Taxa de Poupança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{data.savingsRate}%</div>
              <p className="text-xs text-slate-500 mt-1">
                {formatCurrency(netIncome)} poupado este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend - Takes 2 columns */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100">Tendência de Receitas & Despesas</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Análise de fluxo de caixa dos últimos 30 dias</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-slate-400">Receitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-slate-400">Despesas</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyTrend}>
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
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
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

          {/* Spending by Category Pie Chart */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100">Distribuição de Gastos</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Por categoria este mês</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${percentage}%`}
                    outerRadius={90}
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
              {/* Category Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {data.categoryBreakdown.slice(0, 6).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-400 truncate">{cat.icon} {cat.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Progress */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Target className="h-5 w-5 text-cyan-500" />
                    Progresso do Orçamento
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Como você está acompanhando este mês</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.budgetProgress.map((budget) => (
                <div key={budget.category}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-300">{budget.category}</span>
                    <span className="text-sm font-semibold text-slate-200">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        budget.percentage >= 90
                          ? "bg-red-500"
                          : budget.percentage >= 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500">{budget.percentage}% usado</span>
                    <span className="text-xs text-slate-500">
                      {formatCurrency(budget.budget - budget.spent)} restante
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account Balances */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-cyan-500" />
                    Saldos das Contas
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Saldos atuais em todas as contas</p>
                </div>
                <Link href="/accounts">
                  <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-xs">
                    Ver Todas
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.accounts.map((account) => (
                <div
                  key={account.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${account.color}20`, color: account.color }}
                    >
                      {account.type === "bank" ? "🏦" : account.type === "card" ? "💳" : "💵"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{account.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{account.type}</div>
                    </div>
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      account.balance >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {formatCurrencyDetailed(account.balance)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-100">Transações Recentes</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Sua atividade financeira mais recente</p>
              </div>
              <Link href="/transactions">
                <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50">
                  Ver Todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
                <Link key={transaction.id} href="/transactions">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`p-2.5 rounded-lg ${
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
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                          {transaction.category?.icon && (
                            <span className="text-base">{transaction.category.icon}</span>
                          )}
                          {transaction.description}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          {transaction.type === "transfer" ? (
                            <>
                              {transaction.fromAccount?.name} → {transaction.toAccount?.name}
                            </>
                          ) : (
                            <>
                              <span>{transaction.account?.name}</span>
                              {transaction.category && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.category.name}</span>
                                </>
                              )}
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        transaction.type === "income"
                          ? "text-green-400"
                          : transaction.type === "expense"
                          ? "text-red-400"
                          : "text-blue-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                      {formatCurrencyDetailed(transaction.amount)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
