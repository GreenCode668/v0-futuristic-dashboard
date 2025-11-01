"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, X } from "lucide-react"

type TransactionType = "income" | "expense" | "transfer"

type Account = {
  id: string
  name: string
  type: string
  current_balance: number
}

type Category = {
  id: string
  name: string
  type: "income" | "expense"
  icon: string
  color: string
}

type TransactionFormProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editTransaction?: any
  defaultType?: TransactionType
}

export function TransactionForm({
  isOpen,
  onClose,
  onSuccess,
  editTransaction,
  defaultType = "expense",
}: TransactionFormProps) {
  const { tenantId } = useTenant()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Form state
  const [type, setType] = useState<TransactionType>(defaultType)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [toAccountId, setToAccountId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (isOpen && tenantId) {
      fetchAccounts()
      fetchCategories()
    }
  }, [isOpen, tenantId])

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type)
      setAmount(editTransaction.amount.toString())
      setDescription(editTransaction.description || "")
      setAccountId(editTransaction.account_id || "")
      setCategoryId(editTransaction.category_id || "")
      setToAccountId(editTransaction.to_account_id || "")
      setDate(new Date(editTransaction.date).toISOString().split("T")[0])
      setNotes(editTransaction.notes || "")
    } else {
      setType(defaultType)
      resetForm()
    }
  }, [editTransaction, defaultType])

  const fetchAccounts = async () => {
    if (!tenantId) return

    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("name")

    if (data) {
      setAccounts(data)
      if (data.length > 0 && !accountId) {
        setAccountId(data[0].id)
      }
    }
  }

  const fetchCategories = async () => {
    if (!tenantId) return

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name")

    if (data) setCategories(data)
  }

  const resetForm = () => {
    setAmount("")
    setDescription("")
    setCategoryId("")
    setToAccountId("")
    setDate(new Date().toISOString().split("T")[0])
    setNotes("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return

    setLoading(true)

    try {
      const transactionData = {
        tenant_id: tenantId,
        type,
        amount: parseFloat(amount),
        description: description || null,
        account_id: type !== "transfer" ? accountId : null,
        category_id: type !== "transfer" ? (categoryId || null) : null,
        from_account_id: type === "transfer" ? accountId : null,
        to_account_id: type === "transfer" ? toAccountId : null,
        date: new Date(date).toISOString(),
        notes: notes || null,
      }

      if (editTransaction) {
        const { error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", editTransaction.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("transactions").insert(transactionData)

        if (error) throw error
      }

      resetForm()
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving transaction:", error)
      alert("Failed to save transaction")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editTransaction) return
    if (!confirm("Are you sure you want to delete this transaction?")) return

    setLoading(true)

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", editTransaction.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("Failed to delete transaction")
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter((cat) => cat.type === type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {editTransaction ? "Edit Transaction" : "New Transaction"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {type === "income"
              ? "Record money received"
              : type === "expense"
              ? "Record money spent"
              : "Transfer between accounts"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Selector */}
          <div className="space-y-2">
            <Label className="text-slate-300">Transaction Type</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`p-3 rounded-lg border transition-all ${
                  type === "income"
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <ArrowDownRight className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Income</div>
              </button>

              <button
                type="button"
                onClick={() => setType("expense")}
                className={`p-3 rounded-lg border transition-all ${
                  type === "expense"
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <ArrowUpRight className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Expense</div>
              </button>

              <button
                type="button"
                onClick={() => setType("transfer")}
                className={`p-3 rounded-lg border transition-all ${
                  type === "transfer"
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <ArrowRightLeft className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Transfer</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-300">
                Amount *
              </Label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-slate-300">
                Date *
              </Label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description
            </Label>
            <input
              id="description"
              type="text"
              placeholder="What is this transaction for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {type === "transfer" ? (
            <div className="grid grid-cols-2 gap-4">
              {/* From Account */}
              <div className="space-y-2">
                <Label htmlFor="fromAccount" className="text-slate-300">
                  From Account *
                </Label>
                <select
                  id="fromAccount"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (${account.current_balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Account */}
              <div className="space-y-2">
                <Label htmlFor="toAccount" className="text-slate-300">
                  To Account *
                </Label>
                <select
                  id="toAccount"
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((acc) => acc.id !== accountId)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} (${account.current_balance.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Account */}
              <div className="space-y-2">
                <Label htmlFor="account" className="text-slate-300">
                  Account *
                </Label>
                <select
                  id="account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (${account.current_balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-300">
                  Category
                </Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">
              Notes
            </Label>
            <textarea
              id="notes"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            {editTransaction && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="border-red-700 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300"
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              {loading ? "Saving..." : editTransaction ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
