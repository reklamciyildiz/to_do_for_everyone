'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserPlus, Users } from 'lucide-react';

interface AddMemberToTeamModalProps {
  teamId: string;
  organizationId: string;
  open: boolean;
  onClose: () => void;
  onAdd: (userId: string, teamId: string) => Promise<void>;
}

export function AddMemberToTeamModal({ 
  teamId, 
  organizationId, 
  open, 
  onClose, 
  onAdd 
}: AddMemberToTeamModalProps): JSX.Element {
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const fetchAvailableMembers = async () => {
    setFetching(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/available-members?excludeTeamId=${teamId}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableMembers(data.data);
      } else {
        setError('Failed to fetch available members');
      }
    } catch (err) {
      setError('Failed to fetch available members');
    } finally {
      setFetching(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedUserId) {
      setError('Please select a member to add');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAdd(selectedUserId, teamId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSelectedUserId('');
    onClose();
  };

  useEffect(() => {
    if (open) {
      fetchAvailableMembers();
      setSelectedUserId('');
      setError('');
    }
  }, [open, teamId, organizationId]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Member to Team
          </DialogTitle>
          <DialogDescription>
            Add an existing organization member to this team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-select">Select Member</Label>
            {fetching ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available members...
              </div>
            ) : availableMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No available members to add to this team.
              </p>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {member.name?.charAt(0) || member.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{member.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={loading || !selectedUserId || fetching}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
