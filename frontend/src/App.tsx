import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import GraphPage from "./views/GraphPage";
import RegisterPage from "./views/RegisterPage";
import LoginPage from "./views/LoginPage";
import ErrorPage from "./views/ErrorPage";

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(true);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <GraphPage
              setAuthenticated={setAuthenticated}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              setAuthenticated={setAuthenticated}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              setAuthenticated={setAuthenticated}
              authenticated={authenticated}
            />
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}
