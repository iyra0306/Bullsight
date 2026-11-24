import React, { useState } from 'react';
import { CheckCircle2, Moon, Shield, Sun } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ChartStyle, CurrencyPreference, MarketRegion } from '../types/market';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, profile, updateProfile, region, setRegion } = useApp();
  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [roleInput, setRoleInput] = useState(profile.role);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput.trim() || profile.name,
      email: emailInput.trim() || profile.email,
      role: roleInput.trim() || profile.role,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2600);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#137949] dark:text-[#36C982]">
          Workspace Preferences · Persisted Locally
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
          Settings
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* User Profile & Account Preferences */}
        <form
          onSubmit={handleSaveProfile}
          className="space-y-4 rounded-xl border border-black/10 bg-white p-6 dark:border-white/8 dark:bg-[#18211C] lg:col-span-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
              User Profile &amp; Account Preferences
            </h2>
            {savedFeedback && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#137949] dark:text-[#36C982]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved locally
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="set-name"
              className="block text-xs font-semibold text-[#53645A] dark:text-[#91A197]"
            >
              Display Name
            </label>
            <input
              id="set-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-sm text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
            />
          </div>

          <div>
            <label
              htmlFor="set-email"
              className="block text-xs font-semibold text-[#53645A] dark:text-[#91A197]"
            >
              Account Email
            </label>
            <input
              id="set-email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-sm text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
            />
          </div>

          <div>
            <label
              htmlFor="set-role"
              className="block text-xs font-semibold text-[#53645A] dark:text-[#91A197]"
            >
              Workspace Role Label
            </label>
            <input
              id="set-role"
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-sm text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
            />
          </div>

          <div>
            <label
              htmlFor="set-region"
              className="block text-xs font-semibold text-[#53645A] dark:text-[#91A197]"
            >
              Default Market Scope
            </label>
            <select
              id="set-region"
              value={region}
              onChange={(e) => setRegion(e.target.value as MarketRegion)}
              className="mt-1.5 h-10 w-full rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-xs font-semibold text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
            >
              <option value="ALL">Global (India + United States)</option>
              <option value="IN">India Markets (NSE / BSE)</option>
              <option value="US">US Markets (NASDAQ / NYSE)</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[#36C982] px-5 py-2.5 text-xs font-semibold text-[#0B120E] transition-colors hover:bg-[#A5EBC3]"
          >
            Save Profile Preferences
          </button>
        </form>

        {/* Appearance, Currency & Chart Preferences */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/8 dark:bg-[#18211C]">
            <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
              Appearance &amp; Display
            </h2>

            <div className="mt-4 flex items-center justify-between border-b border-black/8 pb-4 dark:border-white/8">
              <div>
                <div className="text-sm font-medium text-[#101814] dark:text-[#E8F0EA]">
                  Interface Theme
                </div>
                <div className="text-xs text-[#53645A] dark:text-[#91A197]">
                  Futuristic dark mode is the default BULLSIGHT experience.
                </div>
              </div>
              <div className="flex rounded-lg border border-black/10 bg-[#f4f7f5] p-0.5 dark:border-white/10 dark:bg-[#141C17]">
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                    settings.theme === 'dark'
                      ? 'bg-[#36C982] text-[#0B120E]'
                      : 'text-[#53645A] dark:text-[#91A197]'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                    settings.theme === 'light'
                      ? 'bg-[#36C982] text-[#0B120E]'
                      : 'text-[#53645A] dark:text-[#91A197]'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-b border-black/8 pb-4 dark:border-white/8">
              <div>
                <div className="text-sm font-medium text-[#101814] dark:text-[#E8F0EA]">
                  Currency Display
                </div>
                <div className="text-xs text-[#53645A] dark:text-[#91A197]">
                  Native exchange currency or unified INR/USD preview conversion.
                </div>
              </div>
              <select
                value={settings.currency}
                onChange={(e) =>
                  updateSettings({ currency: e.target.value as CurrencyPreference })
                }
                aria-label="Currency display preference"
                className="h-9 rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-xs font-semibold text-[#101814] dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
              >
                <option value="AUTO">Native (₹ / $)</option>
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#101814] dark:text-[#E8F0EA]">
                  Default Chart Series
                </span>
                <div className="flex rounded-lg border border-black/10 bg-[#f4f7f5] p-0.5 dark:border-white/10 dark:bg-[#141C17]">
                  {(['candlestick', 'area'] as ChartStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => updateSettings({ defaultChartStyle: style })}
                      className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                        settings.defaultChartStyle === style
                          ? 'bg-[#36C982] text-[#0B120E]'
                          : 'text-[#53645A] dark:text-[#91A197]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between text-sm text-[#101814] dark:text-[#E8F0EA]">
                <span>Show Chart Background Gridlines</span>
                <input
                  type="checkbox"
                  checked={settings.showChartGrid}
                  onChange={(e) => updateSettings({ showChartGrid: e.target.checked })}
                  className="h-4 w-4 accent-[#36C982]"
                />
              </label>

              <label className="flex items-center justify-between text-sm text-[#101814] dark:text-[#E8F0EA]">
                <span>Compact Data Table Density</span>
                <input
                  type="checkbox"
                  checked={settings.compactTables}
                  onChange={(e) => updateSettings({ compactTables: e.target.checked })}
                  className="h-4 w-4 accent-[#36C982]"
                />
              </label>
            </div>
          </div>

          {/* Notifications & Security Readiness */}
          <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/8 dark:bg-[#18211C]">
            <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
              Notifications &amp; Security
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-center justify-between text-[#101814] dark:text-[#E8F0EA]">
                <span>Price Threshold Alerts (Preview)</span>
                <input
                  type="checkbox"
                  checked={settings.priceAlertsEnabled}
                  onChange={(e) => updateSettings({ priceAlertsEnabled: e.target.checked })}
                  className="h-4 w-4 accent-[#36C982]"
                />
              </label>
              <label className="flex items-center justify-between text-[#101814] dark:text-[#E8F0EA]">
                <span>AI Scenario Digest</span>
                <input
                  type="checkbox"
                  checked={settings.aiDigestEnabled}
                  onChange={(e) => updateSettings({ aiDigestEnabled: e.target.checked })}
                  className="h-4 w-4 accent-[#36C982]"
                />
              </label>
              <label className="flex items-center justify-between text-[#101814] dark:text-[#E8F0EA]">
                <span>Breaking News Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.newsAlertsEnabled}
                  onChange={(e) => updateSettings({ newsAlertsEnabled: e.target.checked })}
                  className="h-4 w-4 accent-[#36C982]"
                />
              </label>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-black/10 bg-black/[0.02] p-3 text-xs text-[#53645A] dark:border-white/8 dark:bg-[#141C17] dark:text-[#91A197]">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#36C982]" />
              <span>
                JWT token expiry ({settings.sessionTimeoutMinutes} min) and bcrypt credential
                hashing policies will synchronize with the Express backend when connected.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
