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

// Menu items.
const defaultItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Overview",
    url: "/recipe?id=test&step=0",
    icon: List,
  },
]

const steps = [
  {
    number: 1,
    description: "Prep and dice all vegetables"
  },
  {
    number: 2, 
    description: "Sauté onions and garlic in oil (5 min)"
  },
  {
    number: 3,
    description: "Cook eggplant and peppers (8-10 min)"
  },
  {
    number: 4,
    description: "Add remaining vegetables and seasonings"
  },
  {
    number: 5,
    description: "Simmer covered (30-35 min)"
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {defaultItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
              {steps.map((step) => (
                <SidebarMenuItem key={step.title}>
                <SidebarMenuButton asChild>
                  <Link href={`/recipe?id=test&step=${step.number}`}>
                    <span>{step.number} - {step.description}</span>
                  </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
