import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/gameService';

interface LoginScreenProps {
    onLoginSuccess: (user: any) => void;
    onRegisterSuccess: (user: any) => void;
    onShowLeaderboard: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onRegisterSuccess, onShowLeaderboard }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = () => {
        setError('');
        setSuccess('');
        if (!username.trim() || !password.trim()) {
            setError('Username and password cannot be empty.');
            return;
        }

        if (isRegistering) {
            const result = registerUser(username, password);
            if (result.success && result.user) {
                setSuccess(result.message);
                setTimeout(() => onRegisterSuccess(result.user!), 1000);
            } else {
                setError(result.message);
            }
        } else {
            const result = loginUser(username, password);
            if (result.success && result.user) {
                setSuccess(result.message);
                setTimeout(() => onLoginSuccess(result.user!), 1000);
            } else {
                setError(result.message);
            }
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="flex flex-col items-center p-4 animate-fadeIn">
            <h2 className="text-2xl text-green-400 mb-4">{isRegistering ? 'Register Account' : 'Enter the Dungeon'}</h2>
            <div className="w-full max-w-xs space-y-4">
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter Your Name"
                    onKeyPress={handleKeyPress}
                    className="bg-gray-800 border border-green-600 text-white text-center p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter Your Password"
                    onKeyPress={handleKeyPress}
                    className="bg-gray-800 border border-green-600 text-white text-center p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {success && <p className="text-green-400 text-sm text-center">{success}</p>}
                
                <button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200">
                    {isRegistering ? 'Register' : 'Login'}
                </button>
                <button onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }} className="w-full text-center text-sm text-gray-400 hover:text-white">
                    {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                </button>
            </div>
            <button onClick={onShowLeaderboard} className="mt-6 text-gray-400 hover:text-white">View Hall of Fame</button>
        </div>
    );
};

export default LoginScreen;