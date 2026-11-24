import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Activity,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Compass,
  LayoutDashboard,
  LineChart,
  Newspaper,
  Settings,
  Star,
  X,
} from 'lucide-react';
import { BullSightLogo } from './Navbar';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/explore', label: 'Explore Stocks', icon: Compass, end: false },
  { to: '/app/analysis', label: 'Stock Analysis', icon: LineChart, end: false },
  { to: '/app/predictions', label: 'AI Predictions', icon: BrainCircuit, end: false },
  { to: '/app/technicals', label: 'Technical Analysis', icon: Activity, end: false },
  { to: '/app/news', label: 'Market News', icon: Newspaper, end: false },
  { to: '/app/watchlist', label: 'Watchlist', icon: Star, end: false },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const renderNavContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div
          className={`flex h-16 items-center border-b border-black/10 px-4 dark:border-white/8 ${
            collapsed && !isMobile ? 'justify-center' : 'justify-between'
          }`}
        >
          {(!collapsed || isMobile) && <BullSightLogo to="/" />}
          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-[#53645A] dark:border-white/8 dark:text-[#91A197]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[#53645A] transition-colors hover:border-[#36C982]/40 hover:text-[#101814] dark:border-white/8 dark:text-[#91A197] dark:hover:text-[#E8F0EA] lg:inline-flex"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <nav className="space-y-1 p-3" aria-label="Dashboard navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => {
                  if (isMobile) onCloseMobile();
                }}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    collapsed && !isMobile ? 'justify-center px-2' : ''
                  } ${
                    isActive
                      ? 'text-[#101814] dark:text-[#E8F0EA]'
                      : 'text-[#53645A] hover:bg-black/[0.03] hover:text-[#101814] dark:text-[#91A197] dark:hover:bg-white/[0.04] dark:hover:text-[#E8F0EA]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId={isMobile ? 'sidebar-active-mobile' : 'sidebar-active-desktop'}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-lg border border-[#36C982]/35 bg-[#36C982]/14 dark:bg-[#214B37]/65"
                        aria-hidden="true"
                      />
                    )}
                    <Icon
                      className={`relative z-10 h-4 w-4 shrink-0 ${
                        isActive ? 'text-[#137949] dark:text-[#36C982]' : ''
                      }`}
                    />
                    {(!collapsed || isMobile) && (
                      <span className="relative z-10 truncate">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {(!collapsed || isMobile) && (
        <div className="border-t border-black/10 p-4 dark:border-white/8">
          <div className="rounded-lg border border-black/8 bg-black/[0.02] p-3 text-xs dark:border-white/8 dark:bg-[#141C17]">
            <div className="font-display font-semibold text-[#101814] dark:text-[#E8F0EA]">
              Sample Preview Mode
            </div>
            <p className="mt-1 leading-relaxed text-[#53645A] dark:text-[#91A197]">
              Displaying deterministic sample quotes and illustrative AI scenarios.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Collapsible Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-black/10 bg-[#eaf0ec] transition-[width] duration-200 dark:border-white/8 dark:bg-[#141C17] lg:block ${
          collapsed ? 'w-[72px]' : 'w-[248px]'
        }`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto">
          {renderNavContent(false)}
        </div>
      </aside>

      {/* Mobile / Tablet Slide-over Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-[264px] border-r border-black/10 bg-[#eaf0ec] dark:border-white/8 dark:bg-[#141C17]">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
