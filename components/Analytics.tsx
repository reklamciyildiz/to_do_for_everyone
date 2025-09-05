'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTaskContext } from '@/components/TaskContext';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Users,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Zap,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Analytics() {
  const { tasks, currentTeam } = useTaskContext();

  const teamTasks = tasks.filter(task => task.teamId === currentTeam?.id);
  const completedTasks = teamTasks.filter(task => task.status === 'done');
  const overdueTasks = teamTasks.filter(task => 
    task.dueDate && 
    task.dueDate < new Date() && 
    task.status !== 'done'
  );

  const completionRate = teamTasks.length > 0 
    ? Math.round((completedTasks.length / teamTasks.length) * 100) 
    : 0;

  const statusDistribution = {
    todo: teamTasks.filter(t => t.status === 'todo').length,
    progress: teamTasks.filter(t => t.status === 'progress').length,
    review: teamTasks.filter(t => t.status === 'review').length,
    done: teamTasks.filter(t => t.status === 'done').length,
  };

  const priorityDistribution = {
    urgent: teamTasks.filter(t => t.priority === 'urgent').length,
    high: teamTasks.filter(t => t.priority === 'high').length,
    medium: teamTasks.filter(t => t.priority === 'medium').length,
    low: teamTasks.filter(t => t.priority === 'low').length,
  };

  // Mock productivity metrics
  const productivityMetrics = {
    tasksCompletedThisWeek: 18,
    averageCompletionTime: '1.8 days',
    onTimeDelivery: 94,
    teamProductivity: 96
  };

  const getMemberProductivity = () => {
    if (!currentTeam) return [];
    
    return currentTeam.members.map(member => {
      const memberTasks = teamTasks.filter(task => task.assigneeId === member.id);
      const memberCompleted = memberTasks.filter(task => task.status === 'done');
      const completionRate = memberTasks.length > 0 
        ? Math.round((memberCompleted.length / memberTasks.length) * 100) 
        : 0;
      
      return {
        ...member,
        totalTasks: memberTasks.length,
        completedTasks: memberCompleted.length,
        completionRate
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your team's productivity and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <Progress value={completionRate} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Tasks Completed</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{productivityMetrics.tasksCompletedThisWeek}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">This week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Overdue Tasks</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{overdueTasks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Needs attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg. Completion</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{productivityMetrics.averageCompletionTime}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Per task</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const percentage = teamTasks.length > 0 
                ? Math.round((count / teamTasks.length) * 100) 
                : 0;
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getMemberProductivity().map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{member.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {member.completedTasks}/{member.totalTasks} tasks
                    </span>
                  </div>
                  <Progress value={member.completionRate} className="h-2" />
                </div>
                <Badge 
                  variant={member.completionRate >= 80 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {member.completionRate}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(priorityDistribution).map(([priority, count]) => {
              const percentage = teamTasks.length > 0 
                ? Math.round((count / teamTasks.length) * 100) 
                : 0;
              
              return (
                <div key={priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{priority}</span>
                    <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Productivity Insights */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Zap className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">🚀 Peak Performance</p>
                  <p className="text-xs text-muted-foreground">Team velocity increased 23% this sprint with improved collaboration</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">⚡ Efficiency Boost</p>
                  <p className="text-xs text-muted-foreground">Code review time reduced by 35% with new automated checks</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">🎯 Smart Scheduling</p>
                  <p className="text-xs text-muted-foreground">AI suggests moving 2 tasks to next sprint for optimal workload balance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}