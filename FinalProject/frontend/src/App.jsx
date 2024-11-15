import Navbar from "./navbar.tsx";
import "bootswatch/dist/journal/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import SignInForm from "../components/SignInForm.jsx";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      <div className="container">
        <header>
          <Navbar />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<SignInForm />} />
            <Route path="/login" element={<SignInForm />} />
          </Routes>
        </main>
      </div>
      {/* <main>
        <div className=" flex flex-col container pt-[1rem] gap-x-8 gap-y-10">
          <div className="row">
            <h2>Users</h2>
            <a className="list-items" href="/api/users">
              Lebron
            </a>
            <a className="list-items" href="/api/users">
              Curry
            </a>
            <a className="list-items" href="/api/users">
              Anthony Edwards
            </a>
          </div>

          <div className="row">
            <h2>Bugs</h2>
            <a className="list-items" href="/api/bugs/1">
              Runtime Error
            </a>
            <a className="list-items" href="/api/bugs/2">
              Syntax Errors
            </a>
            <a className="list-items" href="/api/bugs/3">
              Error 404
            </a>
          </div>
        </div>
      </main> */}
    </>
  );
}

export default App;
