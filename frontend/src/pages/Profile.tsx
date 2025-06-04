
import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { useToast } from "../components/ui/use-toast"
import { User, Mail, Briefcase, Clock } from "lucide-react"
import { useForm } from "react-hook-form"

interface ProfileFormData {
  skills: string
  seniority: "junior" | "mid" | "senior"
  maxCapacity: number
}

interface UserProfile {
  _id: string
  email: string
  name: string
  role: "engineer" | "manager"
  skills: string[]
  seniority: "junior" | "mid" | "senior"
  maxCapacity: number
  department: string
}

const Profile: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/auth/profile")
      setProfile(response.data)

      // Set form values
      setValue("skills", response.data.skills?.join(", ") || "")
      setValue("seniority", response.data.seniority || "junior")
      setValue("maxCapacity", response.data.maxCapacity || 100)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return

    setUpdating(true)
    try {
      const updateData = {
        skills: data.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
        seniority: data.seniority,
        maxCapacity: Number(data.maxCapacity),
      }

      await axios.put(`/api/engineers/${profile._id}`, updateData)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      fetchProfile()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              <p className="text-gray-600 capitalize">{profile.role}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {profile.email}
              </div>

              <div className="flex items-center text-sm">
                <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                {profile.department}
              </div>

              {profile.role === "engineer" && (
                <>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.maxCapacity === 100 ? "Full-time" : "Part-time"} ({profile.maxCapacity}%)
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Seniority Level:</p>
                    <Badge
                      className={
                        profile.seniority === "senior"
                          ? "bg-purple-100 text-purple-800"
                          : profile.seniority === "mid"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      {profile.seniority}
                    </Badge>
                  </div>

                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        {profile.role === "engineer" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your skills, seniority level, and capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    {...register("skills")}
                    placeholder="React, Node.js, TypeScript, Python (comma separated)"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter your skills separated by commas</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seniority">Seniority Level</Label>
                    <Select
                      value={watch("seniority")}
                      onValueChange={(value: "junior" | "mid" | "senior") => setValue("seniority", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select seniority level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxCapacity">Max Capacity (%)</Label>
                    <Select
                      value={watch("maxCapacity")?.toString()}
                      onValueChange={(value) => setValue("maxCapacity", Number(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">Part-time (50%)</SelectItem>
                        <SelectItem value="100">Full-time (100%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updating}>
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Manager Info */}
        {profile.role === "manager" && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Manager Information</CardTitle>
              <CardDescription>Your manager profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Role</Label>
                  <p className="text-lg font-medium capitalize">{profile.role}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="text-lg font-medium">{profile.department}</p>
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Create and manage projects</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Assign engineers to projects</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">View team capacity and analytics</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Manage assignments</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Profile
