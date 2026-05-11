import React, { createContext, useContext, useState, useEffect } from 'react';

// This context shares login info across the whole app
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user was already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.warn('Invalid saved user data in localStorage, clearing it.', error);
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  // Login function
  function login(userData, userToken) {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // Logout function
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth anywhere
export function useAuth() {
  return useContext(AuthContext);
}
