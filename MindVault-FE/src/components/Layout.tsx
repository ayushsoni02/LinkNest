import { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: ReactNode;
  className?: string;
  onFilterChange?: (filter: { type: string; value: string | null }) => void;
}

export default function Layout({ children, className = "", onFilterChange }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onFilterChange={onFilterChange}
        />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onFilterChange={onFilterChange}
        />
      </div>

      {/* Main Content Area */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
          ${className}
        `}
      >
        {children}
      </main>
    </div>
  );
}
