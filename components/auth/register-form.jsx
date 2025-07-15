"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, Upload } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "patient"

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    role: defaultRole,
    division_id: "",
    district_id: "",
    thana_id: "",
    license_number: "",
    experience_years: "",
    consultation_fee: "",
    available_timeslots: "",
    specialization: "",
  })

  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [upazilas, setUpazilas] = useState([])
  const [profileImage, setProfileImage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mobileError, setMobileError] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([])
  const [customSlot, setCustomSlot] = useState("")
  // Add these for time slot picker
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [slotError, setSlotError] = useState("")

  useEffect(() => {
    fetchDivisions()
  }, [])

  useEffect(() => {
    if (formData.division_id) {
      fetchDistricts(formData.division_id)
    }
  }, [formData.division_id])

  useEffect(() => {
    if (formData.district_id) {
      fetchUpazilas(formData.district_id)
    }
  }, [formData.district_id])

  const fetchDivisions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/address/divisions")
      const data = await response.json()
      setDivisions(Array.isArray(data.data) ? data.data : [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load divisions",
        variant: "destructive",
      })
    }
  }

  const fetchDistricts = async (divisionId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/address/districts/${divisionId}`)
      const data = await response.json()
      setDistricts(Array.isArray(data.data) ? data.data : [])
      setFormData((prev) => ({ ...prev, district_id: "", thana_id: "" }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load districts",
        variant: "destructive",
      })
    }
  }

  const fetchUpazilas = async (districtId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/address/upazilas/${districtId}`)
      const data = await response.json()
      setUpazilas(Array.isArray(data.data) ? data.data : [])
      setFormData((prev) => ({ ...prev, thana_id: "" }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load upazilas",
        variant: "destructive",
      })
    }
  }

  const handleAddCustomSlot = () => {
    setSlotError("")
    if (!startTime || !endTime) {
      setSlotError("Please select both start and end time.")
      return
    }
    if (startTime >= endTime) {
      setSlotError("End time must be after start time.")
      return
    }
    const slot = `${startTime}-${endTime}`
    if (availableTimeSlots.includes(slot)) {
      setSlotError("This slot already exists.")
      return
    }
    setAvailableTimeSlots([...availableTimeSlots, slot])
    setSelectedTimeSlots([...selectedTimeSlots, slot])
    setStartTime("")
    setEndTime("")
  }

  const handleInputChange = (name, value) => {
    if (name === "mobile") {
      // Enforce +88 and 14 digits
      if (!/^\+88\d{11}$/.test(value)) {
        setMobileError("Mobile number must start with +88 and be exactly 14 digits")
      } else {
        setMobileError("")
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast({
          title: "Error",
          description: "Only JPEG and PNG files are allowed",
          variant: "destructive",
        })
        return
      }
      setProfileImage(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\+88\d{11}$/.test(formData.mobile)) {
      setMobileError("Mobile number must start with +88 and be exactly 14 digits")
      return
    }
    setLoading(true)

    try {
      const submitData = new FormData()

      // Add basic fields
      submitData.append("full_name", formData.full_name)
      submitData.append("email", formData.email)
      submitData.append("mobile", formData.mobile.startsWith("+88") ? formData.mobile : `+88${formData.mobile}`)
      submitData.append("password", formData.password)
      submitData.append("role", formData.role)
      submitData.append("division_id", formData.division_id)
      submitData.append("district_id", formData.district_id)
      submitData.append("thana_id", formData.thana_id)

      // Add doctor-specific fields
      if (formData.role === "doctor") {
        submitData.append("license_number", formData.license_number)
        submitData.append("experience_years", formData.experience_years)
        submitData.append("consultation_fee", formData.consultation_fee)
        submitData.append("available_timeslots", selectedTimeSlots.join(", "))
        submitData.append("specialization", formData.specialization)
      }

      // Add profile image if selected
      if (profileImage) {
        submitData.append("profile_image", profileImage)
      }

      const response = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Registration failed")
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please login.",
      })

      router.push("/auth/login")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Fill in your information to create a new account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  placeholder="Enter your phone number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  required
                />
                {mobileError && <p className="text-xs text-red-500">{mobileError}</p>}
                <p className="text-xs text-gray-500">Format: +88XXXXXXXXXXX (must start with +88, exactly 14 digits)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Min 8 characters, 1 uppercase, 1 digit, 1 special character</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">User Type</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Select value={formData.division_id} onValueChange={(value) => handleInputChange("division_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(divisions) ? divisions : []).map((division) => (
                      <SelectItem key={division.id} value={division.id.toString()}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select
                  value={formData.district_id}
                  onValueChange={(value) => handleInputChange("district_id", value)}
                  disabled={!formData.division_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(districts) ? districts : []).map((district) => (
                      <SelectItem key={district.id} value={district.id.toString()}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upazila">Upazila</Label>
                <Select
                  value={formData.thana_id}
                  onValueChange={(value) => handleInputChange("thana_id", value)}
                  disabled={!formData.district_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select upazila" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(upazilas) ? upazilas : []).map((upazila) => (
                      <SelectItem key={upazila.id} value={upazila.id.toString()}>
                        {upazila.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Doctor-specific fields */}
          {formData.role === "doctor" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Doctor Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    placeholder="Enter license number"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange("license_number", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_years">Experience (Years)</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    placeholder="Years of experience"
                    value={formData.experience_years}
                    onChange={(e) => handleInputChange("experience_years", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation_fee">Consultation Fee (BDT)</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    placeholder="Consultation fee"
                    value={formData.consultation_fee}
                    onChange={(e) => handleInputChange("consultation_fee", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="e.g., Cardiology, Neurology"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Available Time Slots Multi-Select */}
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTimeSlots.map((slot) => (
                    <label key={slot} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={slot}
                        checked={selectedTimeSlots.includes(slot)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTimeSlots([...selectedTimeSlots, slot])
                          } else {
                            setSelectedTimeSlots(selectedTimeSlots.filter((s) => s !== slot))
                          }
                        }}
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
                <div className="flex mt-2 gap-2 items-end">
                  <div>
                    <Label className="block text-xs">Start</Label>
                    <input
                      type="time"
                      className="border rounded px-2 py-1"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <span className="pb-2">-</span>
                  <div>
                    <Label className="block text-xs">End</Label>
                    <input
                      type="time"
                      className="border rounded px-2 py-1"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                  <Button type="button" onClick={handleAddCustomSlot}>
                    Add
                  </Button>
                </div>
                {slotError && <p className="text-xs text-red-500">{slotError}</p>}
                <p className="text-xs text-gray-500">
                  Select one or more time slots, or add custom using the selectors. Multiple values will be separated by commas.
                </p>
              </div>
            </div>
          )}

          {/* Profile Image */}
          <div className="space-y-2">
            <Label htmlFor="profile_image">Profile Image</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="profile_image"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById("profile_image")?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              {profileImage && <span className="text-sm text-gray-600">{profileImage.name}</span>}
            </div>
            <p className="text-xs text-gray-500">Max 5MB, JPEG/PNG only</p>
          </div>
        </CardContent>

        <div className="px-6 pb-6">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </Card>
  )
}
