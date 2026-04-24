import { MdDescription } from "react-icons/md"
import SectionCard from "../components/SectionCard"

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function TermsSection({ value, onChange }: Props) {
  return (
    <SectionCard title="Invoice Settings" icon={<MdDescription />} iconColor="text-gray-500">
      <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">
        Default Terms & Conditions
      </label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full p-3 rounded-xl border bg-[var(--bg-input)] border-[var(--border-input)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-400 outline-none resize-none" />
    </SectionCard>
  )
}
