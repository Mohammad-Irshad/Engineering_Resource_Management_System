import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"
import { Calendar, Clock, FolderOpen, User, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { useLocation } from "react-router-dom"
import { Button } from "../components/ui/button"

interface Assignment {
  _id: string
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

interface CapacityData {
  engineer: {
    id: string
    name: string
    maxCapacity: number
  }
  totalAllocated: number
  availableCapacity: number
  activeAssignments: Assignment[]
}

const EngineerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [capacityData, setCapacityData] = useState<CapacityData | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, location])

  const fetchDashboardData = async () => {
    try {
      const [assignmentsRes, capacityRes] = await Promise.all([
        axios.get(`/api/assignments?engineerId=${user?.id}`),
        axios.get(`/api/engineers/${user?.id}/capacity`),
      ])

      setAssignments(assignmentsRes.data)
      setCapacityData(capacityRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
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

  const upcomingAssignments = assignments.filter((assignment) => new Date(assignment.startDate) > new Date())

  const currentAssignments = assignments.filter(
    (assignment) => new Date(assignment.startDate) <= new Date() && new Date(assignment.endDate) >= new Date(),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const utilization = capacityData ? (capacityData.totalAllocated / capacityData.engineer.maxCapacity) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600">Your current assignments and workload</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAssignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Projects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Utilization</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(utilization)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Capacity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capacityData ? capacityData.availableCapacity : 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Workload */}
      {capacityData && (
        <Card>
          <CardHeader>
            <CardTitle>Current Workload</CardTitle>
            <CardDescription>
              Your capacity allocation: {capacityData.totalAllocated}% of {capacityData.engineer.maxCapacity}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={utilization} className="mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Allocated: {capacityData.totalAllocated}%</span>
              <span>Available: {capacityData.availableCapacity}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>Projects you're currently working on</CardDescription>
        </CardHeader>
        <CardContent>
          {currentAssignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No current assignments</p>
          ) : (
            <div className="space-y-4">
              {currentAssignments.map((assignment) => (
                <div key={assignment._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{assignment.projectId.name}</h3>
                    <Badge className={getStatusColor(assignment.projectId.status)}>{assignment.projectId.status}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.projectId.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Role:</span>
                      <p>{assignment.role}</p>
                    </div>
                    <div>
                      <span className="font-medium">Allocation:</span>
                      <p>{assignment.allocationPercentage}%</p>
                    </div>
                    <div>
                      <span className="font-medium">Start Date:</span>
                      <p>{format(new Date(assignment.startDate), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span>
                      <p>{format(new Date(assignment.endDate), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Assignments */}
      {upcomingAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Projects starting soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{assignment.projectId.name}</h3>
                    <Badge className={getStatusColor(assignment.projectId.status)}>{assignment.projectId.status}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.projectId.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Role:</span>
                      <p>{assignment.role}</p>
                    </div>
                    <div>
                      <span className="font-medium">Allocation:</span>
                      <p>{assignment.allocationPercentage}%</p>
                    </div>
                    <div>
                      <span className="font-medium">Start Date:</span>
                      <p>{format(new Date(assignment.startDate), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span>
                      <p>{format(new Date(assignment.endDate), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EngineerDashboard
