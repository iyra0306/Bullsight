/**
 * Authentication Service Interface
 * Prepared for future integration with Node.js + Express + MongoDB + JWT + bcrypt.
 * No live backend authentication server is connected in this frontend preview phase.
 */

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authService = {
  validateLogin(payload: LoginPayload): AuthValidationResult {
    const errors: Record<string, string> = {};
    if (!payload.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(payload.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!payload.password) {
      errors.password = 'Password is required.';
    } else if (payload.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    return { valid: Object.keys(errors).length === 0, errors };
  },

  validateRegister(payload: RegisterPayload): AuthValidationResult {
    const errors: Record<string, string> = {};
    if (!payload.fullName.trim() || payload.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }
    if (!payload.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(payload.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!payload.password || payload.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (payload.confirmPassword !== payload.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    return { valid: Object.keys(errors).length === 0, errors };
  },

  validateForgotPassword(email: string): AuthValidationResult {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = 'Account email is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    return { valid: Object.keys(errors).length === 0, errors };
  },
};
