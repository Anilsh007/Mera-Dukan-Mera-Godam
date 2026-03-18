"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle, X, ChevronLeft } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/add-product", label: "Add Product", icon: PlusCircle },
  { href: "/dashboard/all-stock", label: "All Stock", icon: Package },
];

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size (SSR-safe)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Single toggle function for mobile & desktop
  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsOpen(false); // Mobile close
    } else {
      setIsCollapsed((prev) => !prev); // Desktop collapse/expand
    }
  };

  // Active link detection
  const getIsActive = (href: string) => {
    return pathname === href; // Only exact match active
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar Container */}
      <div className={`border border-[var(--border-color)] fixed inset-y-0 z-50 flex flex-col gap-2 p-2 rounded-xl bg-[var(--bg-sidebar)] shadow-[var(--shadow-card)] transition-all duration-300 ${isOpen ? "activeSidebar m-3" : "deActiveSidebar"}  lg:static lg:m-3 ${!isMobile && isCollapsed ? "w-16" : "w-[200px]"} relative`} >
        {/* Header */}
        <div className="mb-2 flex justify-start items-center">
          {!isCollapsed? (<h1 className="font-bold text-lg pl-2">Dukan & Godam</h1>):(<h1 className="font-bold text-lg">D&G</h1>)}

          {/* Desktop Toggle Button */}
          <button onClick={handleSidebarToggle} className={`hidden lg:flex items-center justify-center w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full absolute top-1/2 -translate-y-1/2 shadow-md cursor-pointer ${isCollapsed ? "moveleft" : "moveright"}`} aria-label="Collapse sidebar" >
            <ChevronLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = getIsActive(href);

            return (
              <Link key={href} href={href} onClick={() => { if (isMobile) handleSidebarToggle();}}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive ? "bg-[var(--sidebar-active)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-white"} ${!isMobile && isCollapsed ? "justify-center" : ""}`} > <Icon size={18} /> {(!isCollapsed || isMobile) && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {(!isCollapsed || isMobile) && (
          <p className="text-center text-[10px] tracking-widest uppercase text-[var(--text-muted)] pb-2">
            v0.1.0 • Mera Dukan
          </p>
        )}
      </div>
    </>
  );
}