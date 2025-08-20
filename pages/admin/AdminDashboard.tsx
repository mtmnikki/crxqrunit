import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

/**
 * Admin dashboard with key metrics and management tools
 */
export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Members',
      value: '1,247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Active pharmacy professionals'
    },
    {
      title: 'Monthly Revenue',
      value: '$54,280',
      change: '+8%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'Subscription revenue this month'
    },
    {
      title: 'Content Views',
      value: '23,456',
      change: '+15%',
      changeType: 'positive' as const,
      icon: Activity,
      description: 'Resource downloads this week'
    },
    {
      title: 'Support Tickets',
      value: '12',
      change: '-2',
      changeType: 'negative' as const,
      icon: AlertCircle,
      description: 'Open tickets requiring attention'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'member_joined',
      member: 'Dr. Sarah Johnson',
      pharmacy: 'Community Care Pharmacy',
      time: '2 hours ago',
      status: 'new'
    },
    {
      id: 2,
      type: 'content_uploaded',
      member: 'Admin Team',
      pharmacy: 'ClinicalRxQ',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'support_ticket',
      member: 'Mike Chen',
      pharmacy: 'Downtown Pharmacy',
      time: '6 hours ago',
      status: 'pending'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'content_uploaded':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'support_ticket':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage members, content, and system operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <span 
                  className={
                    stat.changeType === 'positive' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }
                >
                  {stat.change}
                </span>
                <span className="text-gray-500">from last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest member and system activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.member}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.pharmacy}
                    </p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add New Member
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Upload Content
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Reports
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Review Support Tickets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-gray-500">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">API Services</p>
                <p className="text-xs text-gray-500">Operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Backup System</p>
                <p className="text-xs text-gray-500">Running</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}