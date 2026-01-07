// Supabase Database Operations for SaaS
// This replaces the in-memory store with real database operations

import { getSupabaseClient } from '@/lib/supabase';

// Helper to get client at runtime only - NO client created at build time
function getClient() {
  return getSupabaseClient();
}

// Backward compatibility - but will only work at runtime
const supabase = new Proxy({} as any, {
  get(target, prop: string | symbol) {
    const client = getClient() as any;
    return client[prop];
  },
});

// =============================================
// ORGANIZATION OPERATIONS
// =============================================

export const organizationDb = {
  async create(name: string, slug: string) {
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// =============================================
// USER OPERATIONS
// =============================================

export const userDb = {
  async create(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOnlineStatus(id: string, isOnline: boolean) {
    const { error } = await supabase
      .from('users')
      .update({ is_online: isOnline })
      .eq('id', id);
    
    if (error) throw error;
  },
};

// =============================================
// TEAM OPERATIONS
// =============================================

export const teamDb = {
  async create(teamData: any) {
    const { data, error } = await supabase
      .from('teams')
      .insert(teamData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          id,
          role,
          joined_at,
          user:users (
            id,
            email,
            name,
            avatar_url,
            is_online
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          id,
          role,
          joined_at,
          user:users (
            id,
            email,
            name,
            avatar_url,
            is_online
          )
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        team:teams (
          *,
          team_members (
            id,
            role,
            joined_at,
            user:users (
              id,
              email,
              name,
              avatar_url,
              is_online
            )
          )
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map((tm: any) => tm.team).filter(Boolean) || [];
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};

// =============================================
// TEAM MEMBER OPERATIONS
// =============================================

export const teamMemberDb = {
  async add(teamId: string, userId: string, role: 'admin' | 'member' | 'viewer' = 'member') {
    const { data, error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: userId, role })
      .select(`
        *,
        user:users (
          id,
          email,
          name,
          avatar_url,
          is_online
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByTeam(teamId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:users (
          id,
          email,
          name,
          avatar_url,
          is_online
        )
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async updateRole(teamId: string, userId: string, role: 'admin' | 'member' | 'viewer') {
    const { data, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async remove(teamId: string, userId: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams (
          id,
          name,
          organization_id
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },
};

// =============================================
// TASK OPERATIONS
// =============================================

export const taskDb = {
  async create(taskData: any) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        comments (
          id,
          text,
          created_at,
          author:users (
            id,
            name,
            avatar_url
          )
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        comments (
          id,
          text,
          created_at,
          author:users (
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByTeam(teamId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        comments (
          id,
          text,
          created_at,
          author:users (
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        comments (
          id,
          text,
          created_at,
          author:users (
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey (
          id,
          email,
          name,
          avatar_url
        ),
        comments (
          id,
          text,
          created_at,
          author:users (
            id,
            name,
            avatar_url
          )
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};

// =============================================
// COMMENT OPERATIONS
// =============================================

export const commentDb = {
  async create(taskId: string, authorId: string, text: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: taskId, author_id: authorId, text })
      .select(`
        *,
        author:users (
          id,
          name,
          avatar_url
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByTask(taskId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users (
          id,
          name,
          avatar_url
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};

// =============================================
// INVITATION OPERATIONS
// =============================================

export const invitationDb = {
  async create(invitationData: any) {
    const { data, error } = await supabase
      .from('invitations')
      .insert(invitationData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByToken(token: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async accept(id: string) {
    const { data, error } = await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};

// =============================================
// AUTH HELPER - Create new user with organization
// =============================================

export async function createUserWithOrganization(
  email: string,
  name: string,
  organizationName: string,
  avatarUrl?: string
) {
  // Generate slug from organization name
  const slug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now();

  // Create organization
  const org = await organizationDb.create(organizationName, slug);

  // Create user as owner
  const user = await userDb.create({
    email,
    name,
    organization_id: org.id,
    role: 'owner',
    avatar_url: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
  });

  // Create default team
  const team = await teamDb.create({
    name: 'General',
    description: 'Default team for all members',
    organization_id: org.id,
    created_by: user.id,
  });

  // Add user to default team as admin
  await teamMemberDb.add(team.id, user.id, 'admin');

  return { organization: org, user, team };
}

// =============================================
// NOTIFICATION OPERATIONS
// =============================================

export const notificationDb = {
  async create(notification: {
    user_id: string;
    organization_id: string;
    type: 'task_assigned' | 'task_completed' | 'invitation' | 'mention' | 'comment' | 'task_updated';
    title: string;
    message?: string;
    link?: string;
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    return count || 0;
  },

  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    return true;
  },

  async delete(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
    return true;
  },
};

// =============================================
// AUTH HELPER - Join existing organization via invitation
// =============================================

export async function joinOrganizationViaInvitation(
  email: string,
  name: string,
  invitationToken: string
) {
  // Get invitation
  const invitation = await invitationDb.getByToken(invitationToken);
  if (!invitation) {
    throw new Error('Invalid or expired invitation');
  }

  // Create user
  const user = await userDb.create({
    email,
    name,
    organization_id: invitation.organization_id,
    role: 'member',
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
  });

  // If invitation includes a team, add user to that team
  if (invitation.team_id) {
    await teamMemberDb.add(invitation.team_id, user.id, invitation.role);
  }

  // Mark invitation as accepted
  await invitationDb.accept(invitation.id);

  return { user, invitation };
}
