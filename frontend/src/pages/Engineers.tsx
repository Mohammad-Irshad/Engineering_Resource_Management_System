import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Progress } from "../components/ui/progress"
import { Search, User, Clock } from "lucide-react"
import { useToast } from "../components/ui/use-toast"

interface Engineer {
  _id: string
  name: string
  email: string
  skills: string[]
  seniority: "junior" | "mid" | "senior"
  maxCapacity: number
  department: string
}

interface CapacityData {
  engineer: {
    id: string
    name: string
    maxCapacity: number
  }
  totalAllocated: number
  availableCapacity: number
  activeAssignments: any[]
}

const Engineers: React.FC = () => {
  const { toast } = useToast()
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [capacityData, setCapacityData] = useState<{ [key: string]: CapacityData }>({})
  const [filteredEngineers, setFilteredEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchEngineers()
  }, [])

  useEffect(() => {
    filterEngineers()
  }, [engineers, searchTerm])

  const fetchEngineers = async () => {
    try {
      const response = await axios.get("/api/engineers")
      setEngineers(response.data)

      // Fetch capacity data for each engineer
      const capacityPromises = response.data.map((engineer: Engineer) =>
        axios.get(`/api/engineers/${engineer._id}/capacity`),
      )
      const capacityResponses = await Promise.all(capacityPromises)

      const capacityMap: { [key: string]: CapacityData } = {}
      capacityResponses.forEach((res, index) => {
        capacityMap[response.data[index]._id] = res.data
      })
      setCapacityData(capacityMap)
    } catch (error) {
      console.error("Error fetching engineers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch engineers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterEngineers = () => {
    let filtered = engineers

    if (searchTerm) {
      filtered = filtered.filter(
        (engineer) =>
          engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engineer.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
          engineer.seniority.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredEngineers(filtered)
  }

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case "senior":
        return "bg-purple-100 text-purple-800"
      case "mid":
        return "bg-blue-100 text-blue-800"
      case "junior":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600"
    if (utilization >= 70) return "text-yellow-600"
    return "text-green-600"
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Engineers</h1>
        <p className="text-gray-600">View and manage engineering team members</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search engineers by name, email, skills, or seniority..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Engineers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEngineers.map((engineer) => {
          const capacity = capacityData[engineer._id]
          const utilization = capacity ? (capacity.totalAllocated / capacity.engineer.maxCapacity) * 100 : 0

          return (
            <Card key={engineer._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{engineer.name}</CardTitle>
                      <CardDescription>{engineer.email}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getSeniorityColor(engineer.seniority)}>{engineer.seniority}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Capacity */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Capacity</span>
                      <span className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
                        {Math.round(utilization)}%
                      </span>
                    </div>
                    <Progress value={utilization} className="mb-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Allocated: {capacity?.totalAllocated || 0}%</span>
                      <span>Available: {capacity?.availableCapacity || engineer.maxCapacity}%</span>
                    </div>
                  </div>

                  {/* Employment Type */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {engineer.maxCapacity === 100 ? "Full-time" : "Part-time"} ({engineer.maxCapacity}%)
                  </div>

                  {/* Skills */}
                  {engineer.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {engineer.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Projects */}
                  {capacity && capacity.activeAssignments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Active Projects ({capacity.activeAssignments.length}):
                      </p>
                      <div className="space-y-1">
                        {capacity.activeAssignments.slice(0, 2).map((assignment: any, index: number) => (
                          <div key={index} className="text-xs text-gray-600">
                            • {assignment.projectId.name} ({assignment.allocationPercentage}%)
                          </div>
                        ))}
                        {capacity.activeAssignments.length > 2 && (
                          <div className="text-xs text-gray-500">+{capacity.activeAssignments.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Department */}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Department: {engineer.department}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredEngineers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No engineers found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Engineers
