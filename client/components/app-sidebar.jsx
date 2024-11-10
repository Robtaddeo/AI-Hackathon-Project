'use client'

import { Calendar, Home, Inbox, List, Search, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_KEY environment variable')
}

const supabase = createClient(
  'https://prkkhhdzeudwvopniwhr.supabase.co',
  supabaseKey
)

const fetchSteps = async (recipeId) => {
  if (!recipeId) return []
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('session_id', recipeId)
    .order('step_number', { ascending: true })

  if (error) throw error
  return data
}

export function AppSidebar() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id')

  const defaultItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Overview", 
      url: `/recipe?id=${recipeId}&step=0`,
      icon: List,
    },
  ]

  // Use query with proper caching
  const { data: steps = [], isLoading } = useQuery({
    queryKey: ['sidebar-steps', recipeId], // Different key from main steps query
    queryFn: () => fetchSteps(recipeId),
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {defaultItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>Steps</SidebarGroupLabel>
            <SidebarMenu>
              {isLoading ? (
                // Skeleton loading state
                [...Array(5)].map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton asChild>
                      <div className="w-full h-6 bg-gray-200 animate-pulse rounded" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                steps.map((step) => (
                  <SidebarMenuItem key={step.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/recipe?id=${recipeId}&step=${step.step_number}`}>
                        <span>{step.step_number} - {step.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
