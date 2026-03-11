interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    containerClassName?: string;
}

export default function Input({ label, containerClassName, className = "", ...props }: InputProps) {
    return (
        <div className={containerClassName}>
            {label && (
                <label className="block mb-1 text-sm font-medium text-[var(--text-primary)]">
                    {label}
                </label>
            )}

            <input {...props} className={` w-full p-2 rounded-xl border bg-[var(--bg-input)] border-[var(--border-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-emerald-400 outline-none transition-all ${className} `} />
        </div>
    )
}