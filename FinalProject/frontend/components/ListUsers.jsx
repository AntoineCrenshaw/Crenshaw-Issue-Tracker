import { useState, useEffect } from "react";
import axios from "axios";
import "./ListUsers.css";
import { Link } from "react-router-dom";

const ListUsers = ({ showSuccess, showError, auth }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [keywords, setKeywords] = useState("");

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
        params: { keywords: keywords },
      });
      console.log(data.users);
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    }
  };

  {isLoading && (<><div className="d-flex text-center spinner-grow text-primary" role="status">
    <span className="sr-only">Loading...</span>
  </div><div className="spinner-grow text-secondary" role="status">
      <span className="sr-only">Loading...</span>
    </div><div className="spinner-grow text-success" role="status">
      <span className="sr-only">Loading...</span>
    </div><div className="spinner-grow text-danger" role="status">
      <span className="sr-only">Loading...</span>
    </div><div className="spinner-grow text-warning" role="status">
      <span className="sr-only">Loading...</span>
    </div><div className="spinner-grow text-info" role="status">
      <span className="sr-only">Loading...</span>
    </div><div className="spinner-grow text-light" role="status">
      <span className="sr-only">Loading...</span>
    </div><div className="spinner-grow text-dark" role="status">
      <span className="sr-only">Loading...</span>
    </div></>)}

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <h1 className="text-center mb-3">Users </h1>
      
      <div className="users-container mt-5 min-h-screen">
        <div className="container-fluid">
          <form
            className="d-flex w-100 justify-content-center mb-4 gap-2"
            role="search"
          >
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              onChange={(evt) => setKeywords(evt.target.value)}
              value={keywords}
            />
            <button
              className="btn btn-secondary"
              onClick={(evt) => onSubmitSearch(evt)}
            >
              Search
            </button>
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
          <div className="users-message text-center">{message}</div>
        )}
      </div>
    </>
  );
};

export default ListUsers;
