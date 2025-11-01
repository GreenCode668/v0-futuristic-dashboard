declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf"

  interface UserOptions {
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    startY?: number
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
    pageBreak?: "auto" | "avoid" | "always"
    theme?: "striped" | "grid" | "plain"
    headStyles?: any
    bodyStyles?: any
    footStyles?: any
    alternateRowStyles?: any
    columnStyles?: any
    didDrawPage?: (data: any) => void
    didDrawCell?: (data: any) => void
    willDrawCell?: (data: any) => void
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): void
}
