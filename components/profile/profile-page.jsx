"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Upload, Loader2, User, Mail, Phone } from "lucide-react"

export function ProfilePage() {
  const { user, token, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [upazilas, setUpazilas] = useState([])

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    mobile: user?.mobile || "",
    division_id: "",
    district_id: "",
    thana_id: "",
    license_number: "",
    experience_years: "",
    consultation_fee: "",
    available_timeslots: "",
    specialization: "",
  })

  useEffect(() => {
    fetchDivisions()
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name,
        mobile: user.mobile,
      }))
    }
  }, [user])

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
      const response = await fetch("http://localhost:8000/api/address/divisions")
      const data = await response.json()
      setDivisions(data)
    } catch (error) {
      console.error("Failed to fetch divisions:", error)
    }
  }

  const fetchDistricts = async (divisionId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/address/districts/${divisionId}`)
      const data = await response.json()
      setDistricts(data)
      setFormData((prev) => ({ ...prev, district_id: "", thana_id: "" }))
    } catch (error) {
      console.error("Failed to fetch districts:", error)
    }
  }

  const fetchUpazilas = async (districtId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/address/upazilas/${districtId}`)
      const data = await response.json()
      setUpazilas(data)
      setFormData((prev) => ({ ...prev, thana_id: "" }))
    } catch (error) {
      console.error("Failed to fetch upazilas:", error)
    }
  }

  const handleInputChange = (name, value) => {
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
    setLoading(true)

    try {
      const submitData = new FormData()

      // Add basic fields
      submitData.append("full_name", formData.full_name)
      submitData.append("mobile", formData.mobile)

      // Add doctor-specific fields if user is a doctor
      if (user?.role === "doctor") {
        if (formData.license_number) submitData.append("license_number", formData.license_number)
        if (formData.experience_years) submitData.append("experience_years", formData.experience_years)
        if (formData.consultation_fee) submitData.append("consultation_fee", formData.consultation_fee)
        if (formData.available_timeslots) submitData.append("available_timeslots", formData.available_timeslots)
        if (formData.specialization) submitData.append("specialization", formData.specialization)
      }

      // Add profile image if selected
      if (profileImage) {
        submitData.append("profile_image", profileImage)
      }

      const response = await fetch("http://localhost:8000/api/v1/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Update failed")
      }

      const updatedUser = await response.json()
      updateUser(updatedUser)

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profile_image || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold">{user.full_name}</h3>
                <p className="text-sm text-gray-600 capitalize">{user.role}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{user.mobile}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
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
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Read-only)</Label>
                  <Input id="email" value={user.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
              </div>

              {/* Doctor-specific fields */}
              {user.role === "doctor" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Professional Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={(e) => handleInputChange("license_number", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Experience (Years)</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        value={formData.experience_years}
                        onChange={(e) => handleInputChange("experience_years", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consultation_fee">Consultation Fee (BDT)</Label>
                      <Input
                        id="consultation_fee"
                        type="number"
                        value={formData.consultation_fee}
                        onChange={(e) => handleInputChange("consultation_fee", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="available_timeslots">Available Time Slots</Label>
                    <Input
                      id="available_timeslots"
                      placeholder="e.g., 09:00-12:00,14:00-17:00"
                      value={formData.available_timeslots}
                      onChange={(e) => handleInputChange("available_timeslots", e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Format: HH:MM-HH:MM,HH:MM-HH:MM (comma-separated)</p>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("profile_image")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose New Image
                  </Button>
                  {profileImage && <span className="text-sm text-gray-600">{profileImage.name}</span>}
                </div>
                <p className="text-xs text-gray-500">Max 5MB, JPEG/PNG only</p>
              </div>
            </CardContent>

            <div className="px-6 pb-6">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
