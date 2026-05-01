import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-400 via-blue-400 to-purple-300 animate-gradient-x">
      <div className="w-full max-w-md bg-white/90 p-10 rounded-3xl shadow-2xl border border-green-100 animate-fade-in">
        <div className="flex justify-center mb-6">
          <UserPlus size={48} className="text-green-600 drop-shadow-lg animate-bounce" />
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-6 text-green-700 tracking-tight">Create an Account</h2>
        <p className="text-center text-gray-500 mb-6">Sign up for your Team Task Manager account</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-green-700">Email</label>
            <input type="email" required className="mt-1 block w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700">Password</label>
            <input type="password" required className="mt-1 block w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg">Sign Up</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}