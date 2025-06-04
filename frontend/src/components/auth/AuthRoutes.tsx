// src/components/auth/AuthRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "../../utils/authToken";
import Login from "./Login";
import Register from "./Register";
import App from "../../App";

const AuthRoutes: React.FC = () => {
  const isLoggedIn = Boolean(getToken());

  return (
    <Routes>
      {/* if user hits “/”, send them to either /app or /login */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/app" /> : <Navigate to="/login" />}
      />

      {/* /app is protected; only show <App /> if logged in */}
      <Route
        path="/app"
        element={isLoggedIn ? <App /> : <Navigate to="/login" />}
      />

      {/* /login only if ‍not logged in; otherwise bounce to /app */}
      <Route
        path="/login"
        element={!isLoggedIn ? <Login /> : <Navigate to="/app" />}
      />

      {/* /register only if ‍not logged in; otherwise bounce to /app */}
      <Route
        path="/register"
        element={!isLoggedIn ? <Register /> : <Navigate to="/app" />}
      />

      {/* catch-all → redirect back to “/” */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AuthRoutes;
