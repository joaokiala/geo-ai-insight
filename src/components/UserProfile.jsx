import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, ChevronDown, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [logoutError, setLogoutError] = useState('');

    const handleLogout = async () => {
        try {
            setLogoutError('');
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setLogoutError('Failed to logout. Please try again.');
            // Still navigate to login page even if logout fails on the server
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } finally {
            setIsOpen(false);
        }
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-white/10 z-20 overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            {user.company && (
                                <p className="text-xs text-gray-500 mt-1">{user.company}</p>
                            )}
                            <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-600/20 text-blue-400 rounded">
                                    {user.role || 'User'}
                                </span>
                            </div>
                        </div>

                        {logoutError && (
                            <div className="px-4 py-2 bg-red-500/20 border-b border-red-500/30 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span className="text-xs text-red-200">{logoutError}</span>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition text-red-400 hover:text-red-300"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserProfile;