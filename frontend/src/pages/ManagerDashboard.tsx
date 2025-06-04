import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"
import { Users, FolderOpen, Calendar, TrendingUp, RefreshCw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "../components/ui/button"

interface Engineer {
  _id: string
  name: string
  skills: string[]
  maxCapacity: number
}

interface CapacityData {
  engineer: {
    id: string
    name: string
    maxCapacity: number
  }
  totalAllocated: number
  availableCapacity: number
}

interface Project {
  _id: string
  name: string
  status: string
  teamSize: number
}

const ManagerDashboard: React.FC = () => {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [capacityData, setCapacityData] = useState<CapacityData[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    fetchDashboardData()
  }, [location])

  const fetchDashboardData = async () => {
    try {
      const [engineersRes, projectsRes] = await Promise.all([axios.get("/api/engineers"), axios.get("/api/projects")])

      setEngineers(engineersRes.data)
      setProjects(projectsRes.data)

      // Fetch capacity data for each engineer
      const capacityPromises = engineersRes.data.map((engineer: Engineer) =>
        axios.get(`/api/engineers/${engineer._id}/capacity`),
      )
      const capacityResponses = await Promise.all(capacityPromises)
      setCapacityData(capacityResponses.map((res) => res.data))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600"
    if (utilization >= 70) return "text-yellow-600"
    return "text-green-600"
  }

  const chartData = capacityData.map((data) => ({
    name: data.engineer.name,
    allocated: data.totalAllocated,
    available: data.availableCapacity,
    utilization: (data.totalAllocated / data.engineer.maxCapacity) * 100,
  }))

  const refreshData = () => {
    setLoading(true)
    fetchDashboardData()
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
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600">Overview of team capacity and project status</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engineers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "active").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planning Projects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "planning").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {capacityData.length > 0
                ? Math.round(
                    capacityData.reduce(
                      (sum, data) => sum + (data.totalAllocated / data.engineer.maxCapacity) * 100,
                      0,
                    ) / capacityData.length,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Team Capacity Overview</CardTitle>
          <CardDescription>Current allocation and availability of engineers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capacityData.map((data) => {
              const utilization = (data.totalAllocated / data.engineer.maxCapacity) * 100
              return (
                <div key={data.engineer.id} className="flex items-center space-x-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{data.engineer.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
                          {Math.round(utilization)}%
                        </span>
                        <Badge
                          variant={utilization >= 90 ? "destructive" : utilization >= 70 ? "default" : "secondary"}
                        >
                          {data.totalAllocated}% / {data.engineer.maxCapacity}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={utilization} className="mt-2" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Utilization Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Team Utilization Chart</CardTitle>
          <CardDescription>Visual representation of team capacity allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="allocated" fill="#3b82f6" name="Allocated %" />
              <Bar dataKey="available" fill="#10b981" name="Available %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default ManagerDashboard
