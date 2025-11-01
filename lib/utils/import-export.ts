import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// ==================== CSV UTILITIES ====================

export interface TransactionCSVRow {
  date: string
  type: "income" | "expense" | "transfer"
  amount: number
  description: string
  category?: string
  account?: string
  fromAccount?: string
  toAccount?: string
  notes?: string
}

export const parseCSV = (csvText: string): TransactionCSVRow[] => {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) {
    throw new Error("CSV file must have at least a header row and one data row")
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const transactions: TransactionCSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue // Skip empty lines

    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || ""
    })

    // Validate required fields
    if (!row.date || !row.type || !row.amount) {
      throw new Error(`Row ${i + 1}: Missing required fields (date, type, amount)`)
    }

    // Validate type
    if (!["income", "expense", "transfer"].includes(row.type.toLowerCase())) {
      throw new Error(`Row ${i + 1}: Invalid type. Must be income, expense, or transfer`)
    }

    // Parse amount
    const amount = parseFloat(row.amount)
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Row ${i + 1}: Invalid amount`)
    }

    transactions.push({
      date: row.date,
      type: row.type.toLowerCase() as "income" | "expense" | "transfer",
      amount,
      description: row.description || "",
      category: row.category,
      account: row.account,
      fromAccount: row.fromaccount || row["from account"],
      toAccount: row.toaccount || row["to account"],
      notes: row.notes,
    })
  }

  return transactions
}

// Helper to properly parse CSV lines with quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export const generateCSV = (transactions: any[]): string => {
  const headers = ["Date", "Type", "Amount", "Description", "Category", "Account", "From Account", "To Account", "Notes"]
  const rows = transactions.map((t) => {
    const date = new Date(t.date).toLocaleDateString("en-US")
    const category = t.categories?.name || t.category?.name || ""
    const account = t.accounts?.name || t.account?.name || ""
    const fromAccount = t.from_accounts?.name || t.fromAccount?.name || ""
    const toAccount = t.to_accounts?.name || t.toAccount?.name || ""

    return [
      date,
      t.type,
      t.amount.toString(),
      escapeCSV(t.description || ""),
      escapeCSV(category),
      escapeCSV(account),
      escapeCSV(fromAccount),
      escapeCSV(toAccount),
      escapeCSV(t.notes || ""),
    ]
  })

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  return csvContent
}

const escapeCSV = (value: string): string => {
  if (!value) return ""
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ==================== OFX UTILITIES ====================

export interface OFXTransaction {
  type: string
  date: string
  amount: number
  fitId: string
  name: string
  memo?: string
}

export const parseOFX = (ofxText: string): OFXTransaction[] => {
  const transactions: OFXTransaction[] = []
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g
  let match

  while ((match = stmtTrnRegex.exec(ofxText)) !== null) {
    const trnBlock = match[1]

    const trnType = extractOFXValue(trnBlock, "TRNTYPE")
    const dtPosted = extractOFXValue(trnBlock, "DTPOSTED")
    const trnAmt = extractOFXValue(trnBlock, "TRNAMT")
    const fitId = extractOFXValue(trnBlock, "FITID")
    const name = extractOFXValue(trnBlock, "NAME")
    const memo = extractOFXValue(trnBlock, "MEMO")

    if (trnType && dtPosted && trnAmt && fitId) {
      transactions.push({
        type: trnType,
        date: parseOFXDate(dtPosted),
        amount: parseFloat(trnAmt),
        fitId,
        name: name || "Unknown",
        memo,
      })
    }
  }

  return transactions
}

const extractOFXValue = (block: string, tag: string): string => {
  const regex = new RegExp(`<${tag}>([^<]+)`)
  const match = block.match(regex)
  return match ? match[1].trim() : ""
}

const parseOFXDate = (ofxDate: string): string => {
  // OFX dates are in format YYYYMMDDHHMMSS
  const year = ofxDate.substring(0, 4)
  const month = ofxDate.substring(4, 6)
  const day = ofxDate.substring(6, 8)
  return `${year}-${month}-${day}`
}

export const convertOFXToTransactions = (ofxTransactions: OFXTransaction[]): TransactionCSVRow[] => {
  return ofxTransactions.map((ofx) => ({
    date: ofx.date,
    type: ofx.amount >= 0 ? ("income" as const) : ("expense" as const),
    amount: Math.abs(ofx.amount),
    description: ofx.name,
    notes: ofx.memo,
  }))
}

// ==================== PDF REPORT UTILITIES ====================

export interface ReportData {
  period: string
  summary: {
    totalIncome: number
    totalExpense: number
    netIncome: number
    transactionCount: number
  }
  categoryData: Array<{
    name: string
    value: number
    color: string
  }>
  transactions: any[]
}

export const generatePDFReport = (data: ReportData): void => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(20)
  doc.setTextColor(6, 182, 212) // Cyan color
  doc.text("Financial Report", pageWidth / 2, 20, { align: "center" })

  // Period
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`Period: ${data.period}`, pageWidth / 2, 30, { align: "center" })

  // Summary Section
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text("Summary", 14, 45)

  const summaryData = [
    ["Total Income", `$${data.summary.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Total Expenses", `$${data.summary.totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Net Income", `$${data.summary.netIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Transaction Count", data.summary.transactionCount.toString()],
  ]

  autoTable(doc, {
    startY: 50,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [6, 182, 212] },
  })

  // Category Breakdown
  const finalY = (doc as any).lastAutoTable.finalY || 90
  doc.setFontSize(14)
  doc.text("Expense by Category", 14, finalY + 10)

  const categoryTableData = data.categoryData
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((cat) => [
      cat.name,
      `$${cat.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${((cat.value / data.summary.totalExpense) * 100).toFixed(1)}%`,
    ])

  autoTable(doc, {
    startY: finalY + 15,
    head: [["Category", "Amount", "Percentage"]],
    body: categoryTableData,
    theme: "striped",
    headStyles: { fillColor: [6, 182, 212] },
  })

  // Recent Transactions
  const finalY2 = (doc as any).lastAutoTable.finalY || 140

  // Add new page if needed
  if (finalY2 > 240) {
    doc.addPage()
    doc.setFontSize(14)
    doc.text("Recent Transactions", 14, 20)
    var startY = 25
  } else {
    doc.setFontSize(14)
    doc.text("Recent Transactions", 14, finalY2 + 10)
    var startY = finalY2 + 15
  }

  const transactionTableData = data.transactions.slice(0, 20).map((t) => [
    new Date(t.date).toLocaleDateString("en-US"),
    t.type,
    t.description || t.categories?.name || t.category?.name || "",
    `$${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ])

  autoTable(doc, {
    startY,
    head: [["Date", "Type", "Description", "Amount"]],
    body: transactionTableData,
    theme: "striped",
    headStyles: { fillColor: [6, 182, 212] },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-US")} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
  }

  // Save
  doc.save(`financial-report-${new Date().toISOString().split("T")[0]}.pdf`)
}

// ==================== DOWNLOAD HELPERS ====================

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
