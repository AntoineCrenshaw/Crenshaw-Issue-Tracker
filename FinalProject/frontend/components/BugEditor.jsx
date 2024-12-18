import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import _ from "lodash";
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
  const [users, setUsers] = useState([]);
  const [comment, setComments] = useState("");

  const navigate = useNavigate();

  // Display the bug details on open of the page
  useEffect(() => {
    axios
      .get(`http://localhost:2024/api/bugs/${id}`, { withCredentials: true })
      .then((response) => {
        console.log(response.data.bugs);
        const bugData = response.data;
        setBug(bugData);
        setTitle(bugData.title);
        setDescription(bugData.description);
        setStepsToReproduce(bugData.stepsToReproduce);
        setAssignedToUserName(bugData.assignedToUserName);
      })
      .catch((error) => console.log(error));

    axios
      .get("http://localhost:2024/api/bugs", { withCredentials: true })
      .then((response) => {
        console.log(response.data);
      });
    axios
      .get("http://localhost:2024/api/users", { withCredentials: true })
      .then((response) => {
        setUsers(response.data.users);
        console.log(response.data.users);
      })
      .catch((error) => console.log(error));

      axios.get(`http://localhost:2024/api/bugs/${id}/comment/list`, { withCredentials: true })
      .then((response) => {
        console.log("Comment list",response.data);
        setComments(response.data.comment);
      }).catch(error => console.log(error));
  }, []);

  const onBugUpdate = async (e) => {
    e.preventDefault();
    console.log("Updating bug");

    const updatedBug = {
      ...bug,
      title,
      description,
      stepsToReproduce,
      assignedToUserName,
    };

    delete updatedBug._id;

    try {
      let response = await axios.patch(
        `http://localhost:2024/api/bugs/${id}`,
        { ...updatedBug },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setBug(response.data.bugs);
        showSuccess(response.data.message);
        navigate("/bugs");
      } else {
        showError(response.data.message);
      }
    } catch (e) {
      showError(e.response.data.message);
    }
  };

  const cancelEdit = (e) => {
    e.preventDefault();
    // Redirect to the users page
    console.log("Cancelling edit and returning to bugs page");
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
                  value={bug.classification}
                  onChange={(e) =>
                    setBug({ ...bug, classification: e.target.value })
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
                  value={bug.closed}
                  onChange={(e) => setBug({ ...bug, closed: e.target.value })}
                >
                  <option value="true">Closed</option>
                  <option value="false">Open</option>{" "}
                </select>
              </div>
              <div className="text-center">
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
            {bug.comments && _.map(bug.comments, (comment, index) => (
                <BugComment key={comment._id} comment={comment} index={index} />
              ))}
            {console.log("Comments for current bug", bug.comments)}
            {bug.comments?.length === 0 && (<tr><td>No comments found</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default BugEditor;
