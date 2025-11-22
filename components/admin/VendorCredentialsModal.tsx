'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface VendorCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    vendor: {
      id: string;
      name: string;
    };
    user: {
      id: string;
      email: string;
      username: string;
      firstName?: string;
      lastName?: string;
    };
    temporaryPassword: string;
  } | null;
}

export function VendorCredentialsModal({
  isOpen,
  onClose,
  credentials,
}: VendorCredentialsModalProps) {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!credentials) return null;

  const portalUrl = `${window.location.origin}/vendor/login?tenant=${
    new URLSearchParams(window.location.search).get('tenant') || 'quiv'
  }`;

  const credentialsText = `
Vendor Portal Login Credentials
================================

Vendor Company: ${credentials.vendor.name}

Portal URL: ${portalUrl}
Email: ${credentials.user.email}
Username: ${credentials.user.username}
Temporary Password: ${credentials.temporaryPassword}

IMPORTANT SECURITY NOTICE:
- This password is temporary and MUST be changed on first login
- Do not share these credentials via insecure channels
- Vendor must change password immediately after first login
- This information will only be shown once
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(credentialsText);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClose = () => {
    if (!hasAcknowledged) {
      toast.warning('Please acknowledge that you have saved the credentials');
      return;
    }
    onClose();
    // Reset state
    setCopied(false);
    setShowPassword(false);
    setHasAcknowledged(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Vendor Account Created Successfully
          </DialogTitle>
          <DialogDescription>
            Save these credentials immediately. They will only be shown once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">Security Notice</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Copy these credentials before closing this dialog</li>
                  <li>Share credentials through a secure channel</li>
                  <li>Vendor must change the password on first login</li>
                  <li>This information cannot be retrieved later</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Credentials Display */}
          <div className="bg-muted rounded-lg p-4 space-y-3 font-mono text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Vendor Company</p>
              <p className="font-semibold">{credentials.vendor.name}</p>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Login Credentials</p>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Portal URL</p>
                  <p className="text-primary break-all">{portalUrl}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{credentials.user.email}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p>{credentials.user.username}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">Temporary Password</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="font-semibold text-base">
                    {showPassword ? credentials.temporaryPassword : '••••••••••••'}
                  </p>
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Must be changed on first login
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="flex items-center gap-2 border border-border rounded-lg p-3">
            <input
              type="checkbox"
              id="acknowledge"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="acknowledge" className="text-sm cursor-pointer">
              I have saved these credentials and understand they cannot be retrieved later
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy All Credentials
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleClose}
            disabled={!hasAcknowledged}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
