import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import GraphPage from "./views/GraphPage";
import RegisterPage from "./views/RegisterPage";
import LoginPage from "./views/LoginPage";
import ErrorPage from "./views/ErrorPage";

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
      const isDarkMode = localStorage.getItem('darkMode') === '1';
      setDarkMode(isDarkMode);
      document.body.classList.toggle('dark-mode', isDarkMode);
  }, []);

  const toggleDarkMode = () =>  {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      localStorage.setItem('darkMode', (+newDarkMode).toString());
      document.body.classList.toggle('dark-mode', newDarkMode);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GraphPage
              setAuthenticated={setAuthenticated}
              authenticated={authenticated}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              setAuthenticated={setAuthenticated}
              authenticated={authenticated}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              setAuthenticated={setAuthenticated}
              authenticated={authenticated}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
