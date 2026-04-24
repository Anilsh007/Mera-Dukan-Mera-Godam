import Input from "@/app/components/utility/CommonInput"
import { MdBusiness } from "react-icons/md"
import SectionCard from "../components/SectionCard"

interface Props {
  data: {
    shopName: string
    gstNumber: string
    businessType: string
    upiId: string
    invoicePrefix: string
  }
  onChange: (field: string, value: string) => void
}

const BUSINESS_TYPES = [
  { value: "retail", label: "Retail (दुकान)" },
  { value: "wholesale", label: "Wholesale (थोक)" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" }
]

export default function BusinessInfo({ data, onChange }: Props) {
  return (
    <SectionCard title="Business Details" icon={<MdBusiness />} iconColor="text-emerald-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label={<>Shop Name <span className="text-red-500">*</span></>} placeholder="Aapke dukan ka naam" value={data.shopName}
          onChange={(e) => onChange("shopName", e.target.value)}
        />
        
        <Input label="GST Number (Optional)" placeholder="22AAAAA0000A1Z5" value={data.gstNumber} onChange={(e) => onChange("gstNumber", e.target.value.toUpperCase())} />

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-[var(--text-primary)]">
            Business Type
          </label>
          <select value={data.businessType} onChange={(e) => onChange("businessType", e.target.value)} className="w-full p-2 rounded-xl border bg-[var(--bg-input)] border-[var(--border-input)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-400 outline-none" >
            {BUSINESS_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <Input label="UPI ID (Optional)" placeholder="yourname@upi" value={data.upiId} onChange={(e) => onChange("upiId", e.target.value)} />
        
        <Input label="Invoice Prefix" placeholder="INV" value={data.invoicePrefix} onChange={(e) => onChange("invoicePrefix", e.target.value)} />
      </div>
    </SectionCard>
  )
}
