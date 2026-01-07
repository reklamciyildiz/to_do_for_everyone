'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorModalProps {
  open: boolean;
  onClose: () => void;
}

export function TwoFactorModal({ open, onClose }: TwoFactorModalProps): JSX.Element {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep('verify');
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEnabled(true);
    toast.success('Two-factor authentication enabled successfully');
    setLoading(false);
    handleClose();
  };

  const handleDisable = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEnabled(false);
    toast.success('Two-factor authentication disabled');
    setLoading(false);
  };

  const handleClose = () => {
    setStep('setup');
    setCode('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account.
          </DialogDescription>
        </DialogHeader>

        {step === 'setup' && !enabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Smartphone className="h-10 w-10 text-primary" />
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-muted-foreground">
                  Use an app like Google Authenticator or Authy
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleEnable} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Enable 2FA'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="w-32 h-32 bg-white mx-auto mb-2 rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">QR Code Placeholder</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Scan this QR code with your authenticator app
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter verification code</Label>
              <Input
                id="verify-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="bg-white dark:bg-gray-800 text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setStep('setup')}>
                Back
              </Button>
              <Button type="submit" disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Enable'
                )}
              </Button>
            </div>
          </form>
        )}

        {enabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="h-10 w-10 text-green-600" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">2FA is Enabled</p>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Your account is protected with two-factor authentication
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button variant="destructive" onClick={handleDisable} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
