import { MdPerson, MdBusiness, MdLocationOn } from "react-icons/md"

type TabType = 'overview' | 'business' | 'address'

interface Props {
  activeTab: TabType
  onChange: (tab: TabType) => void
}

const tabs = [
  { key: 'overview', label: 'Overview', icon: MdPerson },
  { key: 'business', label: 'Business Details', icon: MdBusiness },
  { key: 'address', label: 'Address & Bank', icon: MdLocationOn },
] as const

export default function ProfileTabs({ activeTab, onChange }: Props) {
  return (
    <div className="flex gap-2 border-b border-[var(--border-card)]">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === tab.key 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <tab.icon size={18} />
          {tab.label}
        </button>
      ))}
    </div>
  )
}
