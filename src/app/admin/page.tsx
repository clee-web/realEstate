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
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Check, X, Shield, User, Home, Flag, Edit, Search, Plus, Users, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">Admin panel is temporarily disabled for deployment</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">Go to Home</a>
      </div>
    </div>
  )
}
