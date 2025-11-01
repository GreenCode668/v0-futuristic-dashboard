import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ message = "Carregando...", fullScreen = true }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
          <div className="text-cyan-500 font-medium">{message}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      <div className="text-cyan-500 font-medium">{message}</div>
    </div>
  )
}
