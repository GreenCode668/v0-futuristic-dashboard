"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { generateMockRecurringTransactions } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RecurringForm } from "@/components/finance/recurring-form"
import { Plus, RefreshCw, ArrowDownRight, ArrowUpRight, Play, Pause, AlertCircle } from "lucide-react"

type RecurringTransaction = {
  id: string
  type: "income" | "expense"
  name: string
  amount: number
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  start_date: string
  end_date: string | null
  description: string | null
  is_active: boolean
  last_generated: string | null
  account_id: string
  category_id: string | null
  accounts: { name: string } | null
  categories: { name: string; icon: string; color: string } | null
}

export default function RecurringPage() {
  const { tenantId, loading: tenantLoading } = useTenant()
  const supabase = createClient()

  const mockRecurring = generateMockRecurringTransactions() as any[]
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(mockRecurring)
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editRecurring, setEditRecurring] = useState<RecurringTransaction | null>(null)

  useEffect(() => {
    if (tenantId) {
      fetchRecurring()
    } else {
      setLoading(false)
    }
  }, [tenantId])

  const fetchRecurring = async () => {
    if (!tenantId) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("recurring_templates")
        .select("*, accounts(name), categories(name, icon, color)")
        .eq("tenant_id", tenantId)
        .order("is_active", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching recurring transactions:", error)
        setRecurring(mockRecurring)
      } else {
        if (data && data.length > 0) {
          setRecurring(data)
        } else {
          setRecurring(mockRecurring)
        }
      }
    } catch (error) {
      console.error("Error fetching recurring transactions:", error)
      setRecurring(mockRecurring)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditRecurring(recurring)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditRecurring(null)
  }

  const handleSuccess = () => {
    fetchRecurring()
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("recurring_templates")
        .update({ is_active: !isActive })
        .eq("id", id)

      if (error) throw error

      fetchRecurring()
    } catch (error) {
      console.error("Error toggling recurring transaction:", error)
      alert("Failed to update recurring transaction")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getFrequencyLabel = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1)
  }

  const activeCount = recurring.filter((r) => r.is_active).length
  const totalMonthlyAmount = recurring
    .filter((r) => r.is_active && r.type === "expense")
    .reduce((sum, r) => {
      const multiplier = r.frequency === "daily" ? 30 : r.frequency === "weekly" ? 4.33 : r.frequency === "monthly" ? 1 : 0.083
      return sum + r.amount * multiplier
    }, 0)

  const hasRealData = tenantId && recurring.some(r => !mockRecurring.find(mock => mock.id === r.id))

  if (tenantLoading || loading) {
    return <LoadingSpinner message="Carregando transações recorrentes..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Transações Recorrentes
            </h1>
            <p className="text-slate-400 mt-1">Automatize suas receitas e despesas regulares</p>
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
                setEditRecurring(null)
                setIsFormOpen(true)
              }}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Recorrente
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 text-cyan-500" />
                Total de Recorrentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {recurring.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">{activeCount} active</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-2 text-red-500" />
                Despesas Mensais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{formatCurrency(totalMonthlyAmount)}</div>
              <p className="text-xs text-slate-500 mt-1">Total mensal estimado</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <Play className="h-4 w-4 mr-2 text-green-500" />
                Contagem Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{activeCount}</div>
              <p className="text-xs text-slate-500 mt-1">Em execução</p>
            </CardContent>
          </Card>
        </div>

        {/* Transações Recorrentes List */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            {recurring.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ainda sem transações recorrentes</p>
                <p className="text-sm mt-2">Crie sua primeira transação recorrente para automatizar suas finanças</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recurring.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div
                        className={`p-3 rounded-lg ${
                          transaction.type === "income"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        } ${!transaction.is_active && "opacity-50"}`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowDownRight className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {transaction.categories && (
                            <span className="text-lg">{transaction.categories.icon}</span>
                          )}
                          <div className="font-medium text-slate-200">
                            {transaction.name}
                            {!transaction.is_active && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                                Pausada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {transaction.accounts?.name} • {getFrequencyLabel(transaction.frequency)}
                          {transaction.last_generated && (
                            <> • Última: {new Date(transaction.last_generated).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right mr-4">
                        <div
                          className={`text-lg font-semibold ${
                            transaction.type === "income" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-slate-500">{getFrequencyLabel(transaction.frequency)}</div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(transaction.id, transaction.is_active)}
                          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                        >
                          {transaction.is_active ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Retomar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recurring Form Modal */}
      <RecurringForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        editRecurring={editRecurring}
      />
    </div>
  )
}
