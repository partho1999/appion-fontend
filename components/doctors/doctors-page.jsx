"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MapPin, Clock, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

function getProfileImageUrl(profile_image) {
  if (!profile_image) return "/placeholder.svg";
  const cleanPath = profile_image.replace(/^\.{1,2}[\\/]/, "").replace(/\\/g, "/");
  return `http://localhost:8000/${cleanPath}`;
}

export function DoctorsPage() {
  const { user, token } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [specializationFilter, setSpecializationFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchDoctors()
  }, [specializationFilter, currentPage])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        skip: ((currentPage - 1) * 10).toString(),
        limit: "10",
      })

      if (specializationFilter !== "all") {
        params.append("specialization", specializationFilter)
      }

      const endpoint = user?.role === "admin" ? "/api/v1/admin/doctors" : "/api/v1/doctors"
      const response = await fetch(`http://localhost:8000${endpoint}?${params}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (response.ok) {
        const data = await response.json()
        // Support { data: [...] } or { doctors: [...] } or array
        const doctorsArray = Array.isArray(data.data)
          ? data.data
          : (Array.isArray(data.doctors) ? data.doctors : (Array.isArray(data) ? data : []));
        setDoctors(doctorsArray)
        setTotalPages(Math.ceil((data.total || doctorsArray.length) / 10))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleDoctorStatus = async (doctorId, isActive) => {
    if (user?.role !== "admin") return

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/doctors/${doctorId}/status?is_active=${!isActive}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        toast({
          title: "Success",
          description: `Doctor ${!isActive ? "activated" : "deactivated"} successfully`,
        })
        fetchDoctors()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update doctor status",
        variant: "destructive",
      })
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      doctor.full_name.toLowerCase().includes(searchLower) ||
      doctor.specialization?.toLowerCase().includes(searchLower) ||
      doctor.division_name?.toLowerCase().includes(searchLower) ||
      doctor.district_name?.toLowerCase().includes(searchLower)
    )
  })

  const specializations = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Doctors</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
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
        <h1 className="text-2xl font-bold">{user?.role === "admin" ? "Manage Doctors" : "Find Doctors"}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search doctors by name, specialization, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Doctors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getProfileImageUrl(doctor.profile_image)} />
                      <AvatarFallback>
                        {doctor.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Dr. {doctor.full_name}</CardTitle>
                      <CardDescription>{doctor.specialization || "General Practitioner"}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={doctor.is_active ? "default" : "secondary"}>
                    {doctor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {doctor.experience_years && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {doctor.experience_years} years experience
                    </div>
                  )}

                  {(doctor.division_name || doctor.district_name) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {doctor.district_name}, {doctor.division_name}
                    </div>
                  )}

                  {doctor.consultation_fee && (
                    <div className="text-sm">
                      <span className="font-semibold text-green-600">৳{doctor.consultation_fee}</span>
                      <span className="text-gray-600"> consultation fee</span>
                    </div>
                  )}

                  {doctor.available_timeslots && (
                    <div className="text-sm text-gray-600">
                      <strong>Available:</strong> {doctor.available_timeslots}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  {user?.role === "patient" && doctor.is_active && (
                    <Button asChild className="flex-1">
                      <Link href={`/dashboard/appointments/book?doctor=${doctor.id}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                  )}

                  {user?.role === "admin" && (
                    <>
                      <Button
                        variant={doctor.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleDoctorStatus(doctor.id, doctor.is_active)}
                      >
                        {doctor.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/doctors/${doctor.id}/appointments`}>View Appointments</Link>
                      </Button>
                    </>
                  )}

                  {user?.role !== "patient" && (
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
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
