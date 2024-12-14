import Navbar from "./navbar.jsx";
import "bootswatch/dist/journal/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import Footer from "../components/Footer.jsx";
import SignInForm from "../components/SignInForm.jsx";
import ListUsers from "../components/ListUsers.jsx";
import RegisterUserForm from "../components/RegisterUserForm.jsx";
import ListBugs from "../components/ListBugs.jsx";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import BugEditor from "../components/BugEditor.jsx";
import UserListItem from "../components/UserListItem.jsx";
import UserEditor from "../components/UserEditor.jsx";
import HomePage from "../components/HomePage.jsx";
import ReportBug from "../components/ReportBug.jsx";

function App() {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  function showSuccess(message) {
    toast(message, { type: "success", position: "bottom-right" });
  }

  function showError(message) {
    toast(message, { type: "error", position: "bottom-right" });
  }

  function onLogout() {
    setAuth(null);
    showSuccess("Logged out successfully");
    axios
      .post(
        "http://localhost:2024/api/users/logout",
        {},
        { withCredentials: true }
      )
      .then((response) => {
        console.log(response.data);
      });
    navigate("/login");
    localStorage.removeItem("auth");
    localStorage.removeItem("authExpiration");
  }

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth) {
      setAuth(auth);
      console.log("auth", auth);
      const interval = setInterval(() => {
        const authExpiration = localStorage.getItem("expirationTime");
        const now = new Date().getTime();
        const expirationTime = parseInt(authExpiration, 10);
        // console.log("interval hit");
        // console.log("now time", now / 1000);
        // console.log("expiration time", expirationTime / 100);
        if (now > expirationTime) {
          clearInterval(interval);
          onLogout();
          localStorage.removeItem("auth");
        }
      }, 1000);
    }
  }, []);

  return (
    <>
      <div className="container">
        <ToastContainer />
        <header>
          <Navbar auth={auth} onLogout={onLogout} />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <SignInForm
                  showSuccess={showSuccess}
                  showError={showError}
                  setAuth={setAuth}
                />
              }
            />
            <Route
              path="/register"
              element={
                <RegisterUserForm
                  showSuccess={showSuccess}
                  showError={showError}
                  setAuth={setAuth}
                />
              }
            />
            <Route
              path="/bugs"
              element={
                <ListBugs
                  showSuccess={showSuccess}
                  showError={showError}
                  auth={auth}
                />
              }
            />
            <Route path="/bugs/report" element={<ReportBug auth={auth} />} />
            <Route
              path="/bugs/:id"
              element={
                <BugEditor showSuccess={showSuccess} showError={showError} />
              }
            />
            <Route
              path="/users"
              element={
                <ListUsers
                  showSuccess={showSuccess}
                  showError={showError}
                  auth={auth}
                />
              }
            />
            <Route
              path="/users/:id"
              element={
                <UserListItem
                  showError={showError}
                  showSuccess={showSuccess}
                  auth={auth}
                />
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <UserEditor showSuccess={showSuccess} showError={showError} />
              }
            />
            <Route path="*" element={<h1>Not Found</h1>} />
          </Routes>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </>
  );
}

export default App;
