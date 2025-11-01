"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { generateMockTransactions } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/finance/transaction-form"
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  Plus,
  Filter,
  Download,
  Search,
  AlertCircle,
} from "lucide-react"

type Transaction = {
  id: string
  type: "income" | "expense" | "transfer"
  amount: number
  description: string | null
  date: string
  notes: string | null
  account_id: string | null
  category_id: string | null
  from_account_id: string | null
  to_account_id: string | null
  accounts?: { name: string } | null
  categories?: { name: string; icon: string; color: string } | null
  from_accounts?: { name: string } | null
  to_accounts?: { name: string } | null
  account?: { name: string } | null
  category?: { name: string; icon: string; color: string } | null
  fromAccount?: { name: string } | null
  toAccount?: { name: string } | null
}

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const { tenantId, loading: tenantLoading } = useTenant()
  const supabase = createClient()

  const mockTransactions = generateMockTransactions() as any[]
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [defaultType, setDefaultType] = useState<"income" | "expense" | "transfer">("expense")

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    // Check for type parameter in URL
    const type = searchParams.get("type")
    if (type === "income" || type === "expense" || type === "transfer") {
      setDefaultType(type)
      setIsFormOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (tenantId) {
      fetchTransactions()
    } else {
      setLoading(false)
    }
  }, [tenantId, typeFilter, dateFrom, dateTo])

  const fetchTransactions = async () => {
    if (!tenantId) return

    setLoading(true)

    try {
      let query = supabase
        .from("transactions")
        .select(
          `
          *,
          accounts(name),
          categories(name, icon, color),
          from_accounts:accounts!transactions_from_account_id_fkey(name),
          to_accounts:accounts!transactions_to_account_id_fkey(name)
        `
        )
        .eq("tenant_id", tenantId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })

      // Apply type filter
      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter)
      }

      // Apply date filters
      if (dateFrom) {
        query = query.gte("date", new Date(dateFrom).toISOString())
      }
      if (dateTo) {
        query = query.lte("date", new Date(dateTo).toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching transactions:", error)
        setTransactions(mockTransactions)
      } else {
        if (data && data.length > 0) {
          setTransactions(data)
        } else {
          setTransactions(mockTransactions)
        }
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setTransactions(mockTransactions)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction)
    setDefaultType(transaction.type)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditTransaction(null)
  }

  const handleSuccess = () => {
    fetchTransactions()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true

    const searchLower = searchQuery.toLowerCase()
    const description = transaction.description?.toLowerCase() || ""
    const categoryName = (transaction.categories?.name || transaction.category?.name || "").toLowerCase()
    const accountName = (transaction.accounts?.name || transaction.account?.name || "").toLowerCase()
    const fromAccountName = (transaction.from_accounts?.name || transaction.fromAccount?.name || "").toLowerCase()
    const toAccountName = (transaction.to_accounts?.name || transaction.toAccount?.name || "").toLowerCase()

    return (
      description.includes(searchLower) ||
      categoryName.includes(searchLower) ||
      accountName.includes(searchLower) ||
      fromAccountName.includes(searchLower) ||
      toAccountName.includes(searchLower)
    )
  })

  // Calculate summary stats
  const totalReceitas = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalDespesas = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netReceitas = totalReceitas - totalDespesas
  const hasRealData = tenantId && transactions.some(t => !mockTransactions.find(mock => mock.id === t.id))

  if (tenantLoading || loading) {
    return <LoadingSpinner message="Carregando transações..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-slate-400 mt-1">Gerencie suas receitas, despesas e transferências</p>
          </div>
          <div className="flex gap-3 items-center">
            {!hasRealData && (
              <div className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Showing sample data
              </div>
            )}
            <Button
              onClick={() => {
                setEditTransaction(null)
                setDefaultType("expense")
                setIsFormOpen(true)
              }}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-2 text-green-500" />
                Total de Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(totalReceitas)}</div>
              <p className="text-xs text-slate-500 mt-1">
                {filteredTransactions.filter((t) => t.type === "income").length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-2 text-red-500" />
                Total de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{formatCurrency(totalDespesas)}</div>
              <p className="text-xs text-slate-500 mt-1">
                {filteredTransactions.filter((t) => t.type === "expense").length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <ArrowRightLeft className="h-4 w-4 mr-2 text-blue-500" />
                Receita Líquida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netReceitas >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(netReceitas)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Receitas - Despesas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Pesquisar transações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Todos os Tipos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
                <option value="transfer">Transferência</option>
              </select>

              {/* Date From */}
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From date"
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              {/* Date To */}
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To date"
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm mt-2">Crie sua primeira transação para começar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    onClick={() => handleEdit(transaction)}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div
                        className={`p-3 rounded-lg ${
                          transaction.type === "income"
                            ? "bg-green-500/20 text-green-400"
                            : transaction.type === "expense"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowDownRight className="h-5 w-5" />
                        ) : transaction.type === "expense" ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowRightLeft className="h-5 w-5" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {(transaction.categories?.icon || transaction.category?.icon) && (
                            <span className="text-lg">{transaction.categories?.icon || transaction.category?.icon}</span>
                          )}
                          <div className="font-medium text-slate-200">
                            {transaction.description || transaction.categories?.name || transaction.category?.name || "Transaction"}
                          </div>
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {transaction.type === "transfer" ? (
                            <>
                              {transaction.from_accounts?.name || transaction.fromAccount?.name} → {transaction.to_accounts?.name || transaction.toAccount?.name}
                            </>
                          ) : (
                            transaction.accounts?.name || transaction.account?.name
                          )}
                          {" • "}
                          {new Date(transaction.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      {/* Amount */}
                      <div
                        className={`text-lg font-semibold ${
                          transaction.type === "income" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        editTransaction={editTransaction}
        defaultType={defaultType}
      />
    </div>
  )
}
