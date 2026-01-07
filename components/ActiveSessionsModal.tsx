'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Monitor, Smartphone, Globe, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface ActiveSessionsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ActiveSessionsModal({ open, onClose }: ActiveSessionsModalProps): JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadSessions();
    }
  }, [open]);

  const loadSessions = async () => {
    setLoading(true);
    // Simulate API call - in production this would fetch real session data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSessions([
      {
        id: '1',
        device: 'Windows PC',
        browser: 'Chrome 120',
        location: 'Istanbul, Turkey',
        lastActive: 'Now',
        current: true,
      },
      {
        id: '2',
        device: 'iPhone 14',
        browser: 'Safari',
        location: 'Istanbul, Turkey',
        lastActive: '2 hours ago',
        current: false,
      },
    ]);
    setLoading(false);
  };

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast.success('Session revoked successfully');
    setRevoking(null);
  };

  const revokeAllOther = async () => {
    setRevoking('all');
    await new Promise(resolve => setTimeout(resolve, 500));
    setSessions(prev => prev.filter(s => s.current));
    toast.success('All other sessions revoked');
    setRevoking(null);
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('phone') || device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Active Sessions
          </DialogTitle>
          <DialogDescription>
            Manage devices where you're currently logged in.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    session.current ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-muted/50'
                  }`}
                >
                  <div className="text-muted-foreground">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{session.device}</p>
                      {session.current && (
                        <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {session.lastActive}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => revokeSession(session.id)}
                      disabled={revoking === session.id}
                    >
                      {revoking === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {sessions.filter(s => !s.current).length > 0 && (
              <Button
                variant="outline"
                className="w-full text-red-500 hover:text-red-600"
                onClick={revokeAllOther}
                disabled={revoking === 'all'}
              >
                {revoking === 'all' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  'Revoke All Other Sessions'
                )}
              </Button>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
