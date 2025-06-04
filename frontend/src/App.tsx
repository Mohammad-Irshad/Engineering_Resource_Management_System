import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import ManagerDashboard from "./pages/ManagerDashboard"
import EngineerDashboard from "./pages/EngineerDashboard"
import Projects from "./pages/Projects"
import Engineers from "./pages/Engineers"
import Assignments from "./pages/Assignments"
import Profile from "./pages/Profile"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            user.role === "manager" ? <Navigate to="/manager-dashboard" /> : <Navigate to="/engineer-dashboard" />
          }
        />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/engineer-dashboard" element={<EngineerDashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/engineers" element={<Engineers />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  )
}

export default App
