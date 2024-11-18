import Navbar from "./navbar.tsx";
import "bootswatch/dist/journal/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import SignInForm from "../components/SignInForm.jsx";
import ListUsers from "../components/ListUsers.jsx";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

function App() {
  const [auth, setAuth] = useState(null);

  function showSuccess(message) {
    toast(message, { type: "success", position: "bottom-right" });
  }

  function showError(message) {
    toast(message, { type: "error", position: "bottom-right" });
  }

  return (
    <>
      <ToastContainer />
      <div className="container">
        <header>
          <Navbar auth={auth} />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ListUsers />} />
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
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
