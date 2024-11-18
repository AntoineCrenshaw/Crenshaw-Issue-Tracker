import { AiFillBug } from "react-icons/ai";

const Navbar = ({ auth }) => {
  return (
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
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link active" href="/">
                Home
                <span className="visually-hidden">(current)</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Users
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Bugs
              </a>
            </li>
            {auth ? (
              <>
                <li>
                  <a className="nav-link" href="#">
                    Welcome {auth.email}
                  </a>
                </li>
                <li>
                  <a className="nav-link" href="#">
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <li>
                <a className="nav-link" href="#">
                  Log In
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
