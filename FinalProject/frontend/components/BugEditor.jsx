import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../src/api";
import "./ListBugs.css";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./BugEditor.css";
import BugComment from "./BugComment";

const BugEditor = ({ showSuccess, showError }) => {
  const { id } = useParams();
  const [bug, setBug] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [assignedToUserName, setAssignedToUserName] = useState("");
  const [classification, setClassification] = useState("");
  const [closed, setClosed] = useState(false);
  const [users, setUsers] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/api/bugs/${id}`)
      .then((response) => {
        const bugData = response.data;
        setBug(bugData);
        setTitle(bugData.title);
        setDescription(bugData.description);
        setStepsToReproduce(bugData.stepsToReproduce);
        setAssignedToUserName(bugData.assignedToUserName);
        setClassification(bugData.classification);
        setClosed(bugData.closed === true);
      })
      .catch((error) => console.log(error));

    api
      .get("/api/users")
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => console.log(error));

    api
      .get(`/api/bugs/${id}/comment/list`)
      .then((response) => {
        setComments(response.data);
      })
      .catch((error) => console.log(error));
  }, [id]);

  function getErrorMessage(err) {
    if (err.response) return err.response.data?.message ?? "Server error";
    if (err.request) return "No response from server";
    return err.message ?? "Something went wrong";
  }

  const onBugUpdate = async (e) => {
    e.preventDefault();

    const updatedBug = {
      title,
      description,
      stepsToReproduce,
      assignedToUserName,
      classification,
      closed,
    };

    // Delete updatedBug._id;

    try {
      let response = await api.patch(`/api/bugs/${id}`, updatedBug, {
        withCredentials: true,
      });
      console.log(response.data);
      setBug(response.data.bugs ?? response.data.bug ?? bug);
      showSuccess("Bug Update Successful");
      navigate("/bugs");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const onAddComment = async () => {
    try {
      const response = await api.post(`/api/bugs/${id}/comment/new`, {
        comment: newComment,
      });
      setComments(response.data.comment);
      console.log(response.data.comment);
      setNewComment("");
      showSuccess("Comment added successfully");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const cancelEdit = (e) => {
    e.preventDefault();
    navigate("/bugs");
  };

  return (
    <>
      <div className="bugs-card-container mt-5 mb-2">
        <div className="card" key={bug._id}>
          <div className="bg-white text-center">
            <h1> Edit Bug</h1>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => onBugUpdate(e)}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="stepsToReproduce" className="form-label">
                  Steps to Reproduce
                </label>
                <textarea
                  className="form-control"
                  id="stepsToReproduce"
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="userName" className="form-label">
                  Assigned To {bug.assignedToUserName}
                </label>
                <select
                  className="form-select"
                  id="userName"
                  value={assignedToUserName}
                  onChange={(e) => setAssignedToUserName(e.target.value)}
                >
                  {users.map((user) => (
                    <option key={user._id} value={user.fullName}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="classification" className="form-label">
                  Classification
                </label>
                <select
                  className="form-select"
                  id="classification"
                  value={classification}
                  onChange={(e) =>
                    setClassification(e.target.value)
                  }
                >
                  <option value="Approved">Approved</option>
                  <option value="Unapproved">Unapproved</option>
                  <option value="Duplicate">Duplicate</option>
                  <option value="Unclassified">Unclassified</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="closedStatus" className="form-label">
                  Closed
                </label>
                <select
                  className="form-select"
                  id="closedStatus"
                  value={String(closed)}
                  onChange={(e) => setClosed(e.target.value === 
                    "true"
                  )}
                >
                  <option value="true">Closed</option>
                  <option value="false">Open</option>{" "}
                </select>
              </div>
              <div className="d-flex flex-row gap-2">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-warning text-black"
                  onClick={(e) => cancelEdit(e)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="col mb-3">
        <table className="table table-striped">
          <thead>
            {console.table(bug)}
            <tr>
              <th scope="col">#</th>
              <th scope="col">Comment</th>
              <th scope="col">Created On</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment, index) => (
              <BugComment key={comment._id} comment={comment} index={index} />
            ))}
            {comments?.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <h3 className="text-center">No comments found</h3>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="row mb-4">
          <div className="col-md-9">
            <div className="form-outline mb-4">
              <input
                type="text"
                className="form-control"
                id="comment"
                value={newComment}
                placeholder="Add a comment"
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => onAddComment(e)}
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default BugEditor;
