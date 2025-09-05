'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTaskContext } from '@/components/TaskContext';
import { 
  Users, 
  Mail, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Plus,
  Crown,
  Settings as SettingsIcon,
  Trash2,
  Edit
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Settings() {
  const { currentTeam, inviteMember } = useTaskContext();
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInviteMember = () => {
    if (!inviteEmail || !currentTeam) return;
    
    const newMember = {
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'member' as const,
      avatar: `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop`
    };
    
    inviteMember(currentTeam.id, newMember);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team, preferences, and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invite Members */}
              <div>
                <Label htmlFor="invite-email" className="text-sm font-medium">Invite Team Member</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="invite-email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleInviteMember} disabled={!inviteEmail}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Current Members */}
              <div>
                <h4 className="font-medium text-sm mb-4">Team Members ({currentTeam?.members.length || 0})</h4>
                <div className="space-y-3">
                  {currentTeam?.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{member.name}</p>
                          {member.role === 'admin' && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            member.isOnline ? "bg-green-500" : "bg-gray-400"
                          )} />
                        </div>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.isOnline ? 'Active now' : 'Last seen 2 hours ago'}
                        </p>
                      </div>
                      <Badge 
                        variant={member.role === 'admin' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.role}
                      </Badge>
                      {member.id !== 'user-1' && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive email updates for task assignments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get instant notifications in your browser</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Team Activity</Label>
                  <p className="text-xs text-muted-foreground">Notifications when team members complete tasks</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SettingsIcon className="h-4 w-4" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-xs font-medium">Display Name</Label>
                <Input id="display-name" defaultValue="Alex Johnson" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                <Input id="email" defaultValue="alex@example.com" disabled />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">Compact View</Label>
                  <p className="text-xs text-muted-foreground">Reduce spacing in lists</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" size="sm" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Two-Factor Auth
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Active Sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}