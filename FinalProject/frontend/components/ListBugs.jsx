import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./ListBugs.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink, useNavigate } from "react-router-dom";

const ListBugs = ({showSuccess}) => {
  const [bugs, setBugs] = useState([]);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCounter, setDeleteCounter] = useState(0);
  const navigate = useNavigate();

  const getBugs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:2024/api/bugs", {
        withCredentials: true,
      });
      console.log("Response Data: ", response.data);

      setBugs(response.data.bugs || []);
      setMessage(response.data.message || "You must be signed in to view bugs");
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Error fetching users. Refresh the page to try again"
      );
    }
    setIsLoading(false);
  };

  const handleConfirmDelete = async (e, id) => {
    e.preventDefault();
    console.log(id);
    try {
      const data = await axios.put(`http://localhost:2024/api/bugs/${id}/close`, { closed: true });
      showSuccess("Bug deleted successfully");
      setDeleteCounter(deleteCounter + 1);
      setBugs((prevBugs) => prevBugs.filter((bug) => bug._id !== id));
      setShowModal(false);
      navigate("/users");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getBugs();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="bugs-container mt-5">
          <table className="bugs-table skeletonWrapper">
            <caption>Bugs</caption>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((bug) => (
                <tr key={bug._id}>
                  <td>{<Skeleton />}</td>
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
          <div className="bugs-container mt-5">
            {bugs.length > 0 ? (
              <table className="bugs-table">
                <caption>Bugs</caption>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bugs.map((bug) => (
                    <tr key={bug._id}>
                      <td>{bug.title}</td>
                      <td>{bug.description}</td>
                      <td>{bug.classification}</td>
                      <td>{bug.assignedToUserName}</td>
                      <td>
                        <span>
                          <span>
                            <button className="btn btn-link">
                              <NavLink to={`/bugs/${bug._id}`}>
                                <i className="bi bi-pencil"></i>
                              </NavLink>
                            </button>
                              <button className="btn btn-link" onClick={() => setShowModal(true)}>
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
                                      <p className="fs-4">
                                        Are you sure you want to delete this bug?{""}
                                        <br/>
                                        <strong>{bug.title}</strong>
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
                                          handleConfirmDelete(e, bug._id)
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
              <p>{message}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ListBugs;
