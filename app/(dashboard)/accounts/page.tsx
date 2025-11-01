"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { generateMockAccounts } from "@/lib/mockData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Wallet, CreditCard, Landmark, DollarSign, TrendingUp, AlertCircle, PieChart } from "lucide-react"
import { AccountForm } from "@/components/finance/account-form"

type Account = {
  id: string
  name: string
  type: string
  currency: string
  current_balance: number
  is_active: boolean
  institution_name: string | null
  color: string | null
}

export default function AccountsPage() {
  const { tenantId, loading: tenantLoading } = useTenant()
  const mockAccounts = generateMockAccounts()
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditaringAccount] = useState<Account | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (tenantId) {
      fetchAccounts()
    } else {
      setLoading(false)
    }
  }, [tenantId])

  const fetchAccounts = async () => {
    if (!tenantId) return

    setLoading(true)
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching accounts:", error)
      setAccounts(mockAccounts)
    } else {
      if (data && data.length > 0) {
        setAccounts(data)
      } else {
        setAccounts(mockAccounts)
      }
    }
    setLoading(false)
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "cash":
        return <Wallet className="h-5 w-5" />
      case "card":
        return <CreditCard className="h-5 w-5" />
      case "bank":
        return <Landmark className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.current_balance, 0)
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const hasRealData = tenantId && accounts.some(acc => !mockAccounts.find(mock => mock.id === acc.id))

  if (tenantLoading || loading) {
    return <LoadingSpinner message="Carregando contas..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Accounts
            </h1>
            <p className="text-slate-400 mt-1">Manage your financial accounts</p>
          </div>
          <div className="flex gap-3 items-center">
            {!hasRealData && (
              <div className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Mostrando dados de exemplo
              </div>
            )}
            <Button
              onClick={() => {
                setEditaringAccount(null)
                setShowForm(true)
              }}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                {formatCurrency(getTotalBalance())}
              </div>
              <p className="text-xs text-slate-500 mt-1">Across {accounts.length} accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Patrimônio Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {formatCurrency(accounts.filter(a => a.current_balance > 0).reduce((sum, a) => sum + a.current_balance, 0))}
              </div>
              <p className="text-xs text-slate-500 mt-1">Assets value</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <PieChart className="h-4 w-4 mr-2 text-purple-500" />
                Tipos de Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {new Set(accounts.map(a => a.type)).size}
              </div>
              <p className="text-xs text-slate-500 mt-1">Different types</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Ainda sem contas</h3>
              <p className="text-slate-500 text-center mb-6">
                Get started by creating your first financial account
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all cursor-pointer"
                onClick={() => {
                  setEditaringAccount(account)
                  setShowForm(true)
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: account.color || "#0891b2",
                          opacity: 0.2,
                        }}
                      >
                        <div style={{ color: account.color || "#06b6d4" }}>{getAccountIcon(account.type)}</div>
                      </div>
                      <div>
                        <CardTitle className="text-slate-100 text-lg">{account.name}</CardTitle>
                        {account.institution_name && (
                          <CardDescription className="text-slate-500 text-sm">
                            {account.institution_name}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-600/50">
                      {account.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold text-slate-100">
                        {formatCurrency(account.current_balance, account.currency)}
                      </div>
                      <div className="text-sm text-slate-500">Current Balance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Account Form Modal */}
        {showForm && (
          <AccountForm
            account={editingAccount}
            tenantId={tenantId!}
            onClose={() => {
              setShowForm(false)
              setEditaringAccount(null)
            }}
            onSave={() => {
              setShowForm(false)
              setEditaringAccount(null)
              fetchAccounts()
            }}
          />
        )}
      </div>
    </div>
  )
}
