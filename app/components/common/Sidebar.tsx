"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ChevronLeft,
  Settings,
  ChevronDown,
  ChevronRight,
  Cloud,
  Download,
  SlidersHorizontal,
} from "lucide-react";

type NavItem = {
  href?: string;
  label: string;
  icon: any;
  children?: {
    href: string;
    label: string;
    icon?: any;
  }[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/add-product", label: "Add Product", icon: PlusCircle },
  { href: "/dashboard/all-stock", label: "All Stock", icon: Package },
  {
    label: "Setting",
    icon: Settings,
    children: [
      {
        href: "/dashboard/settings/backup",
        label: "Backup & Sync",
        icon: Cloud,
      },
      {
        href: "/dashboard/settings/download",
        label: "Download Data",
        icon: Download,
      },
      {
        href: "/dashboard/settings/preferences",
        label: "Preferences",
        icon: SlidersHorizontal,
      },
    ],
  },
];

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Setting: true,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/dashboard/settings")) {
      setOpenMenus((prev) => ({
        ...prev,
        Setting: true,
      }));
    }
  }, [pathname]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const toggleSubmenu = (key: string) => {
    if (isCollapsed && !isMobile) return;
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isActive = (href?: string) => !!href && pathname === href;

  const isChildRoute = (href?: string) => {
    if (!href) return false;
    if (href === "/dashboard") return false;
    return pathname.startsWith(`${href}/`) && pathname !== href;
  };

  const hasActiveChild = (item: NavItem) =>
    item.children?.some((child) => pathname === child.href) ?? false;

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
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

          <button onClick={handleSidebarToggle} className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-full absolute top-[40dvh] right-[-20px] -translate-y-1/2 shadow-md cursor-pointer border border-[var(--border-card)] bg-[var(--bg-card)] p-2 text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]`} aria-label="Collapse sidebar" >
            <ChevronLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const menuOpen = openMenus[item.label] || false;
            const parentActive = hasActiveChild(item);

            if (item.children?.length) {
              return (
                <div key={item.label}>
                  <button type="button" onClick={() => toggleSubmenu(item.label)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 transition ${parentActive ? "bg-[var(--sidebar-active)] text-[var(--text-primary)]" : "text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)]"}`} >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      {!isCollapsed && (<span className="text-sm font-medium">{item.label}</span>)}
                    </div>

                    {!isCollapsed &&
                      (menuOpen ? (<ChevronDown size={16} />) : (<ChevronRight size={16} />))}
                  </button>

                  {!isCollapsed && menuOpen && (
                    <div className="mt-2 ml-2 border-t border-[var(--border-color)]">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;

                        return (
                          <Link key={child.href} href={child.href} onClick={() => isMobile && setIsOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${pathname === child.href ? "bg-[var(--sidebar-active)] font-medium text-white" : "text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]"}`} >
                            {ChildIcon && <ChildIcon size={16} />}
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href!} onClick={() => isMobile && setIsOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${isActive(item.href) || isChildRoute(item.href) ? "bg-[var(--sidebar-active)] text-white" : "text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)]"}`} >
                <Icon size={20} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
}