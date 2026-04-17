"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle, ChevronLeft, Settings, } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/add-product", label: "Add Product", icon: PlusCircle },
  { href: "/dashboard/all-stock", label: "All Stock", icon: Package },
  { href: "/dashboard/settings", label: "Setting", icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen, }: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const getIsActive = (href: string) => pathname === href;

  return (
    <>
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`border border-[var(--border-color)] bg-[var(--bg-sidebar)] shadow-[var(--shadow-card)]
          flex flex-col gap-2 p-2 rounded-xl transition-all duration-300 shrink-0
          ${isMobile
          ? `fixed inset-y-0 left-0 z-50 m-3 ${isOpen ? "translate-x-0" : "-translate-x-[120%]"
          } w-[200px]`
          : `relative m-3 ${isCollapsed ? "w-16" : "w-[200px]"}`
        }`}>
        <div className="mb-2 flex justify-start items-center relative min-h-[40px]">
          {!isCollapsed || isMobile ? (
            <h1 className="font-bold text-lg pl-2">Dukan & Godam</h1>
          ) : (
            <h1 className="font-bold text-lg">D&G</h1>
          )}

          <button onClick={handleSidebarToggle} className={`hidden lg:flex items-center justify-center w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full absolute top-[40dvh] right-[-20px] -translate-y-1/2 shadow-md cursor-pointer`} aria-label="Collapse sidebar" >
            <ChevronLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = getIsActive(href);

            return (
              <Link key={href} href={href} onClick={() => { if (isMobile) setIsOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-[var(--sidebar-active)] text-white shadow-lg"
                    : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-white"
                  }
                  ${!isMobile && isCollapsed ? "justify-center" : ""}
                `}
              >
                <Icon size={18} />
                {(!isCollapsed || isMobile) && <span>{label}</span>}
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
      </aside>
    </>
  );
}