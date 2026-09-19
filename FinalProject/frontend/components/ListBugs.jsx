import { useEffect, useState } from "react";
import api from "../src/api";
import Skeleton from "react-loading-skeleton";
import "./ListBugs.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";

const ListBugs = ({ showSuccess, showError, auth }) => {
  const [selectedBug, setSelectedBug] = useState({});
  const [bugs, setBugs] = useState([]);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCounter, setDeleteCounter] = useState(0);
  const [keywords, setKeywords] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [showInactive, setShowInactive] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const navigate = useNavigate();

  const getBugs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("api/bugs");
      console.log("Response Data: ", response.data);

      setBugs(response.data.bugs || []);
      setMessage(response.data.message || "You must be signed in to view bugs");
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Error fetching users. Refresh the page to try again",
      );
    } finally {
      setIsLoading(false);
    }
  };

  async function updateCloseStatus(e, id) {
    e.preventDefault();
    console.log(id);
    try {
      const response = await api.put(`api/bugs/${id}/close`, {
        closed: true,
      });
      if (response.status === 200) {
        showSuccess("Bug closed successfully");
        setDeleteCounter(deleteCounter + 1);
        setShowModal(false);
        navigate("/bugs");
      } else {
        showError(response.data.message);
      }
    } catch (e) {
      console.log(e);
    }
  }

  const onSubmitSearch = async (evt) => {
    evt.preventDefault();
    try {
      const { data } = await api.get(`api/bugs/`, {
        headers: { authorization: `Bearer ${auth?.token}` },
        params: {
          keywords: keywords,
          classification: classificationFilter,
          sortBy: sortBy,
          closed: showInactive,
          minAge: minAge,
          maxAge: maxAge,
        },
      });
      console.log(data.bugs);
      setBugs(data.bugs);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBugClick = (bug) => {
    setSelectedBug(bug);
    setShowModal(true);
  };

  useEffect(() => {
    getBugs();
  }, [deleteCounter]);

  return (
    <>
      {isLoading ? (
        <div className="bugs-container mt-5">
          <table className="bugs-table skeletonWrapper">
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
            <div className="container-fluid">
              <form className="row w-100 mb-4" role="search">
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
                  <label className="form-label">Filter by Classification</label>
                  <select
                    className="form-select"
                    onChange={(evt) =>
                      setClassificationFilter(evt.target.value)
                    }
                  >
                    <option value="">Select a classification</option>
                    <option value="Approved">Approved</option>
                    <option value="Unapproved">Unapproved</option>
                    <option value="Unclassified">Unclassified</option>
                    <option value="Duplicate">Duplicate</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Sort By</label>
                  <select
                    className="form-select"
                    onChange={(evt) => setSortBy(evt.target.value)}
                  >
                    <option value="">Sort By</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="title">Title</option>
                    <option value="classification">Classification</option>
                    <option value="assignedTo">Assigned To</option>
                    <option value="createdBy">Created By</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Close Status</label>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="showInactive"
                      onChange={(evt) =>
                        setShowInactive(evt.target.checked ? "true" : "false")
                      }
                    />
                    <label className="form-check-label" htmlFor="showInactive">
                      Show Closed
                    </label>
                  </div>
                </div>
                <div className="row mb-4 mt-2">
                  <div className="col">
                    <input
                      type="number"
                      name="txtMinAge"
                      id="txtMinAge"
                      className="form-control"
                      placeholder="Minimum Age"
                      onChange={(evt) => setMinAge(evt.target.value)}
                    />
                  </div>
                  <div className="col">
                    <input
                      type="number"
                      name="txtMaxAge"
                      id="txtMaxAge"
                      className="form-control"
                      placeholder="Maximum Age"
                      onChange={(evt) => setMaxAge(evt.target.value)}
                    />
                  </div>
                </div>
              </form>
            </div>
            {bugs.length > 0 ? (
              <>
                <table className="bugs-table">
                  <caption>Bugs</caption>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Classification</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                      <th>Time of Creation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bugs.map((bug) => (
                      <tr key={bug._id}>
                        <td>{bug.title}</td>
                        <td>
                          <span
                            className={`badge ${
                              bug.classification === `Approved`
                                ? `bg-success`
                                : bug.classification === `Unapproved`
                                  ? `bg-danger`
                                  : bug.classification === `Duplicate`
                                    ? `bg-danger`
                                    : bug.classification === `Unclassified`
                                      ? `bg-info`
                                      : `bg-info`
                            }`}
                          >
                            {bug.classification}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              bug.closed === true
                                ? `bg-success`
                                : bug.closed === false
                                  ? `bg-primary`
                                  : `bg-primary`
                            }`}
                          >
                            {bug.closed ? `Closed` : `Open`}
                          </span>
                        </td>
                        <td>{bug.assignedToUserName}</td>
                        <td>
                          <span>
                            {auth?.role?.some((role) =>
                              ["Admin", "Business Analyst"].includes(role),
                            ) ? (
                              <div>
                                <button className="btn btn-link">
                                  <Link to={`/bugs/${bug._id}`}>
                                    <i className="bi bi-pencil text-primary-emphasis"></i>
                                  </Link>
                                </button>

                                <button
                                  className="btn btn-link"
                                  onClick={() => handleBugClick(bug)}
                                >
                                  <i className="bi bi-ban text-primary-emphasis"></i>
                                </button>
                              </div>
                            ) : (
                              <span>No permissions currently</span>
                            )}
                            {showModal && selectedBug._id === bug._id && (
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
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title="Tooltip on top"
                                        onClick={() => setShowModal(false)}
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                      ></button>
                                    </div>
                                    <div className="modal-body">
                                      <p className="fs-4">
                                        Are you sure you want to close this bug?
                                        <br />
                                        {bug.title}
                                      </p>
                                    </div>
                                    <div className="modal-footer">
                                      <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-toggle="tooltip"
                                        data-placement="top"
                                        title="Tooltip on top"
                                        onClick={() => setShowModal(false)}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={(e) =>
                                          updateCloseStatus(e, bug._id)
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
                        </td>
                        <td>{moment(bug.createdOn).fromNow()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>No bugs meet your desired criteria. Try again</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ListBugs;
