"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, UserCheck, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function DashboardContent() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && token) {
      fetchDashboardData()
    }
  }, [user, token])

  const fetchDashboardData = async () => {
    try {
      const endpoint = `/api/v1/dashboard/${user?.role}`
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const getStatsCards = () => {
    switch (user?.role) {
      case "patient":
        return [
          {
            title: "Total Appointments",
            value: stats.total_appointments || 0,
            description: "All your appointments",
            icon: Calendar,
            color: "text-blue-600",
          },
          {
            title: "Upcoming",
            value: stats.pending_appointments || 0,
            description: "Pending appointments",
            icon: Clock,
            color: "text-yellow-600",
          },
          {
            title: "Completed",
            value: stats.completed_appointments || 0,
            description: "Completed visits",
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            title: "Cancelled",
            value: stats.cancelled_appointments || 0,
            description: "Cancelled appointments",
            icon: XCircle,
            color: "text-red-600",
          },
        ]

      case "doctor":
        return [
          {
            title: "Total Appointments",
            value: stats.total_appointments || 0,
            description: "All appointments",
            icon: Calendar,
            color: "text-blue-600",
          },
          {
            title: "Total Patients",
            value: stats.total_patients || 0,
            description: "Unique patients",
            icon: Users,
            color: "text-green-600",
          },
          {
            title: "Pending",
            value: stats.pending_appointments || 0,
            description: "Awaiting confirmation",
            icon: AlertCircle,
            color: "text-yellow-600",
          },
          {
            title: "Total Earnings",
            value: `৳${stats.total_earnings || 0}`,
            description: "This month",
            icon: TrendingUp,
            color: "text-purple-600",
          },
        ]

      case "admin":
        return [
          {
            title: "Total Appointments",
            value: stats.total_appointments || 0,
            description: "System-wide",
            icon: Calendar,
            color: "text-blue-600",
          },
          {
            title: "Total Doctors",
            value: stats.total_doctors || 0,
            description: "Registered doctors",
            icon: UserCheck,
            color: "text-green-600",
          },
          {
            title: "Total Patients",
            value: stats.total_patients || 0,
            description: "Registered patients",
            icon: Users,
            color: "text-purple-600",
          },
          {
            title: "Total Revenue",
            value: `৳${stats.total_earnings || 0}`,
            description: "This month",
            icon: TrendingUp,
            color: "text-orange-600",
          },
        ]

      default:
        return []
    }
  }

  const getQuickActions = () => {
    switch (user?.role) {
      case "patient":
        return [
          {
            title: "Book Appointment",
            href: "/dashboard/appointments/book",
            description: "Schedule a new appointment",
          },
          { title: "Find Doctors", href: "/dashboard/doctors", description: "Browse available doctors" },
          { title: "View History", href: "/dashboard/appointments", description: "See your appointment history" },
        ]

      case "doctor":
        return [
          { title: "View Appointments", href: "/dashboard/appointments", description: "Manage your appointments" },
          { title: "Update Schedule", href: "/dashboard/schedule", description: "Modify your availability" },
          { title: "View Statistics", href: "/dashboard/statistics", description: "See your performance metrics" },
        ]

      case "admin":
        return [
          { title: "Manage Appointments", href: "/dashboard/appointments", description: "Oversee all appointments" },
          { title: "Manage Doctors", href: "/dashboard/doctors", description: "Doctor administration" },
          { title: "Generate Reports", href: "/dashboard/reports", description: "Create system reports" },
        ]

      default:
        return []
    }
  }

  const statsCards = getStatsCards()
  const quickActions = getQuickActions()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name}!</h1>
        <p className="text-gray-600 mt-2">
          {user?.role === "patient" && "Manage your appointments and health records"}
          {user?.role === "doctor" && "View your schedule and patient appointments"}
          {user?.role === "admin" && "Oversee the entire healthcare system"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={action.href}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {stats.upcoming_appointments && stats.upcoming_appointments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {stats.upcoming_appointments.slice(0, 5).map((appointment, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {user?.role === "patient" ? `Dr. ${appointment.doctor_name}` : appointment.patient_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.appointment_datetime).toLocaleDateString()} at{" "}
                        {new Date(appointment.appointment_datetime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
