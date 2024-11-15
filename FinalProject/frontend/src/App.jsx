import Navbar from "./navbar.tsx";
import "bootswatch/dist/journal/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import SignInForm from "../components/SignInForm.jsx";
import ListUsers from "../components/ListUsers.jsx";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-bootstrap";
function App() {
  return (
    <>
      <div className="container">
        <header>
          <Navbar />
        </header>
        <ToastContainer />
        <main>
          <Routes>
            <Route path="/" element={<ListUsers />} />
            <Route path="/login" element={<SignInForm />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
