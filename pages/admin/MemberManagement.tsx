import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Download,
  Mail,
  AlertCircle,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { safeText } from '@/lib/cellValue';
import type { User } from '@/models';

/**
 * Admin member management page with live Supabase data
 * CRUD operations for managing member accounts
 */
export default function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load members from Supabase
  useEffect(() => {
    let mounted = true;

    async function loadMembers() {
      try {
        setLoading(true);
        setError(null);

        const { data: membersData, error: membersError } = await supabase
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: false });

        if (membersError) {
          throw new Error(membersError.message);
        }

        if (mounted) {
          setMembers(membersData || []);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading members:', err);
          setError(err instanceof Error ? err.message : 'Failed to load members');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMembers();
    return () => {
      mounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'member':
        return <Badge className="bg-blue-100 text-blue-800">Member</Badge>;
      default:
        return <Badge variant="secondary">{role || 'Unknown'}</Badge>;
    }
  };

  const filteredMembers = members.filter(member =>
    safeText(member.pharmacy_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    safeText(member.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
    safeText(member.city).toLowerCase().includes(searchTerm.toLowerCase()) ||
    safeText(member.state).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getLastLoginText = (createdAt?: string) => {
    if (!createdAt) return 'Unknown';
    const diffInDays = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Member Management</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <p className="text-red-800">Error loading members: {error}</p>
                <p className="text-red-600 text-sm mt-1">
                  Please check your Supabase configuration and try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600 mt-1">
            Manage member accounts and subscriptions ({members.length} total members)
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700">
              Live from Supabase
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
              Real-time Data
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export ({filteredMembers.length})
          </Button>
          <Button className="bg-brand-gradient">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {members.filter(m => m.subscription_status === 'active').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-red-600">
                  {members.filter(m => m.role === 'admin').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">⚡</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {members.filter(m => {
                    if (!m.created_at) return false;
                    const memberDate = new Date(m.created_at);
                    const now = new Date();
                    return memberDate.getMonth() === now.getMonth() && 
                           memberDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members by pharmacy, email, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          {searchTerm && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredMembers.length} of {members.length} members
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Members ({filteredMembers.length})</CardTitle>
          <CardDescription>
            Manage member accounts, subscriptions, and access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {members.length === 0 ? (
                <div>
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No members found</p>
                </div>
              ) : (
                <div>
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No members match your search criteria</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pharmacy & Location
                    </th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Role
                    </th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {safeText(member.pharmacy_name) || 'Unknown Pharmacy'}
                          </div>
                          <div className="text-sm text-gray-500">{safeText(member.email)}</div>
                          {member.pharmacy_phone && (
                            <div className="text-xs text-gray-400">{member.pharmacy_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          {member.address1 && (
                            <div className="text-sm text-gray-900">{member.address1}</div>
                          )}
                          <div className="text-sm text-gray-600">
                            {[safeText(member.city), safeText(member.state), member.zipcode]
                              .filter(Boolean)
                              .join(', ') || 'Location not provided'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="space-y-1">
                          {getStatusBadge(member.subscription_status || 'unknown')}
                          {getRoleBadge(member.role)}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(member.created_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Active {getLastLoginText(member.created_at)}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}