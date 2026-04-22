'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Shield, User, Home, Flag, Edit, Search, Plus, Users, AlertCircle } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchUsers, setSearchUsers] = useState('')
  const [searchProperties, setSearchProperties] = useState('')
  const [searchReports, setSearchReports] = useState('')
  const [filterPropertyStatus, setFilterPropertyStatus] = useState('all')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.push('/')
      return
    }

    setUser(user)
    setIsAdmin(true)
    fetchAdminData()
  }

  const fetchAdminData = async () => {
    // Fetch all users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersData) setUsers(usersData)

    // Fetch all properties
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (propertiesData) setProperties(propertiesData)

    // Fetch all reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*, properties(title), profiles(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (reportsData) setReports(reportsData)

    setLoading(false)
  }

  const handleVerifyUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId)

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_verified: true } : u))
    }
  }

  const handleVerifyProperty = async (propertyId: string) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_verified: true, status: 'active' })
      .eq('id', propertyId)

    if (!error) {
      setProperties(properties.map(p => p.id === propertyId ? { ...p, is_verified: true, status: 'active' } : p))
    }
  }

  const handleRejectProperty = async (propertyId: string) => {
    const { error } = await supabase
      .from('properties')
      .update({ status: 'rejected' })
      .eq('id', propertyId)

    if (!error) {
      setProperties(properties.map(p => p.id === propertyId ? { ...p, status: 'rejected' } : p))
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (!error) {
      setProperties(properties.filter(p => p.id !== propertyId))
    }
  }

  const handleResolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    const { error } = await supabase
      .from('reports')
      .update({ status: action })
      .eq('id', reportId)

    if (!error) {
      setReports(reports.filter(r => r.id !== reportId))
    }
  }

  const handleSetUserRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their properties.')) {
      return
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (!error) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{properties.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{reports.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{properties.filter(p => p.status === 'pending').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => router.push('/property/new')}
                className="bg-blue-600 hover:bg-blue-700 flex flex-col items-center gap-2 h-auto py-4"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm">Add Property</span>
              </Button>
              <Button
                onClick={() => {
                  setFilterPropertyStatus('pending')
                  router.push('/admin#properties')
                }}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Pending ({properties.filter(p => p.status === 'pending').length})</span>
              </Button>
              <Button
                onClick={() => router.push('/admin#users')}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Users className="h-5 w-5" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button
                onClick={() => router.push('/admin#reports')}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Flag className="h-5 w-5" />
                <span className="text-sm">Reports ({reports.length})</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchProperties}
                  onChange={(e) => setSearchProperties(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPropertyStatus} onValueChange={setFilterPropertyStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {properties
              .filter(p => 
                p.title.toLowerCase().includes(searchProperties.toLowerCase()) ||
                p.county.toLowerCase().includes(searchProperties.toLowerCase()) ||
                p.town.toLowerCase().includes(searchProperties.toLowerCase())
              )
              .filter(p => filterPropertyStatus === 'all' || p.status === filterPropertyStatus)
              .map((property) => (
              <Card key={property.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <p className="text-gray-600 text-sm">{property.county}, {property.town}</p>
                      <p className="text-blue-600 font-bold">KES {property.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={property.status === 'active' ? 'bg-green-500' : property.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}>
                          {property.status}
                        </Badge>
                        {property.is_verified && (
                          <Badge className="bg-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {property.is_featured && (
                          <Badge className="bg-yellow-500">Featured</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Listed by: {property.profiles?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {property.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleVerifyProperty(property.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectProperty(property.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {!property.is_verified && property.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyProperty(property.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/property/${property.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="pl-10"
              />
            </div>
            {users
              .filter(u => 
                u.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchUsers.toLowerCase())
              )
              .map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{user.full_name || user.email}</h3>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={user.role === 'admin' ? 'bg-purple-600' : user.role === 'agent' ? 'bg-blue-600' : 'bg-gray-600'}>
                          {user.role}
                        </Badge>
                        {user.is_verified && (
                          <Badge className="bg-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!user.is_verified && (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyUser(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      <Select
                        value={user.role}
                        onValueChange={(role: string) => handleSetUserRole(user.id, role)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {user.id !== user?.id && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports..."
                value={searchReports}
                onChange={(e) => setSearchReports(e.target.value)}
                className="pl-10"
              />
            </div>
            {reports
              .filter(r => 
                r.reason?.toLowerCase().includes(searchReports.toLowerCase()) ||
                r.description?.toLowerCase().includes(searchReports.toLowerCase())
              ).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No pending reports</p>
                </CardContent>
              </Card>
            ) : (
              reports
                .filter(r => 
                  r.reason?.toLowerCase().includes(searchReports.toLowerCase()) ||
                  r.description?.toLowerCase().includes(searchReports.toLowerCase())
                )
                .map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="h-4 w-4 text-red-600" />
                          <h3 className="font-semibold">{report.reason}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                        <p className="text-sm text-gray-600">
                          Property: {report.properties?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Reported by: {report.profiles?.full_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(report.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleResolveReport(report.id, 'resolved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveReport(report.id, 'dismissed')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
