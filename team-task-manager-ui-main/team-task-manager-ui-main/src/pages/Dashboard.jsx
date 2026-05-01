import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, FolderPlus, PlusCircle, LayoutDashboard, CheckCircle2, Clock, Circle, User2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [activeTaskForm, setActiveTaskForm] = useState(null);
  const [taskData, setTaskData] = useState({ title: '', assigned_to_id: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'Admin';
  const currentUserId = parseInt(localStorage.getItem('user_id'));

  useEffect(() => {
    fetchData();
    if (isAdmin) fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/dashboard');
      setStats(statsRes.data);
      const projectsRes = await api.get('/projects');
      setProjects(projectsRes.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle) return;
    try {
      await api.post('/projects', { title: newProjectTitle });
      setNewProjectTitle('');
      fetchData();
    } catch (err) {
      alert('Failed to create project');
    }
  };

  const handleCreateTask = async (projectId) => {
    if (!taskData.title || !taskData.assigned_to_id) return alert('Fill all fields');
    try {
      await api.post(`/tasks?project_id=${projectId}&assigned_to_id=${taskData.assigned_to_id}`, {
        title: taskData.title
      });
      setTaskData({ title: '', assigned_to_id: '' });
      setActiveTaskForm(null);
      fetchData();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- UI Components ---
  const StatCard = ({ icon, label, value, color }) => (
    <div className={`flex items-center gap-4 p-4 rounded-xl shadow bg-white border-l-8 ${color}`}>
      <div>{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );

  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg flex items-center gap-2"><FolderPlus className="text-blue-500" size={20} />{project.title}</div>
        {isAdmin && (
          <button className="text-xs text-blue-600 hover:underline" onClick={() => setActiveTaskForm(project.id)}>+ Task</button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {project.tasks && project.tasks.length > 0 ? project.tasks.map(task => (
          <div key={task.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm">
            {task.status === 'Done' ? <CheckCircle2 className="text-green-500" size={16} /> : task.status === 'In Progress' ? <Clock className="text-yellow-500" size={16} /> : <Circle className="text-gray-400" size={16} />}
            <span>{task.title}</span>
            <span className="ml-2 text-xs text-gray-400">{users.find(u => u.id === task.assigned_to_id)?.email || 'User'}</span>
          </div>
        )) : <span className="text-gray-400 text-xs">No tasks yet</span>}
      </div>
      {activeTaskForm === project.id && isAdmin && (
        <form className="mt-3 flex flex-col gap-2 bg-gray-50 p-3 rounded" onSubmit={e => { e.preventDefault(); handleCreateTask(project.id); }}>
          <input type="text" className="p-2 border rounded" placeholder="Task title" value={taskData.title} onChange={e => setTaskData({ ...taskData, title: e.target.value })} />
          <select className="p-2 border rounded" value={taskData.assigned_to_id} onChange={e => setTaskData({ ...taskData, assigned_to_id: e.target.value })}>
            <option value="">Assign to</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Add</button>
            <button type="button" className="bg-gray-300 px-4 py-1 rounded" onClick={() => setActiveTaskForm(null)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'} bg-white shadow-xl flex flex-col items-center py-8 relative`}>
        <button className="absolute top-4 right-4 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span className="text-2xl">{sidebarOpen ? '←' : '→'}</span>
        </button>
        <div className="flex flex-col items-center gap-6 w-full">
          <LayoutDashboard size={32} className="text-blue-600" />
          <div className="font-bold text-xl text-blue-700">TaskPro</div>
          <div className="mt-8 flex flex-col gap-4 w-full">
            <button className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-50 w-full text-left"><User2 /> {role}</button>
            <button className="flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-50 w-full text-left" onClick={handleLogout}><LogOut /> Logout</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {role}!</h1>
            <p className="text-gray-500">Manage your projects and tasks efficiently.</p>
          </div>
          {isAdmin && (
            <form className="flex gap-2" onSubmit={handleCreateProject}>
              <input type="text" className="p-2 border rounded-l-md" placeholder="New project title" value={newProjectTitle} onChange={e => setNewProjectTitle(e.target.value)} />
              <button type="submit" className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700">Create Project</button>
            </form>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<LayoutDashboard size={28} className="text-blue-500" />} label="Total Tasks" value={stats.total_tasks} color="border-blue-500" />
            <StatCard icon={<Circle size={28} className="text-gray-400" />} label="To Do" value={stats.todo} color="border-gray-400" />
            <StatCard icon={<Clock size={28} className="text-yellow-500" />} label="In Progress" value={stats.in_progress} color="border-yellow-500" />
            <StatCard icon={<CheckCircle2 size={28} className="text-green-500" />} label="Done" value={stats.done} color="border-green-500" />
          </div>
        )}

        {/* Projects */}
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      </main>
    </div>
  );
}
        title: taskData.title,
        status: "To Do"
      });
      setActiveTaskForm(null);
      setTaskData({ title: '', assigned_to_id: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}?status=${newStatus}`);
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const StatusIcon = ({ status }) => {
    if (status === 'Done') return <CheckCircle2 size={16} className="text-green-500" />;
    if (status === 'In Progress') return <Clock size={16} className="text-yellow-500" />;
    return <Circle size={16} className="text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Team Task Manager</h1>
          <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {role}
          </span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Tasks</h3>
            <p className="text-3xl font-bold text-gray-800">{stats?.total_tasks || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">To Do / Doing</h3>
            <p className="text-3xl font-bold text-gray-800">{(stats?.todo || 0) + (stats?.in_progress || 0)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Done</h3>
            <p className="text-3xl font-bold text-gray-800">{stats?.done || 0}</p>
          </div>

          {isAdmin && (
            <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FolderPlus size={18} /> New Project
              </h3>
              <form onSubmit={handleCreateProject}>
                <input type="text" placeholder="Project Title..." className="w-full p-2 border border-gray-300 rounded-md mb-3 text-sm" value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md text-sm hover:bg-blue-700 transition">Create</button>
              </form>
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Active Projects</h2>
            
            {projects.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">No projects found. {isAdmin && 'Create one on the left!'}</p>
            ) : (
              <div className="space-y-6">
                {projects.map(project => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-700">{project.title}</h3>
                      {isAdmin && (
                        <button onClick={() => setActiveTaskForm(activeTaskForm === project.id ? null : project.id)} className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">
                          <PlusCircle size={16} /> Add Task
                        </button>
                      )}
                    </div>

                    {activeTaskForm === project.id && isAdmin && (
                      <div className="mb-4 p-3 bg-white border border-blue-200 rounded-md flex gap-2">
                        <input type="text" placeholder="Task Title..." className="flex-1 p-1 border rounded text-sm" value={taskData.title} onChange={(e) => setTaskData({...taskData, title: e.target.value})} />
                        <select className="p-1 border rounded text-sm bg-white" value={taskData.assigned_to_id} onChange={(e) => setTaskData({...taskData, assigned_to_id: e.target.value})}>
                          <option value="">Assign To...</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.email} ({u.role})</option>
                          ))}
                        </select>
                        <button onClick={() => handleCreateTask(project.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
                      </div>
                    )}
                    
                    <div className="space-y-2 mt-4">
                      {project.tasks.length === 0 && <p className="text-sm text-gray-500 italic">No tasks assigned yet.</p>}
                      
                      {project.tasks.map(task => (
                        <div key={task.id} className="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <StatusIcon status={task.status} />
                            <span className={`font-medium ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {task.title}
                            </span>
                          </div>

                          {(isAdmin || task.assigned_to_id === currentUserId) ? (
                            <select className="text-sm border-gray-300 rounded bg-gray-50 text-gray-600 p-1 cursor-pointer" value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)}>
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          ) : (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{task.status}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}