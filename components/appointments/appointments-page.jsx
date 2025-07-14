"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Search, Filter, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export function AppointmentsPage() {
  const { user, token } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (user && token) {
      fetchAppointments()
    }
  }, [user, token, statusFilter, currentPage])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      let endpoint = ""

      if (user?.role === "patient") {
        endpoint = "/api/v1/appointments"
      } else if (user?.role === "doctor") {
        endpoint = "/api/v1/doctors/appointments"
      } else if (user?.role === "admin") {
        endpoint = "/api/v1/admin/appointments"
      }

      const params = new URLSearchParams({
        skip: ((currentPage - 1) * 10).toString(),
        limit: "10",
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`http://localhost:8000${endpoint}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || data)
        setTotalPages(Math.ceil((data.total || data.length) / 10))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      let endpoint = ""

      if (user?.role === "doctor" || user?.role === "patient") {
        endpoint = `/api/v1/appointments/${appointmentId}/status`
      } else if (user?.role === "admin") {
        endpoint = `/api/v1/admin/appointments/${appointmentId}/status`
      }

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment status updated",
        })
        fetchAppointments()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled",
        })
        fetchAppointments()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter((appointment) => {
        const searchLower = searchTerm.toLowerCase()
        const doctorName = appointment.doctor_name?.toLowerCase() || ""
        const patientName = appointment.patient_name?.toLowerCase() || ""
        const symptoms = appointment.symptoms?.toLowerCase() || ""

        return doctorName.includes(searchLower) || patientName.includes(searchLower) || symptoms.includes(searchLower)
      })
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Appointments</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {user?.role === "patient" && "My Appointments"}
          {user?.role === "doctor" && "Patient Appointments"}
          {user?.role === "admin" && "All Appointments"}
        </h1>
        {user?.role === "patient" && (
          <Button asChild>
            <Link href="/dashboard/appointments/book">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {user?.role === "patient"
                  ? "You haven't booked any appointments yet."
                  : "No appointments match your current filters."}
              </p>
              {user?.role === "patient" && (
                <Button asChild>
                  <Link href="/dashboard/appointments/book">Book Your First Appointment</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {user?.role === "patient" ? (
                        <>
                          <User className="h-5 w-5" />
                          Dr. {appointment.doctor_name}
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5" />
                          {appointment.patient_name}
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(appointment.appointment_datetime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(appointment.appointment_datetime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              </CardHeader>
              <CardContent>
                {appointment.symptoms && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Symptoms</h4>
                    <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {user?.role === "doctor" && appointment.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}>
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                      >
                        Decline
                      </Button>
                    </>
                  )}

                  {user?.role === "doctor" && appointment.status === "confirmed" && (
                    <Button size="sm" onClick={() => updateAppointmentStatus(appointment.id, "completed")}>
                      Mark Complete
                    </Button>
                  )}

                  {user?.role === "patient" && appointment.status === "pending" && (
                    <Button size="sm" variant="destructive" onClick={() => cancelAppointment(appointment.id)}>
                      Cancel
                    </Button>
                  )}

                  {user?.role === "admin" && (
                    <>
                      {appointment.status === "pending" && (
                        <Button size="sm" onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}>
                          Confirm
                        </Button>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button size="sm" onClick={() => updateAppointmentStatus(appointment.id, "completed")}>
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
