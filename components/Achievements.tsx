'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTaskContext } from '@/components/TaskContext';
import { 
  Trophy, 
  Flame, 
  Target, 
  Zap, 
  Star, 
  Award,
  Crown,
  Rocket,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'productivity' | 'collaboration' | 'streak' | 'milestone';
}

export function Achievements() {
  const { tasks, currentTeam, currentUser } = useTaskContext();

  const teamTasks = tasks.filter(task => task.teamId === currentTeam?.id);
  const userTasks = teamTasks.filter(task => task.assigneeId === currentUser?.id);
  const completedUserTasks = userTasks.filter(task => task.status === 'done');

  // Calculate streak (consecutive days with completed tasks)
  const calculateStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const nextDate = new Date(checkDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const hasCompletedTask = completedUserTasks.some(task => {
        const taskDate = new Date(task.updatedAt);
        return taskDate >= checkDate && taskDate < nextDate;
      });
      
      if (hasCompletedTask) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  const achievements: Achievement[] = useMemo(() => [
    // Productivity Achievements
    {
      id: 'first-task',
      name: 'First Steps',
      description: 'Complete your first task',
      icon: <CheckCircle2 className="h-6 w-6" />,
      progress: Math.min(completedUserTasks.length, 1),
      maxProgress: 1,
      unlocked: completedUserTasks.length >= 1,
      tier: 'bronze',
      category: 'productivity'
    },
    {
      id: 'task-master',
      name: 'Task Master',
      description: 'Complete 10 tasks',
      icon: <Target className="h-6 w-6" />,
      progress: Math.min(completedUserTasks.length, 10),
      maxProgress: 10,
      unlocked: completedUserTasks.length >= 10,
      tier: 'silver',
      category: 'productivity'
    },
    {
      id: 'productivity-pro',
      name: 'Productivity Pro',
      description: 'Complete 50 tasks',
      icon: <Rocket className="h-6 w-6" />,
      progress: Math.min(completedUserTasks.length, 50),
      maxProgress: 50,
      unlocked: completedUserTasks.length >= 50,
      tier: 'gold',
      category: 'productivity'
    },
    {
      id: 'legend',
      name: 'Legend',
      description: 'Complete 100 tasks',
      icon: <Crown className="h-6 w-6" />,
      progress: Math.min(completedUserTasks.length, 100),
      maxProgress: 100,
      unlocked: completedUserTasks.length >= 100,
      tier: 'platinum',
      category: 'productivity'
    },
    // Streak Achievements
    {
      id: 'streak-starter',
      name: 'Streak Starter',
      description: 'Maintain a 3-day streak',
      icon: <Flame className="h-6 w-6" />,
      progress: Math.min(streak, 3),
      maxProgress: 3,
      unlocked: streak >= 3,
      tier: 'bronze',
      category: 'streak'
    },
    {
      id: 'on-fire',
      name: 'On Fire',
      description: 'Maintain a 7-day streak',
      icon: <Zap className="h-6 w-6" />,
      progress: Math.min(streak, 7),
      maxProgress: 7,
      unlocked: streak >= 7,
      tier: 'silver',
      category: 'streak'
    },
    {
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Maintain a 14-day streak',
      icon: <Star className="h-6 w-6" />,
      progress: Math.min(streak, 14),
      maxProgress: 14,
      unlocked: streak >= 14,
      tier: 'gold',
      category: 'streak'
    },
    {
      id: 'marathon',
      name: 'Marathon Runner',
      description: 'Maintain a 30-day streak',
      icon: <Trophy className="h-6 w-6" />,
      progress: Math.min(streak, 30),
      maxProgress: 30,
      unlocked: streak >= 30,
      tier: 'platinum',
      category: 'streak'
    },
    // Speed Achievements
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Complete 5 tasks in one day',
      icon: <Clock className="h-6 w-6" />,
      progress: 0, // Would need daily tracking
      maxProgress: 5,
      unlocked: false,
      tier: 'gold',
      category: 'productivity'
    },
    // Team Achievements
    {
      id: 'team-player',
      name: 'Team Player',
      description: 'Be part of a team with 5+ members',
      icon: <Users className="h-6 w-6" />,
      progress: currentTeam?.members.length || 0,
      maxProgress: 5,
      unlocked: (currentTeam?.members.length || 0) >= 5,
      tier: 'silver',
      category: 'collaboration'
    },
  ], [completedUserTasks.length, streak, currentTeam?.members.length]);

  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-300 to-cyan-500';
    }
  };

  const getTierBg = (tier: Achievement['tier'], unlocked: boolean) => {
    if (!unlocked) return 'bg-muted';
    switch (tier) {
      case 'bronze': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'silver': return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
      case 'gold': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'platinum': return 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.reduce((sum, a) => {
    if (!a.unlocked) return sum;
    switch (a.tier) {
      case 'bronze': return sum + 10;
      case 'silver': return sum + 25;
      case 'gold': return sum + 50;
      case 'platinum': return sum + 100;
    }
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Achievements</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {unlockedCount}/{achievements.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-xl">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">Current Streak</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {streak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Total Points</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {totalPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            All Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  getTierBg(achievement.tier, achievement.unlocked),
                  !achievement.unlocked && "opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    achievement.unlocked 
                      ? `bg-gradient-to-br ${getTierColor(achievement.tier)} text-white`
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{achievement.name}</h3>
                      {achievement.unlocked && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {achievement.tier}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                        <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
