import { useState, useEffect } from "react";
import axios from "axios";
import "./ListUsers.css";
import Skeleton from "react-loading-skeleton";
import { NavLink, useNavigate } from "react-router-dom";

const ListUsers = ({ showSuccess }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteCounter, setDeleteCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const getUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:2024/api/users", {
        withCredentials: true,
      });
      console.log(data);
      setUsers(data.users || []);
      setMessage(data.message || "You must be signed in to view users");
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Error fetching users. You must be signed in to view users"
      );
    }
  };

  function handleConfirmDelete(e, id) {
    e.preventDefault();
    console.log(id);
    try {
      const data = axios.delete(`http://localhost:2024/api/users/${id}`, {
        withCredentials: true,
      });
      showSuccess("User deleted successfully");
      console.log(data);
      setDeleteCounter(deleteCounter + 1);
      navigate("/users");
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getUsers();
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="users-container mt-5">
          <table className="users-table skeletonWrapper">
            <caption>Current Users</caption>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{<Skeleton />}</td>
                  <td>{<Skeleton />}</td>
                  <td>{<Skeleton />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="users-container mt-5">
            {users.length > 0 ? (
              <table className="users-table">
                <caption>Current Users</caption>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{user.fullName}</td>
                      <td>{user.role}</td>
                      <td>
                        <span>
                          <span>
                            <button className="btn btn-link">
                              <NavLink to={`/users/${user._id}`}>
                                <i className="bi bi-pencil"></i>
                              </NavLink>
                            </button>
                            <button
                              className="btn btn-link"
                              onClick={() => setShowModal(true)}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                            {showModal && (
                              <div className="modal show d-block" tabIndex="-1">
                                <div className="modal-dialog">
                                  <div className="modal-content">
                                    <div className="modal-header">
                                      <h5 className="modal-title">
                                        Confirm Delete
                                      </h5>
                                      <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                      ></button>
                                    </div>
                                    <div className="modal-body">
                                      <p>
                                        Are you sure you want to delete{" "}
                                        {user.fullName}?
                                      </p>
                                    </div>
                                    <div className="modal-footer">
                                      <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={(e) =>
                                          handleConfirmDelete(e, user._id)
                                        }
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="users-message">{message}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ListUsers;
