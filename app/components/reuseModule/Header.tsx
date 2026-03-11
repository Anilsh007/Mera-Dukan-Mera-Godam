"use client";
import { useState, useEffect, useRef } from "react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, useTheme, ThemeToggle } from "@/app/components/client/useClient";
import { LogOut, Menu, User as UserIcon, ChevronDown } from "lucide-react";
import logo from "../../../assets/logo.svg";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  // Bahar click karne par dropdown band karne ke liye
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="px-4 py-3 sm:px-6 flex justify-between items-center sticky top-0 z-10 bg-[var(--bg-header)] border-b border-[var(--border-color)] shadow-sm">

      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-1 text-">
          <Menu size={24} />
        </button>
        <img src={logo.src} className="w-9" alt="Logo" />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="border border-[var(--border-color)] cursor-pointer flex items-center gap-2 rounded-full hover:bg-[var(--sidebar-hover)] transition-all" >
            {user?.photoURL ? (
              <img src={user.photoURL} referrerPolicy="no-referrer" alt="Profile" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><UserIcon size={16} /></div>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[var(--border-color)]">
                <p className="text-xs text-">Signed in as</p>
                <p className="text-sm font-semibold truncate">
                  <span className="hidden sm:block text-sm font-medium text-">{user?.displayName?.split(" ")[0]}</span>
                  {/* {user?.email} */}
                </p>

              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors" > <LogOut size={16} /> Logout </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
