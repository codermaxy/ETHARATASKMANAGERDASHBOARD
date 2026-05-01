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

  // ✅ FIXED FUNCTION (yahi important hai)
  const handleCreateTask = async (projectId) => {
    if (!taskData.title || !taskData.assigned_to_id) return alert('Fill all fields');
    try {
      await api.post(`/tasks?project_id=${projectId}&assigned_to_id=${taskData.assigned_to_id}`, {
        title: taskData.title,
        status: "To Do"
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

  const StatusIcon = ({ status }) => {
    if (status === 'Done') return <CheckCircle2 size={16} className="text-green-500" />;
    if (status === 'In Progress') return <Clock size={16} className="text-yellow-500" />;
    return <Circle size={16} className="text-gray-400" />;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
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

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-lg flex items-center gap-2"><FolderPlus className="text-blue-500" size={20} />{project.title}</div>
                {isAdmin && (
                  <button className="text-xs text-blue-600 hover:underline" onClick={() => setActiveTaskForm(project.id)}>+ Task</button>
                )}
              </div>

              {activeTaskForm === project.id && isAdmin && (
                <div className="mt-3 flex flex-col gap-2 bg-gray-50 p-3 rounded">
                  <input type="text" className="p-2 border rounded" placeholder="Task title" value={taskData.title} onChange={e => setTaskData({ ...taskData, title: e.target.value })} />
                  <select className="p-2 border rounded" value={taskData.assigned_to_id} onChange={e => setTaskData({ ...taskData, assigned_to_id: e.target.value })}>
                    <option value="">Assign to</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                  </select>
                  <button onClick={() => handleCreateTask(project.id)} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Add</button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {project.tasks?.map(task => (
                  <div key={task.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm">
                    <StatusIcon status={task.status} />
                    <span>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}