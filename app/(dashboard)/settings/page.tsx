"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/lib/hooks/useTenant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Settings as SettingsIcon, Building2, User, Bell, Lock } from "lucide-react"

export default function SettingsPage() {
  const { tenantId, loading: tenantLoading } = useTenant()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [tenant, setTenant] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [tenantId])

  const fetchData = async () => {
    setLoading(true)

    try {
      // Get user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      setUser(authUser)

      // Get tenant
      if (tenantId) {
        const { data: tenantData } = await supabase
          .from("tenants")
          .select("*")
          .eq("id", tenantId)
          .single()

        setTenant(tenantData)
      }
    } catch (error) {
      console.error("Error fetching settings data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (tenantLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 flex items-center justify-center">
        <div className="text-cyan-500">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-400 mt-1">Manage your account and workspace preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-500" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Full Name</Label>
                <input
                  type="text"
                  defaultValue={user?.user_metadata?.full_name || ""}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Workspace Settings */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-500" />
                Workspace Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Company Name</Label>
                <input
                  type="text"
                  defaultValue={tenant?.name || ""}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Default Currency</Label>
                <select className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                Update Workspace
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Bell className="h-5 w-5 text-cyan-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">Email Notifications</div>
                  <div className="text-sm text-slate-400">Receive email updates about your transactions</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">Recurring Transaction Alerts</div>
                  <div className="text-sm text-slate-400">Get notified when recurring transactions are created</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">Budget Alerts</div>
                  <div className="text-sm text-slate-400">Alert me when approaching budget limits</div>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Lock className="h-5 w-5 text-cyan-500" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Change Password</Label>
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                >
                  Update Password
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="font-medium text-slate-200 mb-2">Danger Zone</div>
                <Button
                  variant="outline"
                  className="border-red-700 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
