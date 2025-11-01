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
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

type RecurringFormProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editRecurring?: any
}

export function RecurringForm({ isOpen, onClose, onSuccess, editRecurring }: RecurringFormProps) {
  const { tenantId } = useTenant()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  // Form state
  const [type, setType] = useState<"income" | "expense">("expense")
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")
  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (isOpen && tenantId) {
      fetchAccounts()
      fetchCategories()
    }
  }, [isOpen, tenantId])

  useEffect(() => {
    if (editRecurring) {
      setType(editRecurring.type)
      setName(editRecurring.name)
      setAmount(editRecurring.amount.toString())
      setFrequency(editRecurring.frequency)
      setAccountId(editRecurring.account_id || "")
      setCategoryId(editRecurring.category_id || "")
      setStartDate(new Date(editRecurring.start_date).toISOString().split("T")[0])
      setEndDate(editRecurring.end_date ? new Date(editRecurring.end_date).toISOString().split("T")[0] : "")
      setDescription(editRecurring.description || "")
      setIsActive(editRecurring.is_active)
    } else {
      resetForm()
    }
  }, [editRecurring])

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
    setName("")
    setAmount("")
    setFrequency("monthly")
    setCategoryId("")
    setStartDate(new Date().toISOString().split("T")[0])
    setEndDate("")
    setDescription("")
    setIsActive(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return

    setLoading(true)

    try {
      const recurringData = {
        tenant_id: tenantId,
        type,
        name,
        amount: parseFloat(amount),
        frequency,
        account_id: accountId,
        category_id: categoryId || null,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        description: description || null,
        is_active: isActive,
      }

      if (editRecurring) {
        const { error } = await supabase
          .from("recurring_templates")
          .update(recurringData)
          .eq("id", editRecurring.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("recurring_templates").insert(recurringData)

        if (error) throw error
      }

      resetForm()
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving recurring transaction:", error)
      alert("Failed to save recurring transaction")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editRecurring) return
    if (!confirm("Are you sure you want to delete this recurring transaction?")) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from("recurring_templates")
        .delete()
        .eq("id", editRecurring.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error deleting recurring transaction:", error)
      alert("Failed to delete recurring transaction")
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
            {editRecurring ? "Edit Recurring Transaction" : "New Recurring Transaction"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Set up automatic recurring {type}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label className="text-slate-300">Transaction Type</Label>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Name *
            </Label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Monthly Rent, Weekly Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
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

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-slate-300">
                Frequency *
              </Label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

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
                    {account.name}
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

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-slate-300">
                Start Date *
              </Label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-slate-300">
                End Date (Optional)
              </Label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
            />
            <Label htmlFor="isActive" className="text-slate-300">
              Active (will create transactions automatically)
            </Label>
          </div>

          <DialogFooter className="gap-2">
            {editRecurring && (
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
              {loading ? "Saving..." : editRecurring ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
