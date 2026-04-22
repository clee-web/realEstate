'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Search, Home, PlusCircle, LogOut, User, Menu } from 'lucide-react'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Kisumu Homes</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 transition">
              Properties
            </Link>
            <Link href="/deals" className="text-gray-700 hover:text-blue-600 transition">
              Cheap Deals
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <Link href="/property/new" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  <PlusCircle className="h-4 w-4" />
                  <span>Post Property</span>
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="text-gray-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3">
            <Link href="/" className="block text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/properties" className="block text-gray-700 hover:text-blue-600 transition">
              Properties
            </Link>
            <Link href="/deals" className="block text-gray-700 hover:text-blue-600 transition">
              Cheap Deals
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block text-gray-700 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <Link href="/property/new" className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition">
                  Post Property
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-gray-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-gray-700 hover:text-blue-600 transition">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
