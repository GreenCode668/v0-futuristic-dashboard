"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  Hexagon,
  RefreshCw,
  Upload,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems = [
    {
      label: "Painel",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Contas",
      href: "/accounts",
      icon: Wallet,
    },
    {
      label: "Transações",
      href: "/transactions",
      icon: ArrowRightLeft,
    },
    {
      label: "Categorias",
      href: "/categories",
      icon: Tag,
    },
    {
      label: "Relatórios",
      href: "/reports",
      icon: BarChart3,
    },
    {
      label: "Recorrentes",
      href: "/recurring",
      icon: RefreshCw,
    },
    {
      label: "Importar/Exportar",
      href: "/import-export",
      icon: Upload,
    },
  ]

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-950/50 border-r border-slate-800/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <Hexagon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              FinanceOS
            </div>
            <div className="text-xs text-slate-500">Gestão Financeira</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-800/50 space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Configurações</span>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full justify-start gap-3 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  )
}
