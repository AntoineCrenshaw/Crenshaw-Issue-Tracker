import { useState, useEffect } from "react";
import axios from "axios";
import "./ListUsers.css";
import { Link } from "react-router-dom";

const ListUsers = ({ showSuccess, showError, auth }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState([]);
  const [keywords, setKeywords] = useState("");
  const [sortBy, setSortBy] = useState("givenName");

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:2024/api/users", {
        withCredentials: true,
      });
      setUsers(response.data.users || []);
      setMessage(
        response.data.message || "You must be signed in to view users"
      );
      showSuccess(response.data.message);
    } catch (e) {
      const errorMessage =
        e.response?.data?.message ||
        "Error fetching users. You must be signed in to view users";
      setMessage(errorMessage);
      showError(errorMessage);
    }
    setIsLoading(false);
  };

  const onSubmitSearch = async (evt) => {
    evt.preventDefault();
    try {
      const { data } = await axios.get(`http://localhost:2024/api/users/`, {
        headers: { authorization: `Bearer ${auth?.token}` },
        params: { keywords: keywords, roles: roleFilter, sortBy: sortBy },
      });
      console.log(data.users);
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  {
    isLoading && (
      <>
        <div
          className="d-flex text-center spinner-grow text-primary"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </>
    );
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <h1 className="text-center mb-3">Users</h1>

      <div className="users-container mt-5 min-h-screen">
        <div className="container-fluid">
          <form className=" row w-100  mb-4" role="search">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search"
                onChange={(evt) => setKeywords(evt.target.value)}
                value={keywords}
              />
              <button
                className="btn btn-secondary mt-2 w-100"
                onClick={(evt) => onSubmitSearch(evt)}
              >
                Search
              </button>
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="rolesLabel">
                Filter by Role {roleFilter}
              </label>
              <select
                className="form-select"
                onChange={(evt) => setRoleFilter(evt.target.value)}
                value={roleFilter}
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
                <option value="Technical Manager">TM</option>
                <option value="Business Analyst">BA</option>
                <option value="Developer">Developer</option>
                <option value="Quality Analyst">Quality Analyst</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="sortByLabel">
                Sort by
              </label>
              <select
                className="form-select"
                onChange={(evt) => setSortBy(evt.target.value)}
                value={sortBy}
              >
                <option value="givenName">First Name</option>
                <option value="familyName">Last Name</option>
                <option value="role">Role</option>
              </select>
            </div>
          </form>
        </div>
        {users.length > 0 ? (
          <div className="d-flex flex-wrap gap-2 flex-grow ">
            {users.map((user) => (
              <Link key={user._id} to={`/users/${user._id}`}>
                <div className="card mb-3 me-3" key={user._id}>
                  <div className="card-body">
                    <h5 className="card-title">{user.fullName}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">
                      {user.email}
                    </h6>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="users-message text-center">
            <p>No search matches your criteria</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ListUsers;
