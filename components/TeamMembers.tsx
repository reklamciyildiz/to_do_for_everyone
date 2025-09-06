'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Pencil, UserPlus } from 'lucide-react';
import { useTaskContext, TeamMember } from './TaskContext';

export function TeamMembers() {
  const { currentTeam, addMember, updateMember, removeMember, getTeamMembers } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<{id: string; name: string; email: string; role: string} | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(currentTeam?.members || []);
  
  // Update team members when currentTeam changes
  useEffect(() => {
    if (currentTeam) {
      setTeamMembers(getTeamMembers(currentTeam.id));
    } else {
      setTeamMembers([]);
    }
  }, [currentTeam, getTeamMembers]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as const,
    avatar: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.group('Handle Submit');
    try {
      if (!currentTeam) {
        console.error('❌ No team selected');
        console.groupEnd();
        return;
      }

      console.log('Current Team:', currentTeam);
      console.log('Editing Member:', editingMember);
      console.log('Form Data:', formData);

      const memberData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        avatar: formData.avatar.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name.trim())}`
      };

      console.log('Prepared Member Data:', memberData);

      if (editingMember) {
        console.log('Updating existing member...');
        console.log('Member ID to update:', editingMember.id);
        
        // Check if member exists in current team
        const memberExists = currentTeam.members.some(m => m.id === editingMember.id);
        console.log('Member exists in team:', memberExists);
        
        if (!memberExists) {
          throw new Error(`Member with ID ${editingMember.id} not found in team ${currentTeam.id}`);
        }

        // Update member - the state will be updated via the context
        updateMember(currentTeam.id, editingMember.id, memberData);
        console.log('Member update triggered');
      } else {
        console.log('Adding new member...');
        // Add member - the state will be updated via the context
        addMember(currentTeam.id, memberData);
        console.log('Member add triggered');
      }

      // Reset form
      console.log('Resetting form...');
      setFormData({
        name: '',
        email: '',
        role: 'member',
        avatar: ''
      });
      setEditingMember(null);
      setIsDialogOpen(false);
      console.log('✅ Form submitted successfully');
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      // You might want to show an error toast/message to the user here
    } finally {
      console.groupEnd();
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      avatar: member.avatar
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    if (!currentTeam) {
      console.error('No team selected');
      return;
    }
    
    try {
      const confirmed = window.confirm('Are you sure you want to remove this member?');
      if (!confirmed) return;
      
      // Remove member - the state will be updated via the context
      removeMember(currentTeam.id, memberId);
      console.log('Member removal triggered');
    } catch (error) {
      console.error('Error removing member:', error);
      // You might want to show an error toast/message to the user here
    }
  };

  if (!currentTeam) {
    return <div className="p-4 text-center text-muted-foreground">Select a team to manage members</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMember(null)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
              <DialogDescription>
                {editingMember ? 'Update the team member details' : 'Add a new member to your team'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL (optional)</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingMember(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMember ? 'Update' : 'Add'} Member
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {currentTeam.members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No members in this team yet. Add your first member!
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                    {member.role}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(member)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
