"use client"

import { useRef } from "react"
import { MdCheckCircle, MdPrint, MdClose } from "react-icons/md"
import Button from "./Button"

type ProductRow = {
  id: string
  name: string
  price: string
  quantity: string
  category: string
  supplier: string
  expiry: string
  note: string
  sku: string
}

interface SuccessReceiptProps {
  data: ProductRow[]
  onClose: () => void
  onAddMore: () => void
}

export default function SuccessReceipt({ data, onClose, onAddMore }: SuccessReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const totalAmount = data.reduce((sum, row) => 
    sum + (Number(row.price) || 0) * (Number(row.quantity) || 0), 0
  )

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML
    const originalContents = document.body.innerHTML
    
    if (printContents) {
      document.body.innerHTML = `
        <div style="padding: 20px; font-family: system-ui, sans-serif;">
          <h2 style="text-align: center; margin-bottom: 20px;">Stock Entry Receipt</h2>
          ${printContents}
        </div>
      `
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload() // Restore React app
    }
  }

  const currentDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-card)] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-emerald-500 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdCheckCircle size={32} />
            <div>
              <h3 className="text-xl font-bold">Entry Successful!</h3>
              <p className="text-emerald-100 text-sm">{data.length} product(s) added to inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-emerald-600 rounded-full transition">
            <MdClose size={24} />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={printRef} className="p-6 overflow-y-auto flex-1">
          <div className="mb-4 flex justify-between text-sm text-[var(--text-muted)] border-b border-[var(--border-card)] pb-2">
            <span>Date: {currentDate}</span>
            <span>Ref: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>

          <div className="space-y-3">
            {data.map((row, index) => (
              <div key={row.id} className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-card)]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-medium text-[var(--text-muted)]">#{index + 1}</span>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{row.name || "Unnamed Product"}</h4>
                    {row.category && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {row.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      ₹{((Number(row.price) || 0) * (Number(row.quantity) || 0)).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      ₹{Number(row.price).toLocaleString("en-IN")} × {row.quantity} units
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-[var(--border-card)]">
                  {row.sku && (
                    <div><span className="text-[var(--text-muted)]">SKU:</span> {row.sku}</div>
                  )}
                  {row.expiry && (
                    <div><span className="text-[var(--text-muted)]">Expiry:</span> {new Date(row.expiry).toLocaleDateString("en-IN")}</div>
                  )}
                  {row.supplier && (
                    <div><span className="text-[var(--text-muted)]">Supplier:</span> {row.supplier}</div>
                  )}
                  {row.note && (
                    <div className="col-span-2 text-[var(--text-secondary)] italic">"{row.note}"</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-emerald-500 flex justify-between items-center">
            <span className="text-lg font-medium text-[var(--text-secondary)]">Grand Total</span>
            <span className="text-3xl font-black text-emerald-600">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[var(--border-card)] flex gap-3 bg-[var(--bg-primary)]">
          <Button 
            type="button" 
            onClick={handlePrint} 
            variant="secondary" 
            icon={<MdPrint />}
            title="Print Receipt"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={onAddMore} 
            variant="primary" 
            icon={<MdClose />}
            title="Add More Products"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}
