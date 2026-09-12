import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/hooks/useToast';

export const ResetPasswordPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { addToast } = useToast();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({
        title: 'Passwords Mismatch',
        description: 'Ensure both password inputs match exactly.',
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({
        title: 'Credentials Updated',
        description: 'New password securely registered. Please sign in.',
        variant: 'success',
      });
      setLocation(ROUTES.AUTH.LOGIN);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-serif font-bold text-anvi-charcoal tracking-tight">Create New Password</h2>
        <p className="text-xs text-anvi-muted">
          Define a strong security passphrase for your administrator profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Security Reset Token" required>
          <Input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. ANVI-SEC-8921"
            required
          />
        </FormField>

        <FormField label="New Password" required>
          <div className="relative">
            <Lock className="w-4 h-4 text-anvi-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="pl-9"
              required
            />
          </div>
        </FormField>

        <FormField label="Confirm New Password" required>
          <div className="relative">
            <Lock className="w-4 h-4 text-anvi-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="pl-9"
              required
            />
          </div>
        </FormField>

        <Button type="submit" loading={loading} className="w-full justify-center mt-2 group">
          <CheckCircle2 className="w-4 h-4" />
          <span>Update Password & Return to Login</span>
        </Button>
      </form>

      <div className="pt-4 border-t border-anvi-sand/40 text-center">
        <button
          type="button"
          onClick={() => setLocation(ROUTES.AUTH.LOGIN)}
          className="inline-flex items-center gap-1.5 text-xs text-anvi-muted hover:text-anvi-charcoal transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel & Return to Login
        </button>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
