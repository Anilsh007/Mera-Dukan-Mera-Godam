"use client";
import { useState, useEffect, useRef } from "react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, ThemeToggle } from "@/app/components/client/useClient";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import logo from "@/assets/logo.svg";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-30 bg-[var(--bg-header)] border-b border-[var(--border-color)] shadow-sm flex-shrink-0">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg-primary)] transition-colors" aria-label="Open menu" >
          <Menu size={22} />
        </button>
        <img src={logo.src} className="w-8 h-8 object-contain" alt="Logo" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Profile */}
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen(o => !o)} className="cursor-pointer flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-all" >
            {user?.photoURL ? (
              <img src={user.photoURL} referrerPolicy="no-referrer" alt="Profile" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <UserIcon size={14} className="text-emerald-600" />
              </div>
            )}
            <span className="hidden sm:block text-xs font-medium text-[var(--text-primary)] max-w-[80px] truncate">
              {user?.displayName?.split(" ")[0] || "User"}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-muted)]">Signed in as</p>
                <p className="text-sm font-semibold truncate text-[var(--text-primary)]">{user?.displayName || user?.email}</p>
                {user?.displayName && (
                  <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                )}
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
