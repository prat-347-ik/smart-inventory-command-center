import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Best practice for interview code
import { operationalApi } from '../api/operational.api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // 1. Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      const data = await operationalApi.login(email, password);
      
      // Assume backend returns: { token: "JwtString", user: { ... } }
      // Note: If your current backend code is missing the login route, 
      // this will 404 until you add the endpoint to Service A.
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return true;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Optional: Window reload to clear any memory states
    // window.location.href = '/login'; 
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};