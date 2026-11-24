import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useMagnetic } from '../hooks/useMagnetic';

export const BullSightLogo: React.FC<{ to?: string }> = ({ to = '/' }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap focus-visible:outline-none"
  >
    <svg
      width="26"
      height="26"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="1"
        y="1"
        width="26"
        height="26"
        rx="7"
        fill="#18211C"
        stroke="rgba(54, 201, 130, 0.45)"
        strokeWidth="1.2"
      />
      <path
        d="M6.5 9.5C8.5 7 11.5 6.8 14 9.2C16.5 6.8 19.5 7 21.5 9.5L19.4 13.8L14 21L8.6 13.8L6.5 9.5Z"
        stroke="#36C982"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 13.5L13 11.5L15 13.5L17.8 10.5"
        stroke="#A5EBC3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-display text-lg font-extrabold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
      BULLSIGHT
    </span>
  </Link>
);

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const magneticCta = useMagnetic(0.22);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4f7f5]/90 backdrop-blur-md dark:border-white/8 dark:bg-[#101512]/90">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <BullSightLogo to="/" />

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          <a
            href="#hero"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                scrollToSection('hero');
              }
            }}
            className="whitespace-nowrap shrink-0 text-sm font-medium text-[#53645A] transition-colors hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
          >
            Home
          </a>
          <Link
            to="/app/explore"
            className="whitespace-nowrap shrink-0 text-sm font-medium text-[#53645A] transition-colors hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
          >
            Explore
          </Link>
          <a
            href="#ai-intelligence"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                scrollToSection('ai-intelligence');
              }
            }}
            className="whitespace-nowrap shrink-0 text-sm font-medium text-[#53645A] transition-colors hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
          >
            AI Intelligence
          </a>
          <a
            href="#about-architecture"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                scrollToSection('about-architecture');
              }
            }}
            className="whitespace-nowrap shrink-0 text-sm font-medium text-[#53645A] transition-colors hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
          >
            About
          </a>
          <Link
            to="/login"
            className="whitespace-nowrap shrink-0 text-sm font-medium text-[#53645A] transition-colors hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
          >
            Login
          </Link>
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Trigger */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            ref={magneticCta.ref as React.Ref<HTMLAnchorElement>}
            onMouseMove={magneticCta.onMouseMove}
            onMouseLeave={magneticCta.onMouseLeave}
            data-cursor="magnetic"
            to="/app"
            className="hidden whitespace-nowrap shrink-0 rounded-lg bg-[#36C982] px-4 py-2 text-sm font-semibold text-[#0B120E] transition-all duration-200 hover:bg-[#A5EBC3] sm:inline-flex"
          >
            Get Started
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-[#101814] dark:border-white/10 dark:text-[#E8F0EA] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-black/10 bg-[#f4f7f5] px-4 py-4 dark:border-white/8 dark:bg-[#141C17] md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#101814] dark:text-[#E8F0EA]"
            >
              Home
            </Link>
            <Link
              to="/app/explore"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#101814] dark:text-[#E8F0EA]"
            >
              Explore
            </Link>
            <Link
              to="/app/predictions"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#101814] dark:text-[#E8F0EA]"
            >
              AI Intelligence
            </Link>
            <a
              href="#about-architecture"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#101814] dark:text-[#E8F0EA]"
            >
              About
            </a>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#101814] dark:text-[#E8F0EA]"
            >
              Login
            </Link>
            <Link
              to="/app"
              onClick={() => setMobileOpen(false)}
              className="mt-1 rounded-lg bg-[#36C982] px-4 py-2.5 text-center text-sm font-semibold text-[#0B120E]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
