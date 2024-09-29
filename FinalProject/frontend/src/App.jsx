import "./App.css";

function App() {
  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              Issue Tracker
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavAltMarkup"
              aria-controls="navbarNavAltMarkup"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar-nav">
                <a
                  className="nav-link active"
                  aria-current="page"
                  href="/api/bugs/list"
                >
                  Bugs
                </a>
                <a className="nav-link" href="/api/users">
                  Users
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <div className="container text-center">
          <div className="row">
            <div className="col">
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
            <div className="col">
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
        </div>
      </main>

      <footer> &copy; 2024 Antoine Crenshaw</footer>
    </>
  );
}

export default App;
