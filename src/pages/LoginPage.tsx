import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const success = await login(username, password);

        setIsLoading(false);

        if (success) {
            navigate('/home');
        } else {
            setError('Invalid username or password');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7fafc] px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 sm:p-10 space-y-8 border border-gray-200">
                <div className="flex justify-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src="/logo.jpeg"
                            alt="TROI Logo"
                            className="h-12 w-12 rounded-xl"
                        />
                        <span className="text-2xl font-bold text-[#0a192f]">TROI Backoffice</span>
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-[#0a192f]">Welcome Back</h1>
                    <p className="mt-2 text-sm text-gray-500">Sign in to access your account</p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-800 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff6908] focus:border-[#ff6908] transition duration-200"
                            placeholder="username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                            Password
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff6908] focus:border-[#ff6908] transition duration-200"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 font-semibold rounded-lg shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6908] ${
                            isLoading
                                ? 'bg-[#ff6908]/60 cursor-not-allowed text-white'
                                : 'bg-[#ff6908] hover:bg-[#e85f06] text-white'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="flex justify-between text-xs text-gray-400">
                    <div>© 2025 Trust Offshore International LTD.</div>
                    <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
