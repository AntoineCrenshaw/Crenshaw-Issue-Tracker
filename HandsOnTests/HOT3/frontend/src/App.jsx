import { Routes, Route } from "react-router-dom";
import HomePage from "./Components/HomePage.jsx";
import LoginForm from "./Components/LoginForm.jsx";
import { ToastContainer, toast } from "react-toastify";
import { useState, useEffect } from "react";
import RegisterForm from "./Components/RegisterForm.jsx";
import { UserList } from "./Components/UserList.jsx";
import { UserListItem } from "./Components/UserListItem.jsx";

function App() {
  const [auth, setAuth] = useState(null);
  function showSuccess(message) {
    toast(message, { type: "success", position: "bottom-right" });
  }

  function showError(message) {
    toast(message, { type: "error", position: "bottom-right" });
  }

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth) {
      setAuth(auth);
    }
  }, []);

  return (
    <>
      <ToastContainer />
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
            <UserList
              showSuccess={showSuccess}
              showError={showError}
              setAuth={setAuth}
            />
          }
        />
        <Route path="/users/:id" element={<UserListItem />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
