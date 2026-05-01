import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { LogIn } from 'lucide-react';
import logo from '../assets/hero.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('user_id', res.data.user_id);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-300 animate-gradient-x">
      <div className="w-full max-w-md bg-white/90 p-10 rounded-3xl shadow-2xl border border-blue-100 animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-16 h-16 mb-2 rounded-full shadow-lg animate-bounce" />
          <LogIn size={36} className="text-blue-600 drop-shadow-lg animate-fade-in" />
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-6 text-blue-700 tracking-tight">Log in to Task Manager</h2>
        {error && <p className="text-red-500 text-center mb-4 animate-fade-in">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg">Log In</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}