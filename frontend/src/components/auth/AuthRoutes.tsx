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
      {/* Landing redirect: if logged in → /app, otherwise → /login */}
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Protected “/app” route */}
      <Route
        path="/app"
        element={isLoggedIn ? <App /> : <Navigate to="/login" replace />}
      />

      {/* Public “/login” */}
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/app" replace /> : <Login />}
      />

      {/* Public “/register” */}
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/app" replace /> : <Register />}
      />

      {/* Catch‐all: redirect anything else back to “/” */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AuthRoutes;
