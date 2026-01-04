import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        // Simple mock validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        login(email);
        navigate('/');
    };

    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Recruiter Login</h2>
                    <p className="text-slate-500 mt-2 text-sm">Access the Decision Support System</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="recruiter@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <LogIn size={20} />
                        Sign In
                    </button>
                </form>
            </div>
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                    Restricted access for authorized personnel only.
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
