"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Hexagon, Building2, ArrowRight, Check } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Step 1: Company/Tenant Info
  const [companyName, setCompanyName] = useState("")
  const [companySlug, setCompanySlug] = useState("")
  const [currency, setCurrency] = useState("USD")

  // Step 2: Initial Account
  const [accountName, setAccountName] = useState("")
  const [accountType, setAccountType] = useState<"cash" | "bank" | "card">("bank")
  const [initialBalance, setInitialBalance] = useState("0")

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleCompanyNameChange = (name: string) => {
    setCompanyName(name)
    if (!companySlug || companySlug === generateSlug(companyName)) {
      setCompanySlug(generateSlug(name))
    }
  }

  const handleCreateTenant = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("Current user:", user)
      if (!user) throw new Error("Not authenticated")

      // Ensure user profile exists in users table
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (!existingUser) {
        console.log("Creating user profile...")
        const { error: userProfileError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        })

        if (userProfileError) {
          console.error("User profile creation error:", userProfileError)
          // Continue anyway - it might already exist
        }
      }

      // Create tenant
      console.log("Creating tenant with:", { name: companyName, slug: companySlug, settings: { currency } })
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          name: companyName,
          slug: companySlug,
          settings: { currency },
        })
        .select()
        .single()

      console.log("Tenant result:", { tenant, tenantError })
      if (tenantError) {
        console.error("Tenant creation error:", tenantError)
        throw new Error(`Failed to create tenant: ${tenantError.message}`)
      }

      if (!tenant) throw new Error("Tenant was not created")

      // Create user-tenant relationship as owner
      console.log("Creating user-tenant relationship:", { user_id: user.id, tenant_id: tenant.id, role: "owner" })
      const { error: userTenantError } = await supabase.from("user_tenants").insert({
        user_id: user.id,
        tenant_id: tenant.id,
        role: "owner",
      })

      console.log("User-tenant error:", userTenantError)
      if (userTenantError) {
        console.error("User-tenant creation error:", userTenantError)
        throw new Error(`Failed to create user-tenant relationship: ${userTenantError.message}`)
      }

      // Create initial account
      console.log("Creating account:", {
        tenant_id: tenant.id,
        name: accountName || "Main Account",
        type: accountType,
        currency,
        initial_balance: parseFloat(initialBalance),
      })
      const { error: accountError } = await supabase.from("accounts").insert({
        tenant_id: tenant.id,
        name: accountName || "Main Account",
        type: accountType,
        currency,
        initial_balance: parseFloat(initialBalance),
        current_balance: parseFloat(initialBalance),
      })

      console.log("Account error:", accountError)
      if (accountError) {
        console.error("Account creation error:", accountError)
        throw new Error(`Failed to create account: ${accountError.message}`)
      }

      // Create default categories
      console.log("Creating default categories...")
      await createDefaultCategories(tenant.id)

      console.log("Onboarding complete! Redirecting...")
      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error("Onboarding error:", error)
      setError(error.message || error.toString() || "Failed to create your workspace")
    } finally {
      setLoading(false)
    }
  }

  const createDefaultCategories = async (tenantId: string) => {
    const defaultCategories = [
      // Income categories
      { name: "Salary", type: "income", icon: "💰", color: "#10b981" },
      { name: "Freelance", type: "income", icon: "💼", color: "#3b82f6" },
      { name: "Investments", type: "income", icon: "📈", color: "#8b5cf6" },
      { name: "Other Income", type: "income", icon: "💵", color: "#06b6d4" },

      // Expense categories
      { name: "Food & Dining", type: "expense", icon: "🍔", color: "#ef4444" },
      { name: "Transportation", type: "expense", icon: "🚗", color: "#f59e0b" },
      { name: "Utilities", type: "expense", icon: "💡", color: "#eab308" },
      { name: "Entertainment", type: "expense", icon: "🎬", color: "#ec4899" },
      { name: "Shopping", type: "expense", icon: "🛍️", color: "#a855f7" },
      { name: "Healthcare", type: "expense", icon: "🏥", color: "#14b8a6" },
      { name: "Education", type: "expense", icon: "📚", color: "#6366f1" },
      { name: "Other Expenses", type: "expense", icon: "📝", color: "#64748b" },
    ]

    await supabase.from("categories").insert(
      defaultCategories.map((cat) => ({
        tenant_id: tenantId,
        ...cat,
      }))
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Hexagon className="h-12 w-12 text-cyan-500" />
          </div>
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Welcome! Let's set up your workspace
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Step {step} of 2
          </CardDescription>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-4">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-cyan-500" : "bg-slate-700"}`}></div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-cyan-500" : "bg-slate-700"}`}></div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <Building2 className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Company Information</h3>
                  <p className="text-sm text-slate-400">Tell us about your organization</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-slate-300">
                  Company Name
                </Label>
                <input
                  id="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySlug" className="text-slate-300">
                  Workspace URL
                </Label>
                <div className="flex items-center">
                  <input
                    id="companySlug"
                    type="text"
                    placeholder="acme-inc"
                    value={companySlug}
                    onChange={(e) => setCompanySlug(generateSlug(e.target.value))}
                    required
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-l-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <div className="px-4 py-2 bg-slate-800 border border-l-0 border-slate-700/50 rounded-r-md text-slate-400">
                    .finance.app
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-slate-300">
                  Default Currency
                </Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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

              <Button onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 mt-6">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <Check className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Initial Account</h3>
                  <p className="text-sm text-slate-400">Set up your first financial account</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-slate-300">
                  Account Name
                </Label>
                <input
                  id="accountName"
                  type="text"
                  placeholder="Main Bank Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType" className="text-slate-300">
                  Account Type
                </Label>
                <select
                  id="accountType"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="wallet">Digital Wallet</option>
                  <option value="investment">Investment Account</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialBalance" className="text-slate-300">
                  Initial Balance ({currency})
                </Label>
                <input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50">
                  Back
                </Button>
                <Button onClick={handleCreateTenant} disabled={loading} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                  {loading ? "Creating..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
