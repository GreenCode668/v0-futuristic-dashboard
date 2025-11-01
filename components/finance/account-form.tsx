"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

type Account = {
  id: string
  name: string
  type: string
  currency: string
  current_balance: number
  initial_balance: number
  institution_name: string | null
  color: string | null
}

type AccountFormProps = {
  account: Account | null
  tenantId: string
  onClose: () => void
  onSave: () => void
}

export function AccountForm({ account, tenantId, onClose, onSave }: AccountFormProps) {
  const [name, setName] = useState(account?.name || "")
  const [type, setType] = useState(account?.type || "bank")
  const [currency, setCurrency] = useState(account?.currency || "USD")
  const [balance, setBalance] = useState(account?.current_balance?.toString() || "0")
  const [institutionName, setInstitutionName] = useState(account?.institution_name || "")
  const [color, setColor] = useState(account?.color || "#06b6d4")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const balanceNum = parseFloat(balance)

      if (account) {
        // Update existing account
        const { error: updateError } = await supabase
          .from("accounts")
          .update({
            name,
            type,
            currency,
            institution_name: institutionName || null,
            color,
          })
          .eq("id", account.id)

        if (updateError) throw updateError
      } else {
        // Create new account
        const { error: createError } = await supabase.from("accounts").insert({
          tenant_id: tenantId,
          name,
          type,
          currency,
          initial_balance: balanceNum,
          current_balance: balanceNum,
          institution_name: institutionName || null,
          color,
        })

        if (createError) throw createError
      }

      onSave()
    } catch (err: any) {
      console.error("Error saving account:", err)
      setError(err.message || "Failed to save account")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!account) return
    if (!confirm("Are you sure you want to delete this account?")) return

    setLoading(true)
    try {
      const { error } = await supabase.from("accounts").update({ is_active: false }).eq("id", account.id)

      if (error) throw error
      onSave()
    } catch (err: any) {
      console.error("Error deleting account:", err)
      setError(err.message || "Failed to delete account")
    } finally {
      setLoading(false)
    }
  }

  const colorOptions = [
    { name: "Cyan", value: "#06b6d4" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Green", value: "#10b981" },
    { name: "Yellow", value: "#f59e0b" },
    { name: "Red", value: "#ef4444" },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-slate-900/95 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">
                {account ? "Edit Account" : "Create New Account"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {account ? "Update your account details" : "Add a new financial account"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-100">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-slate-300">
                  Account Name *
                </Label>
                <input
                  id="name"
                  type="text"
                  placeholder="Main Checking Account"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-slate-300">
                  Account Type *
                </Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="wallet">Digital Wallet</option>
                  <option value="investment">Investment</option>
                </select>
              </div>

              <div>
                <Label htmlFor="currency" className="text-slate-300">
                  Currency *
                </Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              {!account && (
                <div className="col-span-2">
                  <Label htmlFor="balance" className="text-slate-300">
                    Initial Balance *
                  </Label>
                  <input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    required
                    className="w-full mt-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              <div className="col-span-2">
                <Label htmlFor="institution" className="text-slate-300">
                  Institution Name (Optional)
                </Label>
                <input
                  id="institution"
                  type="text"
                  placeholder="Chase, Bank of America, etc."
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="col-span-2">
                <Label className="text-slate-300">Account Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setColor(colorOption.value)}
                      className={`w-10 h-10 rounded-full border-2 ${
                        color === colorOption.value ? "border-white scale-110" : "border-transparent"
                      } transition-all`}
                      style={{ backgroundColor: colorOption.value }}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {account && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </Button>
              )}
              <div className="flex-1" />
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
                {loading ? "Saving..." : account ? "Update Account" : "Create Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
