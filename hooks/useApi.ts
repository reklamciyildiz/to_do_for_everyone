'use client';

import { useState, useCallback } from 'react';
import { taskApi, teamApi, memberApi } from '@/lib/api';
import { Task, Team, TeamMember, CreateTaskRequest, UpdateTaskRequest, CreateTeamRequest, AddMemberRequest } from '@/lib/types';

// Hook for task operations with API
export function useTaskApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (teamId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.getAll(teamId);
      if (!response.success) {
        setError(response.error || 'Failed to fetch tasks');
        return null;
      }
      return response.data;
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: CreateTaskRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.create(task);
      if (!response.success) {
        setError(response.error || 'Failed to create task');
        return null;
      }
      return response.data;
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: UpdateTaskRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.update(id, updates);
      if (!response.success) {
        setError(response.error || 'Failed to update task');
        return null;
      }
      return response.data;
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.delete(id);
      if (!response.success) {
        setError(response.error || 'Failed to delete task');
        return false;
      }
      return true;
    } catch (err) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

// Hook for team operations with API
export function useTeamApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teamApi.getAll(userId);
      if (!response.success) {
        setError(response.error || 'Failed to fetch teams');
        return null;
      }
      return response.data;
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (team: CreateTeamRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teamApi.create(team);
      if (!response.success) {
        setError(response.error || 'Failed to create team');
        return null;
      }
      return response.data;
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeam = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teamApi.delete(id);
      if (!response.success) {
        setError(response.error || 'Failed to delete team');
        return false;
      }
      return true;
    } catch (err) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchTeams,
    createTeam,
    deleteTeam,
  };
}

// Hook for member operations with API
export function useMemberApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMember = useCallback(async (teamId: string, member: AddMemberRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await memberApi.add(teamId, member);
      if (!response.success) {
        setError(response.error || 'Failed to add member');
        return null;
      }
      return response.data;
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (teamId: string, memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await memberApi.remove(teamId, memberId);
      if (!response.success) {
        setError(response.error || 'Failed to remove member');
        return false;
      }
      return true;
    } catch (err) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addMember,
    removeMember,
  };
}
