"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { generateMockCategories } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CategoryForm } from "@/components/finance/category-form"
import { Plus, Tag, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

type Category = {
  id: string
  name: string
  type: "income" | "expense"
  icon: string
  color: string
  description?: string | null
  created_at: string
  transaction_count?: number
  total_amount?: number
}

export default function CategoriesPage() {
  const { tenantId, loading: tenantLoading } = useTenant()
  const supabase = createClient()

  const mockCategories = generateMockCategories() as any[]
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")

  useEffect(() => {
    if (tenantId) {
      fetchCategories()
    } else {
      setLoading(false)
    }
  }, [tenantId])

  const fetchCategories = async () => {
    if (!tenantId) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("type")
        .order("name")

      if (error) {
        console.error("Error fetching categories:", error)
        setCategories(mockCategories)
      } else {
        if (data && data.length > 0) {
          setCategories(data)
        } else {
          setCategories(mockCategories)
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories(mockCategories)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditCategory(category)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditCategory(null)
  }

  const handleSuccess = () => {
    fetchCategories()
  }

  const filteredCategories = categories.filter((cat) => {
    if (filter === "all") return true
    return cat.type === filter
  })

  const incomeCount = categories.filter((c) => c.type === "income").length
  const expenseCount = categories.filter((c) => c.type === "expense").length
  const hasRealData = tenantId && categories.some(c => !mockCategories.find(mock => mock.id === c.id))

  if (tenantLoading || loading) {
    return <LoadingSpinner message="Carregando categorias..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Categories
            </h1>
            <p className="text-slate-400 mt-1">Organize suas receitas e despesas</p>
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
                setEditCategory(null)
                setIsFormOpen(true)
              }}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <Tag className="h-4 w-4 mr-2 text-cyan-500" />
                Total de Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {categories.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Categorias ativas</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-green-500" />
                Categorias de Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{incomeCount}</div>
              <p className="text-xs text-slate-500 mt-1">Fontes de dinheiro</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-normal flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-red-500" />
                Categorias de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{expenseCount}</div>
              <p className="text-xs text-slate-500 mt-1">Tipos de gastos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={
              filter === "all"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600"
                : "border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
            }
          >
            Todas ({categories.length})
          </Button>
          <Button
            variant={filter === "income" ? "default" : "outline"}
            onClick={() => setFilter("income")}
            className={
              filter === "income"
                ? "bg-green-600 hover:bg-green-700"
                : "border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
            }
          >
            Income ({incomeCount})
          </Button>
          <Button
            variant={filter === "expense" ? "default" : "outline"}
            onClick={() => setFilter("expense")}
            className={
              filter === "expense"
                ? "bg-red-600 hover:bg-red-700"
                : "border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
            }
          >
            Expenses ({expenseCount})
          </Button>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center text-slate-500">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma categoria encontrada</p>
                <p className="text-sm mt-2">Crie sua primeira categoria para começar</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => handleEdit(category)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                      }}
                    >
                      {category.icon}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-100 mb-1">{category.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            category.type === "income"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {category.type}
                        </span>
                      </div>
                      {category.transaction_count !== undefined && (
                        <p className="text-sm text-slate-400">
                          {category.transaction_count} transações • {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                          }).format(category.total_amount || 0)}
                        </p>
                      )}
                      {category.description && (
                        <p className="text-sm text-slate-400 line-clamp-2 mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        editCategory={editCategory}
      />
    </div>
  )
}
