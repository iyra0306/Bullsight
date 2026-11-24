import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react';
import { BullSightLogo } from '../components/Navbar';
import { authService } from '../services/authService';
import { evaluatePasswordStrength } from '../utils/formatters';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedNotice(null);

    if (mode === 'login') {
      const res = authService.validateLogin({ email, password, rememberMe });
      setErrors(res.errors);
      if (res.valid) {
        setSubmittedNotice(
          'Form validated locally. JWT + bcrypt authentication will connect here once the Express/MongoDB backend is wired.'
        );
      }
      return;
    }

    if (mode === 'register') {
      const res = authService.validateRegister({
        fullName,
        email,
        password,
        confirmPassword,
      });
      setErrors(res.errors);
      if (res.valid) {
        setSubmittedNotice(
          'Registration payload validated and ready for POST /api/v1/auth/register (bcrypt + JWT issuance).'
        );
      }
      return;
    }

    const res = authService.validateForgotPassword(email);
    setErrors(res.errors);
    if (res.valid) {
      setSubmittedNotice(
        'Reset request validated locally. Token dispatch will activate once the backend mail & JWT service is connected.'
      );
    }
  };

  const title =
    mode === 'login'
      ? 'Sign in to BULLSIGHT'
      : mode === 'register'
      ? 'Create your BULLSIGHT account'
      : 'Reset account password';

  const subtitle =
    mode === 'login'
      ? 'Access your equity screening workspace and saved watchlists.'
      : mode === 'register'
      ? 'Set up your credentials for upcoming JWT-secured workspace sync.'
      : 'Enter your registered email address to prepare a password recovery request.';

  return (
    <div className="bg-fintech-grid flex min-h-screen flex-col justify-between bg-[#f4f7f5] px-4 py-8 text-[#101814] dark:bg-[#101512] dark:text-[#E8F0EA] sm:px-6">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between">
        <BullSightLogo to="/" />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#53645A] hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="mx-auto my-8 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-black/10 bg-white p-7 shadow-xl dark:border-white/10 dark:bg-[#18211C]"
          >
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
                {title}
              </h1>
              <p className="mt-1.5 text-sm text-[#53645A] dark:text-[#91A197]">{subtitle}</p>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#36C982]/25 bg-[#36C982]/8 p-3 text-xs text-[#53645A] dark:text-[#91A197]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#137949] dark:text-[#36C982]" />
              <span>
                Frontend preview authentication UI prepared for Express + JWT + bcrypt. No live
                authentication server is connected yet.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-semibold text-[#101814] dark:text-[#E8F0EA]"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aarav Mehta"
                    className="mt-1.5 h-11 w-full rounded-lg border border-black/15 bg-[#f4f7f5] px-3.5 text-sm text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-[#D94848] dark:text-[#EF6461]">
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-[#101814] dark:text-[#E8F0EA]"
                >
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@domain.com"
                  className="mt-1.5 h-11 w-full rounded-lg border border-black/15 bg-[#f4f7f5] px-3.5 text-sm text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#D94848] dark:text-[#EF6461]">{errors.email}</p>
                )}
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-semibold text-[#101814] dark:text-[#E8F0EA]"
                    >
                      Password
                    </label>
                    {mode === 'login' && (
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-[#137949] hover:underline dark:text-[#36C982]"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-lg border border-black/15 bg-[#f4f7f5] pl-3.5 pr-11 text-sm text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#53645A] hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-[#D94848] dark:text-[#EF6461]">
                      {errors.password}
                    </p>
                  )}

                  {mode === 'register' && password.length > 0 && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#53645A] dark:text-[#91A197]">
                          Password strength
                        </span>
                        <span className="font-semibold text-[#137949] dark:text-[#A5EBC3]">
                          {strength.label}
                        </span>
                      </div>
                      <div className="mt-1 grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 rounded-full transition-colors ${
                              strength.score >= step
                                ? strength.score <= 1
                                  ? 'bg-[#EF6461]'
                                  : strength.score === 2
                                  ? 'bg-[#E5B869]'
                                  : 'bg-[#36C982]'
                                : 'bg-black/10 dark:bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-confirm"
                    className="block text-xs font-semibold text-[#101814] dark:text-[#E8F0EA]"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 h-11 w-full rounded-lg border border-black/15 bg-[#f4f7f5] px-3.5 text-sm text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-[#D94848] dark:text-[#EF6461]">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <label className="flex items-center gap-2 text-xs text-[#53645A] dark:text-[#91A197]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 accent-[#36C982]"
                  />
                  <span>Keep session preference on this device</span>
                </label>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#36C982] px-4 py-2.5 text-sm font-semibold text-[#0B120E] transition-colors hover:bg-[#A5EBC3]"
              >
                {mode === 'login'
                  ? 'Validate & Preview Sign In'
                  : mode === 'register'
                  ? 'Validate Registration'
                  : 'Validate Reset Request'}
              </button>
            </form>

            {submittedNotice && (
              <div className="mt-4 rounded-xl border border-[#36C982]/40 bg-[#36C982]/12 p-3.5 text-xs text-[#101814] dark:text-[#E8F0EA]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#137949] dark:text-[#36C982]" />
                  <div>
                    <p>{submittedNotice}</p>
                    <button
                      type="button"
                      onClick={() => navigate('/app')}
                      className="mt-2 font-semibold text-[#137949] hover:underline dark:text-[#A5EBC3]"
                    >
                      Continue to Dashboard Workspace →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-black/10 pt-4 text-center text-xs text-[#53645A] dark:border-white/8 dark:text-[#91A197]">
              {mode === 'login' ? (
                <>
                  New to BULLSIGHT?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
                  >
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center text-xs text-[#53645A] dark:text-[#91A197]">
        BULLSIGHT · Prepared for Node.js, Express, MongoDB &amp; JWT Integration
      </div>
    </div>
  );
};
