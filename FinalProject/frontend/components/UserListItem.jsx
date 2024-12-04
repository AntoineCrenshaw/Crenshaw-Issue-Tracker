import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function UserListItem({ showSuccess, showError }) {
  const { id } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    console.log("ID from URL:", id);
    axios
      .get(`http://localhost:2024/api/users/${id}`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response.data);
        setUser(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleConfirmDelete = async (e, id) => {
    e.preventDefault();
    try {
      await axios.delete(`http://localhost:2024/api/users/${id}`, {
        withCredentials: true,
      });
      showSuccess("User deleted successfully");
      setShowModal(false);
      navigate("/users");
    } catch (e) {
      console.error(e);
      const errorMessage = e.response?.data?.message || "Failed to delete user";
      showError(errorMessage);
      setMessage(errorMessage);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <>
      <div>
        <div className="card mt-3" key={user._id}>
          <div className="card-body">
            <h5 className="card-title">Name: {user.fullName}</h5>
            <p className="card-text">Email: {user.email}</p>
            {user.role && user.role.length > 0 ? (
              user.role.map((role, index) => (
                <span key={index} className="badge bg-primary me-1">
                  {role}
                </span>
              ))
            ) : (
              <span className="badge bg-primary me-1">No Role</span>
            )}
            <div>
              <button
                className="btn btn-link text-danger"
                onClick={() => handleUserClick(user)}
              >
                <i className="bi bi-trash3"></i> Delete
              </button>
            </div>
          </div>
          <div className="card-footer">
            <small>Created On: {user.createdOn || "Unknown"}</small>
          </div>
        </div>
      </div>

      {message && <div className="users-message text-center">{message}</div>}

      {showModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{selectedUser.email}</strong>?
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
                  onClick={(e) => handleConfirmDelete(e, selectedUser._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserListItem;
