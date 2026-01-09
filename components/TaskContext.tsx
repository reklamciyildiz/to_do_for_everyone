'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { taskApi, teamApi, memberApi } from '@/lib/api';
import { getPermissions, canEditTask, canDeleteTask, canCompleteTask, Permission, Role } from '@/lib/permissions';

export type TaskStatus = 'todo' | 'progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'admin' | 'member' | 'viewer';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  customerId?: string;
  customerName?: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: string[];
  comments: Comment[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  taskStats?: {
    total: number;
    completed: number;
  };
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  isOnline: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdAt: Date;
}

interface MemberFormData extends Omit<TeamMember, 'id' | 'isOnline'> {}

export type FilterType = 'dueToday' | 'highPriority' | 'assignedToMe' | null;

interface TaskContextType {
  tasks: Task[];
  teams: Team[];
  customers: Customer[];
  currentTeam: Team | null;
  currentUser: TeamMember | null;
  currentUserRole: Role;
  permissions: Permission;
  organizationName: string;
  organizationId: string | null;
  loading: boolean;
  error: string | null;
  filter: FilterType;
  customerFilter: string | null;
  setFilter: (filter: FilterType) => void;
  setCustomerFilter: (customerId: string | null) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'comments'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setCurrentTeam: (teamId: string) => void;
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Promise<void>;
  createTeam: (name: string, description?: string) => Promise<void>;
  updateTeam: (teamId: string, name: string, description: string) => Promise<void>;
  updateMemberRole: (teamId: string, memberId: string, role: Role) => Promise<void>;
  addMember: (teamId: string, member: MemberFormData) => Promise<void>;
  updateMember: (teamId: string, memberId: string, updates: Partial<MemberFormData>) => Promise<void>;
  removeMember: (teamId: string, memberId: string) => Promise<void>;
  getTeamMembers: (teamId: string) => TeamMember[];
  inviteMember: (teamId: string, member: Omit<TeamMember, 'id' | 'isOnline'>) => Promise<void>;
  moveMember: (memberId: string, fromTeamId: string, toTeamId: string) => Promise<void>;
  addMemberToTeam: (userId: string, teamId: string) => Promise<void>;
  updateOrganization: (name: string) => Promise<void>;
  refreshData: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customer: { name: string; email?: string; phone?: string; address?: string; notes?: string }) => Promise<void>;
  updateCustomer: (id: string, updates: { name?: string; email?: string; phone?: string; address?: string; notes?: string }) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  canEditTask: (taskCreatorId?: string, taskAssigneeId?: string) => boolean;
  canDeleteTask: (taskCreatorId?: string) => boolean;
  canCompleteTask: (taskAssigneeId?: string) => boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Helper to transform API data to frontend format
function transformTask(apiTask: any): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || '',
    status: apiTask.status as TaskStatus,
    priority: apiTask.priority as TaskPriority,
    dueDate: apiTask.due_date ? new Date(apiTask.due_date) : undefined,
    assigneeId: apiTask.assignee_id,
    customerId: apiTask.customer_id,
    customerName: apiTask.customer?.name,
    teamId: apiTask.team_id,
    createdBy: apiTask.created_by || apiTask.createdBy || apiTask.user_id,
    createdAt: new Date(apiTask.created_at),
    updatedAt: new Date(apiTask.updated_at),
    attachments: [],
    comments: (apiTask.comments || []).map((c: any) => ({
      id: c.id,
      text: c.text,
      authorId: c.author_id,
      createdAt: new Date(c.created_at),
    })),
  };
}

function transformTeam(apiTeam: any): Team {
  return {
    id: apiTeam.id,
    name: apiTeam.name,
    description: apiTeam.description || '',
    members: (apiTeam.team_members || []).map((tm: any) => ({
      id: tm.user?.id || tm.user_id,
      name: tm.user?.name || 'Unknown',
      email: tm.user?.email || '',
      role: tm.role as UserRole,
      avatar: tm.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tm.user?.name || 'U')}`,
      isOnline: tm.user?.is_online || false,
    })),
    createdAt: new Date(apiTeam.created_at),
  };
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentTeam, setCurrentTeamState] = useState<Team | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('My Organization');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>(null);
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);

  // Fetch data from API
  const refreshData = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch teams
      const teamsResponse = await teamApi.getAll();
      if (teamsResponse.success && teamsResponse.data) {
        const transformedTeams = teamsResponse.data.map(transformTeam);
        setTeams(transformedTeams);
        
        // Set current team to first team if not set
        if (transformedTeams.length > 0 && !currentTeam) {
          setCurrentTeamState(transformedTeams[0]);
        }
      }

      // Fetch tasks
      const tasksResponse = await taskApi.getAll();
      if (tasksResponse.success && tasksResponse.data) {
        const transformedTasks = tasksResponse.data.map(transformTask);
        setTasks(transformedTasks);
      }

      // Fetch current user from API to get latest data
      if (session.user?.email) {
        try {
          const userResponse = await fetch('/api/users/profile');
          const userData = await userResponse.json();
          if (userData.success && userData.data) {
            setCurrentUser({
              id: userData.data.id,
              name: userData.data.name || 'User',
              email: userData.data.email || '',
              role: userData.data.role || 'member',
              avatar: userData.data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.data.name || 'U')}`,
              isOnline: true,
            });
            
            // Fetch organization name
            if (userData.data.organization_id) {
              setOrganizationId(userData.data.organization_id);
              try {
                const orgResponse = await fetch(`/api/organizations/${userData.data.organization_id}`);
                const orgData = await orgResponse.json();
                if (orgData.success && orgData.data) {
                  setOrganizationName(orgData.data.name);
                }
              } catch (err) {
                console.error('Failed to fetch organization:', err);
              }
            }
          } else {
            // Fallback to session data
            setCurrentUser({
              id: (session.user as any).id || 'unknown',
              name: session.user.name || 'User',
              email: session.user.email || '',
              role: (session.user as any).role || 'member',
              avatar: session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'U')}`,
              isOnline: true,
            });
          }
        } catch {
          // Fallback to session data on error
          setCurrentUser({
            id: (session.user as any).id || 'unknown',
            name: session.user.name || 'User',
            email: session.user.email || '',
            role: (session.user as any).role || 'member',
            avatar: session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'U')}`,
            isOnline: true,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [session, currentTeam]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
    fetchCustomers();
  }, [session]);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      if (data.success && data.data) {
        const transformedCustomers = data.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          notes: c.notes,
          organizationId: c.organization_id,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
          taskStats: c.taskStats,
        }));
        setCustomers(transformedCustomers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  }, []);

  // Add customer
  const addCustomer = useCallback(async (customerData: { name: string; email?: string; phone?: string; address?: string; notes?: string }) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
      } else {
        throw new Error(data.error || 'Failed to create customer');
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  }, [fetchCustomers]);

  // Update customer
  const updateCustomer = useCallback(async (id: string, updates: { name?: string; email?: string; phone?: string; address?: string; notes?: string }) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
      } else {
        throw new Error(data.error || 'Failed to update customer');
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  }, [fetchCustomers]);

  // Delete customer
  const deleteCustomer = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchCustomers();
      } else {
        throw new Error(data.error || 'Failed to delete customer');
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  }, [fetchCustomers]);

  // Add task via API
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'comments'>) => {
    try {
      const response = await taskApi.create({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate?.toISOString(),
        assigneeId: taskData.assigneeId,
        customerId: taskData.customerId,
        teamId: taskData.teamId,
      });

      if (response.success && response.data) {
        const newTask = transformTask(response.data);
        setTasks(prev => [...prev, newTask]);
        // Refresh customers to update task stats
        await fetchCustomers();
      } else {
        console.error('Failed to create task:', response.error);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  }, [fetchCustomers]);

  // Update task via API with optimistic update
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // Store previous state for rollback
    const previousTasks = tasks;
    
    // Optimistic update - update UI immediately
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    ));

    try {
      const apiUpdates: any = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.description !== undefined) apiUpdates.description = updates.description;
      if (updates.status !== undefined) apiUpdates.status = updates.status;
      if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) apiUpdates.dueDate = updates.dueDate?.toISOString();
      if (updates.assigneeId !== undefined) apiUpdates.assigneeId = updates.assigneeId;

      const response = await taskApi.update(id, apiUpdates);

      if (!response.success) {
        // Rollback on failure
        console.error('Failed to update task:', response.error);
        setTasks(previousTasks);
      }
      // Don't update state again on success - optimistic update already done
    } catch (err) {
      console.error('Error updating task:', err);
      // Rollback on error
      setTasks(previousTasks);
    }
  }, [tasks]);

  // Delete task via API
  const deleteTask = useCallback(async (id: string) => {
    try {
      const response = await taskApi.delete(id);
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== id));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }, []);

  // Set current team
  const setCurrentTeam = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeamState(team);
    }
  }, [teams]);

  // Add team via API
  const addTeam = useCallback(async (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    try {
      const response = await teamApi.create({
        name: teamData.name,
        description: teamData.description,
      });

      if (response.success && response.data) {
        const newTeam = transformTeam(response.data);
        setTeams(prev => [...prev, newTeam]);
      }
    } catch (err) {
      console.error('Error creating team:', err);
    }
  }, []);

  // Add member via API
  const addMember = useCallback(async (teamId: string, memberData: MemberFormData) => {
    try {
      const response = await memberApi.add(teamId, {
        name: memberData.name,
        email: memberData.email,
        role: memberData.role as 'admin' | 'member' | 'viewer',
        avatar: memberData.avatar,
      });

      if (response.success) {
        await refreshData(); // Refresh to get updated team members
      }
    } catch (err) {
      console.error('Error adding member:', err);
    }
  }, [refreshData]);

  // Update member (local only for now)
  const updateMember = useCallback(async (teamId: string, memberId: string, updates: Partial<MemberFormData>) => {
    setTeams(prevTeams => {
      const teamIndex = prevTeams.findIndex(t => t.id === teamId);
      if (teamIndex === -1) return prevTeams;

      const team = prevTeams[teamIndex];
      const memberIndex = team.members.findIndex(m => m.id === memberId);
      if (memberIndex === -1) return prevTeams;

      const updatedTeams = [...prevTeams];
      const updatedMembers = [...team.members];
      updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], ...updates };
      updatedTeams[teamIndex] = { ...team, members: updatedMembers };
      return updatedTeams;
    });
  }, []);

  // Remove member via API
  const removeMember = useCallback(async (teamId: string, memberId: string) => {
    try {
      const response = await memberApi.remove(teamId, memberId);
      if (response.success) {
        setTeams(prevTeams => {
          const teamIndex = prevTeams.findIndex(t => t.id === teamId);
          if (teamIndex === -1) return prevTeams;

          const updatedTeams = [...prevTeams];
          updatedTeams[teamIndex] = {
            ...updatedTeams[teamIndex],
            members: updatedTeams[teamIndex].members.filter(m => m.id !== memberId)
          };
          return updatedTeams;
        });
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
  }, []);

  // Get team members
  const getTeamMembers = useCallback((teamId: string): TeamMember[] => {
    return teams.find(t => t.id === teamId)?.members || [];
  }, [teams]);

  // Invite member (alias for addMember)
  const inviteMember = useCallback(async (teamId: string, member: Omit<TeamMember, 'id' | 'isOnline'>) => {
    await addMember(teamId, member as MemberFormData);
  }, [addMember]);

  // Move member to another team
  const moveMember = useCallback(async (memberId: string, fromTeamId: string, toTeamId: string) => {
    try {
      const response = await fetch(`/api/teams/${fromTeamId}/members/${memberId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTeamId: toTeamId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to move member');
      }

      // Refresh teams data to reflect the move
      await refreshData();
    } catch (err) {
      console.error('Error moving member:', err);
      throw err;
    }
  }, [refreshData]);

  // Add existing member to team
  const addMemberToTeam = useCallback(async (userId: string, teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member to team');
      }

      // Refresh teams data to reflect the addition
      await refreshData();
    } catch (err) {
      console.error('Error adding member to team:', err);
      throw err;
    }
  }, [refreshData]);

  // Create team via API
  const createTeam = useCallback(async (name: string, description?: string) => {
    try {
      const response = await teamApi.create({ name, description: description || '' });
      if (response.success && response.data) {
        const newTeam = transformTeam(response.data);
        setTeams(prev => [...prev, newTeam]);
        setCurrentTeamState(newTeam);
      } else {
        throw new Error(response.error || 'Failed to create team');
      }
    } catch (err: any) {
      console.error('Error creating team:', err);
      throw err;
    }
  }, []);

  // Update team via API
  const updateTeam = useCallback(async (teamId: string, name: string, description: string) => {
    try {
      const response = await teamApi.update(teamId, { name, description });
      if (response.success) {
        setTeams(prev => prev.map(team => 
          team.id === teamId ? { ...team, name, description } : team
        ));
        // Update currentTeam if it's the one being edited
        if (currentTeam?.id === teamId) {
          setCurrentTeamState(prev => prev ? { ...prev, name, description } : null);
        }
      } else {
        throw new Error(response.error || 'Failed to update team');
      }
    } catch (err: any) {
      console.error('Error updating team:', err);
      throw err;
    }
  }, [currentTeam?.id]);

  // Update member role
  const updateMemberRole = useCallback(async (teamId: string, memberId: string, role: Role) => {
    try {
      const response = await memberApi.updateRole(teamId, memberId, role);
      if (response.success) {
        setTeams(prev => prev.map(team => {
          if (team.id === teamId) {
            return {
              ...team,
              members: team.members.map(m => 
                m.id === memberId ? { ...m, role } : m
              )
            };
          }
          return team;
        }));
        // Update currentTeam if needed
        if (currentTeam?.id === teamId) {
          setCurrentTeamState(prev => prev ? {
            ...prev,
            members: prev.members.map(m => 
              m.id === memberId ? { ...m, role } : m
            )
          } : null);
        }
      } else {
        throw new Error(response.error || 'Failed to update member role');
      }
    } catch (err: any) {
      console.error('Error updating member role:', err);
      throw err;
    }
  }, [currentTeam?.id]);

  // Calculate current user's role in the current team
  const currentUserRole: Role = useMemo(() => {
    if (!currentTeam || !currentUser) return 'viewer';
    const member = currentTeam.members.find(m => m.id === currentUser.id);
    return (member?.role as Role) || 'member';
  }, [currentTeam, currentUser]);

  // Get permissions based on role
  const permissions = useMemo(() => {
    return getPermissions(currentUserRole);
  }, [currentUserRole]);

  // Permission check functions
  const checkCanEditTask = useCallback((taskCreatorId?: string, taskAssigneeId?: string): boolean => {
    if (!currentUser) return false;
    return canEditTask(currentUserRole, currentUser.id, taskCreatorId, taskAssigneeId);
  }, [currentUserRole, currentUser]);

  const checkCanDeleteTask = useCallback((taskCreatorId?: string): boolean => {
    if (!currentUser) return false;
    return canDeleteTask(currentUserRole, currentUser.id, taskCreatorId);
  }, [currentUserRole, currentUser]);

  const checkCanCompleteTask = useCallback((taskAssigneeId?: string): boolean => {
    if (!currentUser) return false;
    return canCompleteTask(currentUserRole, currentUser.id, taskAssigneeId);
  }, [currentUserRole, currentUser]);

  // Update organization name
  const updateOrganization = useCallback(async (name: string) => {
    if (!organizationId) {
      throw new Error('No organization ID found');
    }
    
    try {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      const data = await response.json();
      if (data.success) {
        setOrganizationName(name);
      } else {
        throw new Error(data.error || 'Failed to update organization');
      }
    } catch (err: any) {
      console.error('Error updating organization:', err);
      throw err;
    }
  }, [organizationId]);

  return (
    <TaskContext.Provider value={{
      tasks,
      teams,
      customers,
      currentTeam,
      currentUser,
      currentUserRole,
      permissions,
      organizationName,
      organizationId,
      loading,
      error,
      filter,
      customerFilter,
      setFilter,
      setCustomerFilter,
      addTask,
      updateTask,
      deleteTask,
      setCurrentTeam,
      addTeam,
      createTeam,
      updateTeam,
      updateMemberRole,
      addMember,
      updateMember,
      removeMember,
      getTeamMembers,
      inviteMember,
      moveMember,
      addMemberToTeam,
      updateOrganization,
      refreshData,
      fetchCustomers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      canEditTask: checkCanEditTask,
      canDeleteTask: checkCanDeleteTask,
      canCompleteTask: checkCanCompleteTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}