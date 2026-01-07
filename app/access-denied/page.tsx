'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AccessDeniedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              You no longer have access to this organization.
            </p>
            <p className="text-sm text-muted-foreground">
              Your access has been revoked by an administrator. You may need to be re-invited to join this organization.
            </p>
            
            <div className="space-y-2 pt-4">
              <Button asChild className="w-full">
                <Link href="/onboarding">
                  <Home className="h-4 w-4 mr-2" />
                  Create or Join Organization
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
