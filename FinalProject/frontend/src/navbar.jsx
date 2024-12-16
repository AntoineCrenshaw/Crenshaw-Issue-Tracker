import { AiFillBug } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import "./assets/css/navbar.css";

const Navbar = ({ auth, onLogout }) => {
  const onClickLogout = (e) => {
    e.preventDefault();
    onLogout();
  };

  return (
    <div id="navRoot">
      <nav className="navbar navbar-expand-lg bg-light" data-bs-theme="light">
        <div className="container-fluid">
          <AiFillBug />
          <span className="navbar-brand">Issue Tracker</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarColor03"
            aria-controls="navbarColor03"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarColor03">
            <ul className="navbar-nav w-100 ">
              {auth ? (
                <>
                  <div className="d-flex me-auto">
                    <li className="nav-item">
                      <NavLink className="nav-link active" to="/">
                        Home
                        <span className="visually-hidden">(current)</span>
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/users">
                        Users
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/bugs">
                        Bugs
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/bugs/new">
                        Report Bug
                      </NavLink>
                    </li>
                  </div>
                  <li className="nav-item">
                    <a className="nav-link" disabled href="#">
                      Welcome {auth.email}
                    </a>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/login"
                      onClick={(e) => onClickLogout(e)}
                    >
                      Logout
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/login">
                      Login
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/register">
                      Register
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
