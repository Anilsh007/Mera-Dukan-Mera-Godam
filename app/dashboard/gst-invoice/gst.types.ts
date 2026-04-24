export interface GSTInvoice {
  invoiceNo: string
  invoiceDate: string
  dueDate?: string
  
  seller: {
    name: string
    gstin: string
    address: string
    city: string
    state: string
    pincode: string
    phone?: string
    email?: string
  }
  
  buyer: {
    name: string
    gstin?: string
    address: string
    city: string
    state: string
    pincode: string
    phone?: string
  }
  
  items: Array<{
    description: string
    hsnCode: string
    quantity: number
    unit: string
    rate: number
    taxableValue: number
    cgstRate: number
    cgstAmount: number
    sgstRate: number
    sgstAmount: number
    igstRate: number
    igstAmount: number
    total: number
  }>
  
  totals: {
    taxableValue: number
    cgstTotal: number
    sgstTotal: number
    igstTotal: number
    grandTotal: number
    amountInWords: string
  }
  
  bankDetails?: {
    accountName: string
    accountNo: string
    ifsc: string
    bankName: string
  }
  
  terms?: string
  notes?: string
}

// Helper to calculate GST
export const calculateGST = (rate: number, quantity: number, price: number, isInterState: boolean) => {
  const taxableValue = quantity * price
  const taxRate = rate // GST % (e.g., 18, 12, 5, 28)
  
  let cgst = 0, sgst = 0, igst = 0
  
  if (isInterState) {
    igst = (taxableValue * taxRate) / 100
  } else {
    cgst = (taxableValue * (taxRate / 2)) / 100
    sgst = (taxableValue * (taxRate / 2)) / 100
  }
  
  return {
    taxableValue,
    cgst,
    sgst,
    igst,
    total: taxableValue + cgst + sgst + igst
  }
}

// Number to words converter for invoice
export const numberToWords = (num: number): string => {
  // Simple implementation - aap npm package bhi use kar sakte hain
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  if (num === 0) return 'Zero'
  
  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const hundred = Math.floor((num % 1000) / 100)
  const remainder = num % 100
  
  let words = ''
  
  if (crore) words += `${numberToWords(crore)} Crore `
  if (lakh) words += `${numberToWords(lakh)} Lakh `
  if (thousand) words += `${numberToWords(thousand)} Thousand `
  if (hundred) words += `${ones[hundred]} Hundred `
  
  if (remainder > 0) {
    if (remainder < 10) words += ones[remainder]
    else if (remainder < 20) {
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
      words += teens[remainder - 10]
    } else {
      words += tens[Math.floor(remainder / 10)]
      if (remainder % 10) words += ` ${ones[remainder % 10]}`
    }
  }
  
  return words.trim() + ' Only'
}
