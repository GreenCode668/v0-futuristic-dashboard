"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  parseCSV,
  parseOFX,
  convertOFXToTransactions,
  generateCSV,
  generatePDFReport,
  downloadCSV,
  TransactionCSVRow,
} from "@/lib/utils/import-export"
import {
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

type ImportStatus = "idle" | "processing" | "success" | "error"

export default function ImportExportPage() {
  const { tenantId, loading: tenantLoading } = useTenant()
  const supabase = createClient()

  const [importStatus, setImportStatus] = useState<ImportStatus>("idle")
  const [importMessage, setImportMessage] = useState("")
  const [importedCount, setImportedCount] = useState(0)
  const [previewData, setPreviewData] = useState<TransactionCSVRow[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const [exporting, setExporting] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "csv" | "ofx") => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportStatus("processing")
    setImportMessage("Lendo arquivo...")
    setPreviewData([])
    setShowPreview(false)

    try {
      const text = await file.text()
      let transactions: TransactionCSVRow[]

      if (type === "csv") {
        transactions = parseCSV(text)
      } else {
        const ofxTransactions = parseOFX(text)
        transactions = convertOFXToTransactions(ofxTransactions)
      }

      if (transactions.length === 0) {
        setImportStatus("error")
        setImportMessage("Nenhuma transação válida encontrada no arquivo")
        return
      }

      setPreviewData(transactions)
      setShowPreview(true)
      setImportStatus("success")
      setImportMessage(`Analisado com sucesso ${transactions.length} transações. Revise e confirme para importar.`)
    } catch (error: any) {
      setImportStatus("error")
      setImportMessage(error.message || "Failed to parse file")
    }

    // Reset file input
    event.target.value = ""
  }

  const confirmImport = async () => {
    if (!tenantId) {
      setImportStatus("error")
      setImportMessage("Por favor, entre para importar transações")
      return
    }

    if (previewData.length === 0) {
      setImportStatus("error")
      setImportMessage("No transactions to import")
      return
    }

    setImportStatus("processing")
    setImportMessage("Importando transações...")

    try {
      // Fetch accounts and categories to map names to IDs
      const { data: accounts } = await supabase
        .from("accounts")
        .select("id, name")
        .eq("tenant_id", tenantId)

      const { data: categories } = await supabase
        .from("categories")
        .select("id, name, type")
        .eq("tenant_id", tenantId)

      // Create a map for quick lookup
      const accountMap = new Map(accounts?.map((a) => [a.name.toLowerCase(), a.id]) || [])
      const categoryMap = new Map(categories?.map((c) => [c.name.toLowerCase(), { id: c.id, type: c.type }]) || [])

      // Transform CSV data to database format
      const transactionsToInsert = previewData.map((t) => {
        const accountId = t.account ? accountMap.get(t.account.toLowerCase()) : null
        const categoryId = t.category ? categoryMap.get(t.category.toLowerCase())?.id : null
        const fromAccountId = t.fromAccount ? accountMap.get(t.fromAccount.toLowerCase()) : null
        const toAccountId = t.toAccount ? accountMap.get(t.toAccount.toLowerCase()) : null

        return {
          tenant_id: tenantId,
          type: t.type,
          amount: t.amount,
          description: t.description,
          date: new Date(t.date).toISOString(),
          notes: t.notes || null,
          account_id: accountId || (accounts && accounts.length > 0 ? accounts[0].id : null),
          category_id: categoryId,
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
        }
      })

      // Insert transactions
      const { data, error } = await supabase.from("transactions").insert(transactionsToInsert).select()

      if (error) {
        throw error
      }

      setImportedCount(data?.length || 0)
      setImportStatus("success")
      setImportMessage(`Importado com sucesso ${data?.length || 0} transações!`)
      setShowPreview(false)
      setPreviewData([])
    } catch (error: any) {
      setImportStatus("error")
      setImportMessage(error.message || "Failed to importar transações")
    }
  }

  const cancelImport = () => {
    setPreviewData([])
    setShowPreview(false)
    setImportStatus("idle")
    setImportMessage("")
  }

  const handleExportCSV = async () => {
    setExporting(true)

    try {
      if (!tenantId) {
        alert("Por favor, entre para exportar transações")
        return
      }

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*, accounts(name), categories(name, icon, color), from_accounts:accounts!transactions_from_account_id_fkey(name), to_accounts:accounts!transactions_to_account_id_fkey(name)")
        .eq("tenant_id", tenantId)
        .order("date", { ascending: false })

      if (error) throw error

      if (!transactions || transactions.length === 0) {
        alert("No transactions to export")
        return
      }

      const csvContent = generateCSV(transactions)
      downloadCSV(csvContent, `transactions-export-${new Date().toISOString().split("T")[0]}.csv`)
    } catch (error: any) {
      alert(error.message || "Failed to exportar transações")
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)

    try {
      if (!tenantId) {
        alert("Por favor, entre para export report")
        return
      }

      // Fetch data for report
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*, categories(name, icon, color)")
        .eq("tenant_id", tenantId)
        .gte("date", startOfMonth)
        .order("date", { ascending: false })

      if (error) throw error

      if (!transactions || transactions.length === 0) {
        alert("No transactions found for this period")
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

      const categoryData = Array.from(categoryMap.values())

      const reportData = {
        period: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        summary: {
          totalIncome,
          totalExpense,
          netIncome: totalIncome - totalExpense,
          transactionCount: transactions.length,
        },
        categoryData,
        transactions,
      }

      generatePDFReport(reportData)
    } catch (error: any) {
      alert(error.message || "Failed to generate PDF report")
    } finally {
      setExporting(false)
    }
  }

  if (tenantLoading) {
    return <LoadingSpinner message="Loading..." />
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center text-slate-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Por favor, entre para usar recursos de importação/exportação</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Importar & Exportar
          </h1>
          <p className="text-slate-400 mt-1">Importe transações de arquivos CSV/OFX ou exporte seus dados</p>
        </div>

        {/* Status Message */}
        {importStatus !== "idle" && importMessage && (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardContent className="pt-6">
              <div
                className={`flex items-center gap-3 ${
                  importStatus === "success"
                    ? "text-green-400"
                    : importStatus === "error"
                    ? "text-red-400"
                    : "text-cyan-400"
                }`}
              >
                {importStatus === "processing" && <Loader2 className="h-5 w-5 animate-spin" />}
                {importStatus === "success" && <CheckCircle className="h-5 w-5" />}
                {importStatus === "error" && <XCircle className="h-5 w-5" />}
                <p>{importMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Import Section */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Upload className="h-5 w-5 text-cyan-500" />
                Importar Transações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Arquivo CSV</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Envie um arquivo CSV com colunas: Data, Tipo, Valor, Descrição, Categoria, Conta
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, "csv")}
                    className="hidden"
                    disabled={importStatus === "processing"}
                  />
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).closest("label")?.querySelector("input")
                      input?.click()
                    }}
                    disabled={importStatus === "processing"}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Escolher Arquivo CSV
                  </Button>
                </label>
              </div>

              <div className="border-t border-slate-700/50 pt-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Arquivo OFX</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Envie um arquivo OFX exportado do seu banco ou instituição financeira
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept=".ofx,.qfx"
                    onChange={(e) => handleFileUpload(e, "ofx")}
                    className="hidden"
                    disabled={importStatus === "processing"}
                  />
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).closest("label")?.querySelector("input")
                      input?.click()
                    }}
                    disabled={importStatus === "processing"}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Escolher Arquivo OFX
                  </Button>
                </label>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-xs text-cyan-400">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Transações serão correspondidas com contas e categorias existentes por nome
              </div>
            </CardContent>
          </Card>

          {/* Export Section */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100">
                <Download className="h-5 w-5 text-cyan-500" />
                Exportar Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Exportar Transações (CSV)</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Baixar todas as suas transações em formato CSV
                </p>
                <Button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar para CSV
                    </>
                  )}
                </Button>
              </div>

              <div className="border-t border-slate-700/50 pt-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Exportar Relatório (PDF)</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Gerar um relatório PDF com resumo e gráficos do mês atual
                </p>
                <Button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar Relatório PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && previewData.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-100">Visualizar ({previewData.length} transactions)</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={cancelImport}
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmImport}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Importação
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-slate-400">Data</th>
                      <th className="text-left py-2 px-3 text-slate-400">Tipo</th>
                      <th className="text-left py-2 px-3 text-slate-400">Valor</th>
                      <th className="text-left py-2 px-3 text-slate-400">Descrição</th>
                      <th className="text-left py-2 px-3 text-slate-400">Categoria</th>
                      <th className="text-left py-2 px-3 text-slate-400">Conta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((transaction, index) => (
                      <tr key={index} className="border-b border-slate-800">
                        <td className="py-2 px-3 text-slate-300">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              transaction.type === "income"
                                ? "bg-green-500/20 text-green-400"
                                : transaction.type === "expense"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          ${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-slate-300">{transaction.description}</td>
                        <td className="py-2 px-3 text-slate-400">{transaction.category || "-"}</td>
                        <td className="py-2 px-3 text-slate-400">{transaction.account || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <p className="text-xs text-slate-500 mt-3 text-center">
                    Showing 10 of {previewData.length} transactions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CSV Template Section */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100">Modelo CSV</CardTitle>
              <a
                href="/sample-transactions.csv"
                download
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Baixar Exemplo
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-3">
              Seu arquivo CSV deve ter as seguintes colunas. Use este formato de exemplo:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-slate-300 font-mono">
                {`Data,Tipo,Valor,Descrição,Categoria,Conta,From Conta,To Conta,Notas
2025-11-01,expense,45.50,Grocery shopping,Food & Dining,Checking,,,Weekly groceries
2025-11-01,income,3500.00,Salary payment,Salary,Checking,,,Monthly salary
2025-11-02,transfer,500.00,Savings transfer,,,Checking,Savings,Monthly savings`}
              </pre>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <p>
                <strong className="text-slate-300">Colunas obrigatórias:</strong> Data, Tipo, Valor
              </p>
              <p>
                <strong className="text-slate-300">Colunas opcionais:</strong> Descrição, Categoria, Conta, From
                Conta, To Conta, Notas
              </p>
              <p>
                <strong className="text-slate-300">Valores de tipo:</strong> receita, despesa ou transferência
              </p>
              <p>
                <strong className="text-slate-300">Formato de data:</strong> YYYY-MM-DD (e.g., 2025-11-01)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
