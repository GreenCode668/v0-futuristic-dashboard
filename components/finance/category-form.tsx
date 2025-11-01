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

type CategoryFormProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editCategory?: any
}

const EMOJI_OPTIONS = [
  "💰", "💵", "💳", "💸", "🏦", "📈", "📊", "💼", "🎯", "💎",
  "🍔", "🍕", "☕", "🛒", "🎬", "🎮", "🏠", "🚗", "✈️", "🏥",
  "📚", "👕", "💡", "🎵", "🎨", "⚽", "🌍", "🎁", "🔧", "📱",
  "💪", "🌮", "🍜", "🍺", "🎪", "🏋️", "🚲", "🏖️", "📦", "🛍️"
]

const COLOR_OPTIONS = [
  "#ef4444", "#f59e0b", "#eab308", "#10b981", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#f43f5e", "#14b8a6", "#84cc16", "#f97316", "#64748b"
]

export function CategoryForm({ isOpen, onClose, onSuccess, editCategory }: CategoryFormProps) {
  const { tenantId } = useTenant()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [icon, setIcon] = useState("📝")
  const [color, setColor] = useState("#64748b")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name)
      setType(editCategory.type)
      setIcon(editCategory.icon || "📝")
      setColor(editCategory.color || "#64748b")
      setDescription(editCategory.description || "")
    } else {
      resetForm()
    }
  }, [editCategory])

  const resetForm = () => {
    setName("")
    setType("expense")
    setIcon("📝")
    setColor("#64748b")
    setDescription("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return

    setLoading(true)

    try {
      const categoryData = {
        tenant_id: tenantId,
        name,
        type,
        icon,
        color,
        description: description || null,
      }

      if (editCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editCategory.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("categories").insert(categoryData)

        if (error) throw error
      }

      resetForm()
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editCategory) return
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) return

    setLoading(true)

    try {
      const { error } = await supabase.from("categories").delete().eq("id", editCategory.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Failed to delete category. It may be in use by existing transactions.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {editCategory ? "Edit Category" : "New Category"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {editCategory ? "Update category details" : "Create a new category for organizing transactions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Category Name *
            </Label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Groceries, Salary, Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-slate-300">Type *</Label>
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
                <div className="text-sm font-medium">Expense</div>
              </button>
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label className="text-slate-300">Icon</Label>
            <div className="grid grid-cols-10 gap-2 p-3 bg-slate-800/30 border border-slate-700/50 rounded-md max-h-32 overflow-y-auto">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-2xl p-2 rounded transition-all ${
                    icon === emoji
                      ? "bg-cyan-500/20 ring-2 ring-cyan-500"
                      : "hover:bg-slate-700/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="text-slate-300">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    color === colorOption
                      ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description (Optional)
            </Label>
            <textarea
              id="description"
              placeholder="Add notes about this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <div className="text-sm text-slate-400 mb-2">Preview</div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {icon}
              </div>
              <div>
                <div className="font-medium text-slate-200">{name || "Category Name"}</div>
                <div className="text-sm text-slate-500 capitalize">{type}</div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editCategory && (
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
              {loading ? "Saving..." : editCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
