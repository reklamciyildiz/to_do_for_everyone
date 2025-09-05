'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays } from 'date-fns';

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
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: string[];
  comments: Comment[];
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

interface TaskContextType {
  tasks: Task[];
  teams: Team[];
  currentTeam: Team | null;
  currentUser: TeamMember | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'comments'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setCurrentTeam: (teamId: string) => void;
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  inviteMember: (teamId: string, member: Omit<TeamMember, 'id' | 'isOnline'>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeamState] = useState<Team | null>(null);

  // Mock current user
  const currentUser: TeamMember = {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    isOnline: true
  };

  // Initialize with mock data
  useEffect(() => {
    const productTeam: Team = {
      id: 'team-1',
      name: 'Product Team',
      description: 'Building the next generation of productivity tools',
      members: [
        currentUser,
        {
          id: 'user-2',
          name: 'Sarah Chen',
          email: 'sarah.chen@company.com',
          role: 'member',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          isOnline: true
        },
        {
          id: 'user-3',
          name: 'Marcus Johnson',
          email: 'marcus.johnson@company.com',
          role: 'member',
          avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          isOnline: true
        },
        {
          id: 'user-4',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@company.com',
          role: 'member',
          avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          isOnline: false
        },
        {
          id: 'user-5',
          name: 'David Kim',
          email: 'david.kim@company.com',
          role: 'admin',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          isOnline: true
        }
      ],
      createdAt: new Date('2024-01-01')
    };

    const designTeam: Team = {
      id: 'team-2',
      name: 'Design Team',
      description: 'Creating beautiful and intuitive user experiences',
      members: [
        currentUser,
        {
          id: 'user-6',
          name: 'Jessica Park',
          email: 'jessica.park@company.com',
          role: 'admin',
          avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          isOnline: true
        },
        {
          id: 'user-7',
          name: 'Ryan Thompson',
          email: 'ryan.thompson@company.com',
          role: 'member',
          avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          isOnline: false
        }
      ],
      createdAt: new Date('2024-01-01')
    };

    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Redesign user onboarding experience',
        description: 'Create comprehensive wireframes and interactive prototypes for the new user onboarding flow. Include user research findings and accessibility considerations.',
        status: 'progress',
        priority: 'high',
        dueDate: addDays(new Date(), 5),
        assigneeId: 'user-2',
        teamId: 'team-1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        attachments: ['wireframes_v2.fig', 'user_research.pdf'],
        comments: [
          {
            id: 'comment-1',
            text: 'Great progress on the wireframes! The flow looks much more intuitive now.',
            authorId: 'user-1',
            createdAt: new Date('2025-01-02T10:30:00')
          }
        ]
      },
      {
        id: 'task-2',
        title: 'Implement dark mode theme system',
        description: 'Add comprehensive dark theme support across the entire application with proper color contrast ratios and smooth transitions.',
        status: 'review',
        priority: 'medium',
        dueDate: addDays(new Date(), 3),
        assigneeId: 'user-3',
        teamId: 'team-1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-03'),
        attachments: ['theme_colors.json'],
        comments: [
          {
            id: 'comment-2',
            text: 'The implementation looks solid. Just need to test on mobile devices.',
            authorId: 'user-5',
            createdAt: new Date('2025-01-03T14:15:00')
          },
          {
            id: 'comment-3',
            text: 'I can help with the mobile testing once this is ready.',
            authorId: 'user-4',
            createdAt: new Date('2025-01-03T14:20:00')
          }
        ]
      },
      {
        id: 'task-3',
        title: 'Complete API documentation',
        description: 'Document all REST API endpoints with comprehensive examples, error codes, and authentication details for external developers.',
        status: 'todo',
        priority: 'medium',
        dueDate: addDays(new Date(), 10),
        assigneeId: 'user-4',
        teamId: 'team-1',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
        attachments: [],
        comments: []
      },
      {
        id: 'task-4',
        title: 'Performance optimization sprint',
        description: 'Optimize application performance focusing on initial load times and runtime efficiency. Target: <2s initial load.',
        status: 'progress',
        priority: 'urgent',
        dueDate: addDays(new Date(), 1),
        assigneeId: 'user-5',
        teamId: 'team-1',
        createdAt: new Date('2025-01-03'),
        updatedAt: new Date('2025-01-04'),
        attachments: ['performance_audit.pdf', 'lighthouse_report.html'],
        comments: [
          {
            id: 'comment-4',
            text: 'Initial audit shows we can improve bundle size by 40% with code splitting.',
            authorId: 'user-5',
            createdAt: new Date('2025-01-04T09:00:00')
          }
        ]
      },
      {
        id: 'task-5',
        title: 'User feedback integration',
        description: 'Implement in-app feedback system with rating prompts and suggestion collection.',
        status: 'done',
        priority: 'low',
        dueDate: addDays(new Date(), -5),
        assigneeId: 'user-2',
        teamId: 'team-1',
        createdAt: new Date('2024-12-28'),
        updatedAt: new Date('2025-01-05'),
        attachments: ['feedback_mockups.png'],
        comments: [
          {
            id: 'comment-5',
            text: 'Deployed to production! Already seeing positive user responses.',
            authorId: 'user-2',
            createdAt: new Date('2025-01-05T16:30:00')
          }
        ]
      },
      {
        id: 'task-6',
        title: 'Mobile app icon design',
        description: 'Design new app icon that works across all platforms and sizes. Include adaptive icon for Android.',
        status: 'review',
        priority: 'medium',
        dueDate: addDays(new Date(), 7),
        assigneeId: 'user-6',
        teamId: 'team-2',
        createdAt: new Date('2025-01-04'),
        updatedAt: new Date('2025-01-05'),
        attachments: ['icon_concepts_v3.ai', 'platform_variations.zip'],
        comments: [
          {
            id: 'comment-6',
            text: 'Love the direction! The gradient version really stands out.',
            authorId: 'user-1',
            createdAt: new Date('2025-01-05T11:45:00')
          }
        ]
      },
      {
        id: 'task-7',
        title: 'Brand guidelines update',
        description: 'Update brand guidelines to include new color palette, typography, and component specifications.',
        status: 'todo',
        priority: 'low',
        assigneeId: 'user-7',
        teamId: 'team-2',
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-05'),
        attachments: [],
        comments: []
      }
    ];

    setTeams([productTeam, designTeam]);
    setTasks(mockTasks);
    setCurrentTeamState(productTeam);
  }, []);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      comments: []
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const setCurrentTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeamState(team);
    }
  };

  const addTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      createdAt: new Date()
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const inviteMember = (teamId: string, memberData: Omit<TeamMember, 'id' | 'isOnline'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: `user-${Date.now()}`,
      isOnline: false
    };
    
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, members: [...team.members, newMember] }
        : team
    ));
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      teams,
      currentTeam,
      currentUser,
      addTask,
      updateTask,
      deleteTask,
      setCurrentTeam,
      addTeam,
      inviteMember
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