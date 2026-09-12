import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

export const ForgotPasswordPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      addToast({ title: 'Invalid email', description: 'Enter a valid staff email address.', variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(clean, { redirectTo });
      if (error) throw error;
      setSent(true);
      addToast({
        title: 'Recovery Link Dispatched',
        description: `Instructions have been forwarded to ${clean}.`,
        variant: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Reset failed',
        description: err instanceof Error ? err.message : 'Could not send reset email. Try again.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-serif font-bold text-anvi-charcoal tracking-tight">Recover Access</h2>
        <p className="text-xs text-anvi-muted">
          Provide your registered executive email to receive password reset credentials.
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Staff Email" required>
            <div className="relative">
              <Mail className="w-4 h-4 text-anvi-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anviclothing22@gmail.com"
                className="pl-9"
                required
              />
            </div>
          </FormField>

          <Button type="submit" loading={loading} className="w-full justify-center mt-2 group">
            <Send className="w-4 h-4" />
            <span>Send Reset Instructions</span>
          </Button>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-900">Check Your Inbox</p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              We dispatched a secure reset link with a 15-minute token expiration.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation(ROUTES.AUTH.RESET_PASSWORD)}
            className="w-full justify-center"
          >
            Enter Reset Token Directly
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-anvi-sand/40 text-center">
        <button
          type="button"
          onClick={() => setLocation(ROUTES.AUTH.LOGIN)}
          className="inline-flex items-center gap-1.5 text-xs text-anvi-muted hover:text-anvi-charcoal transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Administrative Login
        </button>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
