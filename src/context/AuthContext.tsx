import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
    });

    const login = (email: string) => {
        // Mock login logic
        const user: User = {
            id: '1',
            email,
            name: email.split('@')[0],
        };
        setAuth({ user, isAuthenticated: true });
    };

    const logout = () => {
        setAuth({ user: null, isAuthenticated: false });
    };

    return (
        <AuthContext.Provider value={{ ...auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
