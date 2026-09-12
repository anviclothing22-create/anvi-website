import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Check, KeyRound, RefreshCw, Edit3, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AccountSkeleton } from '../../components/skeleton';
import './AuthPage.css';

type Mode = 'signin' | 'signup' | 'forgot' | 'verify';

function nextPath(): string {
  try {
    const q = new URLSearchParams(window.location.search).get('next');
    if (q && q.startsWith('/') && !q.startsWith('//')) return q;
  } catch {
    // ignore
  }
  return '/account';
}

export const AuthPage: React.FC = () => {
  const { user, loading, signIn, signUp, resetPassword, verifyOtp, resendConfirmation } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      setLocation(nextPath());
    }
  }, [loading, user, setLocation]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (loading) {
    return <AccountSkeleton />;
  }

  if (user) {
    return null;
  }

  const handleResendConfirmation = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || resendCooldown > 0) return;
    setResendingEmail(true);
    setError(null);
    try {
      await resendConfirmation(cleanEmail);
      setNotice('A fresh verification code and link have been dispatched to your email.');
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend verification code. Please try again in a moment.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanCode = otpCode.trim().replace(/\s+/g, '');
    if (!cleanCode) {
      setError('Please enter the 6-digit verification code from your email.');
      return;
    }
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await verifyOtp(cleanEmail, cleanCode);
      setNotice('Email confirmed! Welcome to ANVI.');
      // Attempt immediate login if session was not automatically established
      try {
        if (password) {
          await signIn(cleanEmail, password);
        }
      } catch {
        // Session might already be set by verifyOtp
      }
      setLocation(nextPath());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed.';
      setError(
        msg.toLowerCase().includes('token has expired') || msg.toLowerCase().includes('invalid')
          ? 'Invalid or expired verification code. Please double-check your 6-digit code or request a new one.'
          : msg,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckEmailLinkConfirmed = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) return;
    setError(null);
    setNotice(null);
    setCheckingStatus(true);
    try {
      if (!password) {
        throw new Error('Please enter your password or use the 6-digit code above.');
      }
      await signIn(cleanEmail, password);
      setLocation(nextPath());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification check failed.';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Your email has not been confirmed yet. Please click the link in your email or enter the 6-digit code above.');
      } else {
        setError(msg);
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        if (!password) throw new Error('Please enter your password.');
        await signIn(cleanEmail, password);
        setLocation(nextPath());
      } else if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Please tell us your name.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        await signUp(fullName, cleanEmail, password);
        // Seamlessly move to Step 2: Email verification screen
        setMode('verify');
        setOtpCode('');
        setResendCooldown(30);
        setNotice(`A 6-digit verification code and confirmation link have been sent to ${cleanEmail}.`);
      } else if (mode === 'forgot') {
        await resetPassword(cleanEmail);
        setNotice('If this email is registered, a secure password reset link is on its way.');
      }
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      if (rawMsg.toLowerCase().includes('email not confirmed')) {
        // User tried to sign in, but their email is unconfirmed -> guide them directly to verification!
        setMode('verify');
        setError('Your account is registered, but your email has not been verified yet. Enter your verification code below.');
      } else {
        setError(rawMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="anvi-auth-page">
      <div className="anvi-auth-container">
        <nav aria-label="Breadcrumb" className="anvi-auth-breadcrumb">
          <Link href="/">Home</Link>
          <span className="anvi-auth-breadcrumb-sep">/</span>
          <span className="anvi-auth-breadcrumb-current">
            {mode === 'verify' ? 'Email Verification' : 'Client Access'}
          </span>
        </nav>

        <div className="anvi-auth-card">
          {mode === 'verify' ? (
            /* --- IN-FLOW EMAIL VERIFICATION (STEP 2 OF REGISTRATION) --- */
            <div className="anvi-auth-verify-step">
              <span className="anvi-auth-kicker">Step 2 of 2 • Email Verification</span>
              <h1 className="anvi-auth-title">Verify Your Email</h1>
              <p className="anvi-auth-subtitle">
                To activate your ANVI client privileges and secure your account, please verify your email address.
              </p>

              <div className="anvi-auth-email-badge">
                <div className="anvi-auth-email-info">
                  <Mail size={16} className="anvi-auth-email-badge-icon" />
                  <span className="anvi-auth-email-badge-text">{email}</span>
                </div>
                <button
                  type="button"
                  className="anvi-auth-email-edit-btn"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setNotice(null);
                  }}
                  title="Change email"
                >
                  <Edit3 size={13} />
                  <span>Change</span>
                </button>
              </div>

              {error && (
                <div className="anvi-auth-error" role="alert">
                  <p style={{ margin: 0 }}>{error}</p>
                </div>
              )}
              {notice && (
                <div className="anvi-auth-notice" role="status">
                  <Check size={14} />
                  <span>{notice}</span>
                </div>
              )}

              {/* Form A: 6-Digit OTP Verification */}
              <form onSubmit={handleVerifyOtp} className="anvi-auth-form" style={{ marginTop: '1.25rem' }}>
                <div className="anvi-auth-field">
                  <label htmlFor="auth-otp" className="anvi-auth-label">
                    Enter 6-Digit Code from Your Email
                  </label>
                  <div className="anvi-auth-input-wrap">
                    <KeyRound size={16} className="anvi-auth-input-icon" />
                    <input
                      id="auth-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={8}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 8 3 9 2 0 1"
                      className="anvi-auth-input anvi-auth-input-with-icon anvi-auth-otp-input"
                      autoFocus
                    />
                  </div>
                  <span className="anvi-auth-hint">
                    Check your inbox and spam folder for the message from ANVI / Supabase.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !otpCode.trim()}
                  className="anvi-auth-submit anvi-auth-submit--primary"
                >
                  <span>{submitting ? 'Verifying Code…' : 'Verify & Enter Account'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Alternative: Clicked Link in Email */}
              <div className="anvi-auth-divider">
                <span>OR</span>
              </div>

              <div className="anvi-auth-link-alt">
                <p className="anvi-auth-link-alt-desc">
                  Prefer clicking the confirmation link in your email?
                </p>
                <button
                  type="button"
                  onClick={handleCheckEmailLinkConfirmed}
                  disabled={checkingStatus}
                  className="anvi-auth-submit anvi-auth-submit--outline"
                >
                  <ExternalLink size={14} />
                  <span>{checkingStatus ? 'Checking confirmation…' : "I clicked the link in my email"}</span>
                </button>
              </div>

              {/* Resend Code & Navigation */}
              <div className="anvi-auth-verify-actions">
                <div className="anvi-auth-resend-wrap">
                  <span className="anvi-auth-resend-text">Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendingEmail || resendCooldown > 0}
                    className="anvi-auth-link anvi-auth-resend-btn"
                  >
                    <RefreshCw size={12} className={resendingEmail ? 'anvi-spin' : ''} />
                    <span>
                      {resendingEmail
                        ? 'Sending…'
                        : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend verification email'}
                    </span>
                  </button>
                </div>

                <div className="anvi-auth-footer" style={{ marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setNotice(null);
                    }}
                    className="anvi-auth-link"
                  >
                    Back to Sign In
                  </button>
                  <span className="anvi-auth-secure">
                    <ShieldCheck size={12} />
                    <span>256-Bit Encrypted Verification</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* --- SIGN IN / CREATE ACCOUNT / FORGOT PASSWORD --- */
            <>
              <span className="anvi-auth-kicker">The ANVI Client Suite</span>
              <h1 className="anvi-auth-title">
                {mode === 'signin' && 'Welcome back'}
                {mode === 'signup' && 'Join the House'}
                {mode === 'forgot' && 'Reset Password'}
              </h1>
              <p className="anvi-auth-subtitle">
                {mode === 'signin' && 'Sign in to track orders, manage addresses, and check out faster.'}
                {mode === 'signup' && 'Create your account with instant email verification for seamless orders and privileges.'}
                {mode === 'forgot' && 'Enter your account email and we will send a secure reset link.'}
              </p>

              <div className="anvi-auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  className={`anvi-auth-tab ${mode === 'signin' ? 'anvi-auth-tab--active' : ''}`}
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setNotice(null);
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={`anvi-auth-tab ${mode === 'signup' ? 'anvi-auth-tab--active' : ''}`}
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setNotice(null);
                  }}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="anvi-auth-form">
                {error && (
                  <div className="anvi-auth-error" role="alert">
                    <p style={{ margin: 0 }}>{error}</p>
                  </div>
                )}
                {notice && (
                  <div className="anvi-auth-notice" role="status">
                    <Check size={14} />
                    <span>{notice}</span>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="anvi-auth-field">
                    <label htmlFor="auth-name" className="anvi-auth-label">Full Name</label>
                    <div className="anvi-auth-input-wrap">
                      <User size={15} className="anvi-auth-input-icon" />
                      <input
                        id="auth-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ananya Sundaram"
                        className="anvi-auth-input anvi-auth-input-with-icon"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="anvi-auth-field">
                  <label htmlFor="auth-email" className="anvi-auth-label">Email Address</label>
                  <div className="anvi-auth-input-wrap">
                    <Mail size={15} className="anvi-auth-input-icon" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@example.com"
                      className="anvi-auth-input anvi-auth-input-with-icon"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="anvi-auth-field">
                    <label htmlFor="auth-password" className="anvi-auth-label">Password</label>
                    <div className="anvi-auth-input-wrap">
                      <Lock size={15} className="anvi-auth-input-icon" />
                      <input
                        id="auth-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Your password'}
                        className="anvi-auth-input anvi-auth-input-with-icon"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={submitting} className="anvi-auth-submit anvi-auth-submit--primary">
                  <span>
                    {submitting
                      ? 'Please wait…'
                      : mode === 'signin'
                      ? 'Sign In Securely'
                      : mode === 'signup'
                      ? 'Create Account & Verify'
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight size={15} />
                </button>

                <div className="anvi-auth-footer">
                  {mode === 'signin' && (
                    <button type="button" onClick={() => setMode('forgot')} className="anvi-auth-link">
                      Forgot password?
                    </button>
                  )}
                  {mode !== 'signin' && (
                    <button type="button" onClick={() => setMode('signin')} className="anvi-auth-link">
                      Back to sign in
                    </button>
                  )}
                  <span className="anvi-auth-secure">
                    <ShieldCheck size={12} />
                    <span>Protected by Supabase Auth</span>
                  </span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
