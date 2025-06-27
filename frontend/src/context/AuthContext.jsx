import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for a logged-in user on initial load
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await axios.post("/api/auth/login", {
        username,
        password,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      // Re-throw the error to be caught by the component
      throw error.response?.data?.message || error.message;
    }
  };

  const register = async (username, password, role = "student") => {
    try {
      const { data } = await axios.post("/api/auth/register", {
        username,
        password,
        role,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;