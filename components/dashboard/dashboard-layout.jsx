"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Home, Users, UserCheck, Settings, LogOut, Heart, BarChart3, FileText } from "lucide-react"
import Link from "next/link"

const getMenuItems = (role) => {
  const commonItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Profile", url: "/dashboard/profile", icon: Settings },
  ]

  const roleSpecificItems = {
    patient: [
      { title: "Book Appointment", url: "/dashboard/appointments/book", icon: Calendar },
      { title: "My Appointments", url: "/dashboard/appointments", icon: Calendar },
      { title: "Find Doctors", url: "/dashboard/doctors", icon: UserCheck },
    ],
    doctor: [
      { title: "My Appointments", url: "/dashboard/appointments", icon: Calendar },
      { title: "My Schedule", url: "/dashboard/schedule", icon: Calendar },
      { title: "My Patients", url: "/dashboard/patients", icon: Users },
      { title: "Statistics", url: "/dashboard/statistics", icon: BarChart3 },
    ],
    admin: [
      { title: "All Appointments", url: "/dashboard/appointments", icon: Calendar },
      { title: "Manage Doctors", url: "/dashboard/doctors", icon: UserCheck },
      { title: "Manage Patients", url: "/dashboard/patients", icon: Users },
      { title: "Reports", url: "/dashboard/reports", icon: FileText },
      { title: "Statistics", url: "/dashboard/statistics", icon: BarChart3 },
    ],
  }

  return [...commonItems, ...(roleSpecificItems[role] || [])]
}

export function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = getMenuItems(user.role)

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-4 py-2">
            <Heart className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Appion</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.profile_image || "/placeholder.svg"} />
                      <AvatarFallback>
                        {(user.full_name && typeof user.full_name === "string")
                          ? user.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.full_name || "Unknown User"}</span>
                      <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">Welcome back, {user.full_name}</span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
