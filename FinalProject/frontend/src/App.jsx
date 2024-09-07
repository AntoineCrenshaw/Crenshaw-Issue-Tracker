import "./App.css";
import axios from "axios";

function App() {
  return (
    <>
      <header className="mb-5">
        <div className="d-flex justify-space-between">
          <nav className="navbar navbar-expand-lg navbar-light bg-light w-100">
            <div className="container-fluid">
              <a className="navbar-brand" href="#">
                <img
                  src="https://www.pngkey.com/png/full/114-1149878_react-js-logo-png.png"
                  alt=""
                  width="30"
                  height="24"
                  className="d-inline-block align-text-top"
                />
                My Issue Tracker
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">
                      Users
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Bugs
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="d-flex justify-space-between">
        <div className="card" style={{ width: "30rem" }}>
          <div className="card-body">
            <h2 className="card-title">Users</h2>
            <div>
              <a href="#">Lebron</a>
            </div>
            <div>
              <a href="#">Curry</a>
            </div>
            <div>
              <a href="#">Wade</a>
            </div>
            <div>
              <a href="#">Micheal Jordan</a>
            </div>
          </div>
        </div>

        <div className="card " style={{ width: "30rem" }}>
          <div className="card-body">
            <h2 className="card-title">Bugs</h2>
            <div>
              <a href="#">Lebron</a>
            </div>
            <div>
              <a href="#">Curry</a>
            </div>
            <div>
              <a href="#">Wade</a>
            </div>
            <div>
              <a href="#">Micheal Jordan</a>
            </div>
          </div>
        </div>
      </main>

      <footer> &copy; 2024 Antoine Crenshaw</footer>
    </>
  );
}

export default App;
