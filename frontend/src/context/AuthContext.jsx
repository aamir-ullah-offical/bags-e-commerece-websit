import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [user, setUser] = useState(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const storedUser = authService.getStoredUser();
 const token = authService.getToken();

 if (token && storedUser) {
 setUser(storedUser);
 setIsAuthenticated(true);
 // Verify token is still valid by fetching profile
 authService
 .getProfile()
 .then(({ user: freshUser }) => {
 setUser(freshUser);
 localStorage.setItem("msac_user", JSON.stringify(freshUser));
 })
 .catch(() => {
 // Token invalid — clear session
 localStorage.removeItem("msac_token");
 localStorage.removeItem("msac_user");
 setUser(null);
 setIsAuthenticated(false);
 })
 .finally(() => setIsLoading(false));
 } else {
 setIsLoading(false);
 }
 }, []);

 const login = async (email, password) => {
 setIsLoading(true);
 try {
 const data = await authService.login(email, password);
 setUser(data.user);
 setIsAuthenticated(true);
 return data.user;
 } finally {
 setIsLoading(false);
 }
 };

 const authenticate = (userData) => {
 setUser(userData);
 setIsAuthenticated(true);
 };

 const logout = async () => {
 await authService.logout();
 setIsAuthenticated(false);
 setUser(null);
 };

 const updateUser = (updatedUser) => {
 setUser(updatedUser);
 localStorage.setItem("msac_user", JSON.stringify(updatedUser));
 };

 return (
 <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, authenticate, isLoading }}>
 {children}
 </AuthContext.Provider>
 );
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
 return ctx;
}
