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
        <div className="home-card">
          <h2>Report a bug</h2>
          <p>Log a new bug along with the steps to reproduce.</p>
        </div>
        <div className="home-card">
          <h2>View bugs</h2>
          <p>Search, filter, and manage existing bugs.</p>
        </div>

        <div className="home-card">
          <h2>View users</h2>
          <p>See all users and their respective roles</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
