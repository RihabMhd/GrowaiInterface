import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");

  // Determine role. If backend doesn't send it yet, default to "manager" for demo purposes.
  const role = user?.role || "manager"; 

  // Mock data for the agency management dashboard
  const stats = {
    employees: 24,
    activeProjects: 12,
    pendingTasks: 48,
    revenue: "$124,500"
  };

  const recentTasks = [
    { id: 1, title: "Design new landing page", assignee: "Sarah J.", status: "In Progress", priority: "High" },
    { id: 2, title: "Backend API integration", assignee: "Mike T.", status: "Pending", priority: "Medium" },
    { id: 3, title: "Client feedback review", assignee: "Emma W.", status: "Completed", priority: "High" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      {/* Navbar */}
      <nav className="glass-panel rounded-none border-x-0 border-t-0 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            A
          </div>
          <h1 className="text-xl font-bold tracking-wider">AGENCY<span className="text-primary">OS</span></h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">{user?.name || "Welcome"}</p>
            <p className="text-xs text-primary uppercase tracking-wider">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-primary/50">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" />
          </div>
          <button onClick={logout} className="btn-outline text-sm py-2 px-4 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-gray-400">Here's what's happening at your agency today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in delay-100">
          <div className="glass-panel p-6 hover:border-primary/50 transition-colors cursor-pointer group">
            <h3 className="text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-300">Total Employees</h3>
            <p className="text-3xl font-bold">{stats.employees}</p>
          </div>
          <div className="glass-panel p-6 hover:border-primary/50 transition-colors cursor-pointer group">
            <h3 className="text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-300">Active Projects</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.activeProjects}</p>
          </div>
          <div className="glass-panel p-6 hover:border-primary/50 transition-colors cursor-pointer group">
            <h3 className="text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-300">Pending Tasks</h3>
            <p className="text-3xl font-bold text-yellow-400">{stats.pendingTasks}</p>
          </div>
          {role === "admin" || role === "manager" ? (
            <div className="glass-panel p-6 hover:border-primary/50 transition-colors cursor-pointer group">
              <h3 className="text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-300">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-green-400">{stats.revenue}</p>
            </div>
          ) : (
            <div className="glass-panel p-6 hover:border-primary/50 transition-colors cursor-pointer group">
              <h3 className="text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-300">My Efficiency</h3>
              <p className="text-3xl font-bold text-green-400">94%</p>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in delay-200">
          
          {/* Main Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Recent Tasks</h3>
                <button className="text-sm text-primary hover:text-primary-hover">View All</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-3 text-sm font-medium text-gray-400">Task Name</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Assignee</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
                      <th className="pb-3 text-sm font-medium text-gray-400">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map(task => (
                      <tr key={task.id} className="border-b border-gray-700/50 hover:bg-white/5 transition-colors">
                        <td className="py-4 text-sm font-medium">{task.title}</td>
                        <td className="py-4 text-sm text-gray-300">{task.assignee}</td>
                        <td className="py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm">
                          <span className={`flex items-center gap-1 ${task.priority === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                            {task.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar - Projects */}
          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h3 className="text-xl font-bold mb-6">Active Projects</h3>
              <div className="space-y-4">
                {[
                  { name: "Acme Corp Rebrand", progress: 75, color: "bg-blue-500" },
                  { name: "TechNova App Dev", progress: 30, color: "bg-purple-500" },
                  { name: "Global Marketing", progress: 90, color: "bg-green-500" }
                ].map((project, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{project.name}</span>
                      <span className="text-gray-400">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className={`${project.color} h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 btn-outline text-sm py-2">
                New Project
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}