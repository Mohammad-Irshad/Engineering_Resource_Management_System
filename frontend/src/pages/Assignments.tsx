import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { useToast } from "../components/ui/use-toast"
import { Plus, Search, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

interface Assignment {
  _id: string
  engineerId: {
    _id: string
    name: string
    email: string
    skills: string[]
  }
  projectId: {
    _id: string
    name: string
    description: string
    status: string
  }
  allocationPercentage: number
  startDate: string
  endDate: string
  role: string
}

interface Engineer {
  _id: string
  name: string
  email: string
  skills: string[]
  maxCapacity: number
}

interface Project {
  _id: string
  name: string
  status: string
}

interface AssignmentFormData {
  engineerId: string
  projectId: string
  allocationPercentage: number
  startDate: string
  endDate: string
  role: string
}

const Assignments: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAssignments()
  }, [assignments, searchTerm, projectFilter])

  const fetchData = async () => {
    try {
      const [assignmentsRes, engineersRes, projectsRes] = await Promise.all([
        axios.get("/api/assignments"),
        axios.get("/api/engineers"),
        axios.get("/api/projects"),
      ])

      setAssignments(assignmentsRes.data)
      setEngineers(engineersRes.data)
      setProjects(projectsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAssignments = () => {
    let filtered = assignments

    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.engineerId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.projectId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.role.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (projectFilter !== "all") {
      filtered = filtered.filter((assignment) => assignment.projectId._id === projectFilter)
    }

    setFilteredAssignments(filtered)
  }

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      await axios.post("/api/assignments", {
        ...data,
        allocationPercentage: Number(data.allocationPercentage),
      })

      toast({
        title: "Success",
        description: "Assignment created successfully",
      })

      setIsCreateDialogOpen(false)
      reset()
      fetchData()

      // Force a refresh of the dashboard by navigating to it
      navigate("/manager-dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create assignment",
        variant: "destructive",
      })
    }
  }

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return

    try {
      await axios.delete(`/api/assignments/${assignmentId}`)

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      })

      fetchData()

      // Force a refresh of the dashboard by navigating to it
      navigate("/manager-dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete assignment",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Manage engineer assignments to projects</p>
        </div>
        {user?.role === "manager" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>Assign an engineer to a project</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="engineerId">Engineer</Label>
                    <Select onValueChange={(value) => setValue("engineerId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select engineer" />
                      </SelectTrigger>
                      <SelectContent>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer._id} value={engineer._id}>
                            {engineer.name} ({engineer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="projectId">Project</Label>
                    <Select onValueChange={(value) => setValue("projectId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="allocationPercentage">Allocation Percentage</Label>
                    <Input
                      id="allocationPercentage"
                      type="number"
                      min="1"
                      max="100"
                      {...register("allocationPercentage", {
                        required: "Allocation percentage is required",
                        min: { value: 1, message: "Minimum allocation is 1%" },
                        max: { value: 100, message: "Maximum allocation is 100%" },
                      })}
                      placeholder="Enter allocation percentage"
                    />
                    {errors.allocationPercentage && (
                      <p className="text-sm text-red-600">{errors.allocationPercentage.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      {...register("role", { required: "Role is required" })}
                      placeholder="e.g., Developer, Tech Lead"
                    />
                    {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate", { required: "Start date is required" })}
                    />
                    {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" {...register("endDate", { required: "End date is required" })} />
                    {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Assignment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{assignment.projectId.name}</CardTitle>
                  <CardDescription>{assignment.engineerId.name}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(assignment.projectId.status)}>{assignment.projectId.status}</Badge>
                  {user?.role === "manager" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAssignment(assignment._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Engineer:</span>
                    <p>{assignment.engineerId.name}</p>
                    <p className="text-gray-600">{assignment.engineerId.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>
                    <p>{assignment.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Allocation:</span>
                    <p className="text-lg font-bold text-primary">{assignment.allocationPercentage}%</p>
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p>{format(new Date(assignment.startDate), "MMM dd, yyyy")}</p>
                    <p className="text-gray-600">to {format(new Date(assignment.endDate), "MMM dd, yyyy")}</p>
                  </div>
                </div>

                {assignment.engineerId.skills.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Engineer Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {assignment.engineerId.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {assignment.engineerId.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{assignment.engineerId.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No assignments found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Assignments
