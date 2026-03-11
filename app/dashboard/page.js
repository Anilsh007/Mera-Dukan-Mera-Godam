export default function DashboardHome() {
  const cards = [
    { label: "Total Products", value: "—", emoji: "📦", color: "#3b82f6" },
    { label: "Low Stock", value: "—", emoji: "⚠️", color: "#f59e0b" },
    { label: "Sales Today", value: "—", emoji: "💰", color: "#10b981" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]" >Overview</h2>
        <p className="text-sm mt-1 text-[var(--text-secondary)]">Apni dukan ka haal dekhein</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map(({ label, value, emoji, color }) => (
          <div key={label} className="p-5 rounded-2xl flex items-center gap-4 bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]" >
            <div style={{ background: color + "20", fontSize: "22px" }} className="w-12 h-12 rounded-xl flex items-center justify-center" > {emoji} </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
              <p className="text-2xl font-bold mt-0.5 text-[var(--text-primary)]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
