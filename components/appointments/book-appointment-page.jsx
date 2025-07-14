"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"

// Helper function to generate 30-minute time slots from a range string
const generateTimeSlots = (timeRanges) => {
  const slots = []
  if (!timeRanges) return slots

  timeRanges.split(",").forEach((range) => {
    const [startStr, endStr] = range.split("-")
    if (startStr && endStr) {
      const [startHour, startMinute] = startStr.split(":").map(Number)
      const [endHour, endMinute] = endStr.split(":").map(Number)

      const currentTime = new Date()
      currentTime.setHours(startHour, startMinute, 0, 0)

      const endTime = new Date()
      endTime.setHours(endHour, endMinute, 0, 0)

      while (currentTime.getTime() < endTime.getTime()) {
        slots.push(currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }))
        currentTime.setMinutes(currentTime.getMinutes() + 30) // 30-minute intervals
      }
    }
  })
  return slots
}

export function BookAppointmentPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedDoctorId = searchParams.get("doctor")

  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [availableTimeslots, setAvailableTimeslots] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && token) {
      fetchDoctors()
    }
  }, [user, token])

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      updateAvailableTimeslots()
    } else {
      setAvailableTimeslots([])
      setSelectedTime("")
    }
  }, [selectedDoctor, selectedDate, doctors])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8000/api/v1/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
        if (preselectedDoctorId) {
          const foundDoctor = data.find((doc) => doc.id.toString() === preselectedDoctorId)
          if (foundDoctor) {
            setSelectedDoctor(preselectedDoctorId)
          } else {
            toast({
              title: "Doctor Not Found",
              description: "The pre-selected doctor could not be found.",
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAvailableTimeslots = () => {
    const doctor = doctors.find((doc) => doc.id.toString() === selectedDoctor)
    if (doctor && doctor.available_timeslots && selectedDate) {
      const allSlots = generateTimeSlots(doctor.available_timeslots)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())

      const filteredSlots = allSlots.filter((slot) => {
        const [hour, minute] = slot.split(":").map(Number)
        const slotDateTime = new Date(selectedDate)
        slotDateTime.setHours(hour, minute, 0, 0)

        // Only show slots in the future
        if (selectedDay.getTime() === today.getTime()) {
          return slotDateTime.getTime() > now.getTime()
        }
        return true
      })
      setAvailableTimeslots(filteredSlots)
    } else {
      setAvailableTimeslots([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    if (!selectedDoctor || !selectedDate || !selectedTime || !symptoms) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }

    try {
      const [hour, minute] = selectedTime.split(":").map(Number)
      const appointmentDateTime = new Date(selectedDate)
      appointmentDateTime.setHours(hour, minute, 0, 0)

      const response = await fetch("http://localhost:8000/api/v1/appointments/book", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor_id: Number.parseInt(selectedDoctor),
          appointment_datetime: appointmentDateTime.toISOString(),
          symptoms: symptoms,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to book appointment")
      }

      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      })
      router.push("/dashboard/appointments")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to book appointment",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book New Appointment</h1>
        <p className="text-gray-600">Fill out the form to schedule your consultation.</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Select your doctor, preferred date, time, and describe your symptoms.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={doctors.length === 0}>
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.full_name} ({doctor.specialization || "General Practitioner"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {doctors.length === 0 && <p className="text-sm text-gray-500">No doctors available.</p>}
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Appointment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                      )}
                      disabled={!selectedDoctor}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => date < new Date()} // Disable past dates
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Appointment Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime} disabled={availableTimeslots.length === 0}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeslots.length > 0 ? (
                      availableTimeslots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-slots" disabled>
                        No slots available for this date
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Input
                id="symptoms"
                placeholder="Describe your symptoms briefly"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <div className="px-6 pb-6">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Book Appointment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
