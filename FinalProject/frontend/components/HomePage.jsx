// Home.jsx
import { NavLink } from "react-router-dom";
import "./HomePage.css";

const Home = () => {
  return (
    <div className="home">
      <div className="home-hero">
        <h1>Welcome</h1>
        <p>Track, report, and resolve software issues in one place.</p>
      </div>

      <div className="home-actions">
        <NavLink to="/bugs/new" className="home-card">
          <h2>Report a bug</h2>
          <p>Log a new issue with steps to reproduce.</p>
        </NavLink>

        <NavLink to="/bugs" className="home-card">
          <h2>View bugs</h2>
          <p>Search, filter, and manage existing issues.</p>
        </NavLink>

        <NavLink to="/users" className="home-card">
          <h2>View users</h2>
          <p>See who's on the team and their roles.</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Home;
