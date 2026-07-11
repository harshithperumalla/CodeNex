import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

export type UserRole = "student" | "mentor" | "admin";

export interface UserProfile {
  userId: string;
  fullName: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  streak: number;
  points: number;
  joinDate: string;
  avatar?: string;
  rank: number;
  codingSolved: number;
  aptitudeCompleted: number;
  coursesWatched: number;
  typingTests: number;
  badgesEarned: string[];
  completedDates?: string[];
  rankImprovements: number;
  college: string;
  degree: string;
  yearOfStudy: string;
  skills: string[];
  interests: string[];
  hobbies: string;
  location: string;
  about: string;
  github: string;
  linkedin: string;
  portfolio: string;
  profileImageUrl?: string;
}

const emptyUser: UserProfile = {
  userId: "",
  fullName: "",
  name: "",
  email: "",
  phone: "",
  role: "student",
  streak: 0,
  points: 0,
  joinDate: "",
  rank: 0,
  codingSolved: 0,
  aptitudeCompleted: 0,
  coursesWatched: 0,
  typingTests: 0,
  badgesEarned: [],
  completedDates: [],
  rankImprovements: 0,
  college: "",
  degree: "",
  yearOfStudy: "",
  skills: [],
  interests: [],
  hobbies: "",
  location: "",
  about: "",
  github: "",
  linkedin: "",
  portfolio: "",
};

interface UserContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  login: (email: string, password: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const savedUser = localStorage.getItem("user");

  const [user, setUser] = useState<UserProfile>(
    savedUser ? JSON.parse(savedUser) : emptyUser
  );

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.user);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error("Error fetching current user:", err);
          logout();
        }
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setIsAuthenticated(false);

    window.location.href = "/login";
  };

  const login = (email: string, _password: string) => {
    setIsAuthenticated(true);

    setUser((prev) => ({
      ...prev,
      email,
    }));

    return true;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        login,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
};