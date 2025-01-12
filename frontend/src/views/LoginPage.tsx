import { useState, useEffect } from "react";
import { Credentials, PageProps } from "../interfaces";
import { post } from "../networking";
import { useNavigate } from "react-router-dom";
import { fetchEmail } from "../utils/utils";
import {
  DEFAULT_ERROR,
  INCOMPLETE_CREDENTIALS_ERROR,
  USER_NOT_FOUND_ERROR,
  INCORRECT_PASSWORD_ERROR,
  BASE_BACKEND_URL,
} from "../constants";
import { isAxiosError } from "axios";
import Error from "../components/Error";

export default function LoginPage({ setAuthenticated }: PageProps) {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const error = urlParams.get("error");
      if (error) {
        setErrorMessage(error);
        return;
      }
      if (!token) {
        setAuthenticated(false);
        return;
      }
      const email = await fetchEmail(token);
      const isAuthenticated = email !== null;
      setAuthenticated(isAuthenticated);
      if (isAuthenticated) {
        navigate("/");
        localStorage.setItem("token", token);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    };
    checkAuth();
  }, [navigate, setAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    setErrorMessage(null);
    e.preventDefault();
    if (credentials.email === "" || credentials.password === "") {
      setErrorMessage(INCOMPLETE_CREDENTIALS_ERROR);
    } else
      setLoading(true)
      try {
        const response = await post("/login", credentials);
        localStorage.setItem("token", response.data.token);
        navigate("/");
        setAuthenticated(true);
        setLoading(false)
      } catch (err) {
        let errorMessage: string = DEFAULT_ERROR;
        if (isAxiosError(err) && err.response?.status === 404) {
          errorMessage = USER_NOT_FOUND_ERROR;
        } else if (isAxiosError(err) && err.response?.status === 401) {
          errorMessage = INCORRECT_PASSWORD_ERROR;
        }
        setLoading(false)
        setErrorMessage(errorMessage);

      }
    setCredentials({ email: "", password: "" });
  };

  const handleGoogleLogin = () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${BASE_BACKEND_URL}/login/oauth2/code/google&response_type=code&client_id=859034309572-651h4hqiv2mjpbe6k7o4f0porl9p0f5j.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&access_type=offline`;
  };


  return (
    <>
      {loading && <div id="loading"/>}
      {errorMessage && (
        <Error errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
      )}
      <main className="logreg-main">
        <div className="logreg-card main-component">
          <p className="logreg-header">Login</p>
          <form className="logreg-credential-form " onSubmit={handleSubmit}>
            <input
              className="text-input "
              type="text"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              placeholder="email"
            />
            <input
              className="text-input"
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              placeholder="password"
            />
            <button className="logreg-submit basic-button" type="submit">
              continue
            </button>
          </form>
          or
          <button className="gsi-material-button" onClick={handleGoogleLogin}>
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  style={{ display: "block" }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                Continue with Google
              </span>
              <span style={{ display: "none" }}>Continue with Google</span>
            </div>
          </button>
          <button className="basic-button" onClick={() => navigate("/")}>
            continue as a guest
          </button>
          <button
            className="basic-button"
            onClick={() => navigate("/register")}
          >
            register instead
          </button>
        </div>
      </main>
    </>
  );
}
