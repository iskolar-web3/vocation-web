import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '../types';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  avatar: string;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('iskolar_vocation_role');
    return (saved as Role) || 'student';
  });

  useEffect(() => {
    localStorage.setItem('iskolar_vocation_role', role);
  }, [role]);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
  };

  const login = (newRole: Role) => {
    setRoleState(newRole);
  };

  const logout = () => {
    setRoleState('visitor');
  };

  const isAuthenticated = role !== 'visitor';

  const getUserDetails = () => {
    switch (role) {
      case 'student':
        return {
          userName: 'Clarisse Salazar',
          userEmail: 'clarisse.salazar@iskolar.edu.ph',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        };
      case 'coach':
        return {
          userName: 'Engr. Paolo Ramos',
          userEmail: 'paolo.ramos@grab.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        };
      case 'employer':
        return {
          userName: 'Maya Talent Team',
          userEmail: 'talent@maya.ph',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        };
      case 'admin':
        return {
          userName: 'Platform Moderator',
          userEmail: 'admin@iskolar.io',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        };
      default:
        return {
          userName: 'Guest Visitor',
          userEmail: '',
          avatar: '',
        };
    }
  };

  const { userName, userEmail, avatar } = getUserDetails();

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        isAuthenticated,
        userName,
        userEmail,
        avatar,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
