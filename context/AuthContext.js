import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData] = useState({
    nim_mhs: "0920240027",
    nama: "Gumelar Akhirul Ramadhan",
  });

  return (
    <AuthContext.Provider value={{ userData }}>
      {children}
    </AuthContext.Provider>
  );
};