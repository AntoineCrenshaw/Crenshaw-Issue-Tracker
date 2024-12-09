import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import HomePage from "./Components/HomePage.jsx";
import LoginForm from "./Components/LoginForm.jsx";
import { ToastContainer, toast } from "react-toastify";
import { useState, useEffect } from "react";
import RegisterForm from "./Components/RegisterForm.jsx";
import { UserList } from "./Components/UserList.jsx";
import { UserListItem } from "./Components/UserListItem.jsx";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import { UserEditor } from "./Components/UserEditor.jsx";
import Navbar from "./Components/Navbar.jsx";
import ProductsList from "./Components/ProductsList.jsx";
import ProductListItem from "./Components/ProductListItem.jsx";
import ProductEditor from "./Components/ProductEditor.jsx";

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
        "http://localhost:2023/api/users/logout",
        {},
        { withCredentials: true }
      )
      .then((response) => {
        console.log(response.data);
      });
    navigate("/login");
    localStorage.removeItem("auth");
  }

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth) {
      setAuth(auth);
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
                <LoginForm
                  showSuccess={showSuccess}
                  showError={showError}
                  setAuth={setAuth}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <RegisterForm
                  showSuccess={showSuccess}
                  showError={showError}
                  setAuth={setAuth}
                />
              }
            />
            <Route
              path="/users"
              element={
                <UserList showSuccess={showSuccess} showError={showError} />
              }
            />
            <Route
              path="/users/:id"
              element={
                <UserListItem showSuccess={showSuccess} showError={showError} />
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <UserEditor showError={showError} showSuccess={showSuccess} />
              }
            />
            <Route
              path="/products"
              element={
                <ProductsList showSuccess={showSuccess} showError={showError} />
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProductListItem
                  showSuccess={showSuccess}
                  showError={showError}
                />
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProductEditor
                  showSuccess={showSuccess}
                  showError={showError}
                />
              }
            />
            <Route path="*" element={<h1>Not Found</h1>} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
