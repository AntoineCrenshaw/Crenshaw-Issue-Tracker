import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ListBugs.css";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./BugEditor.css";

const BugEditor = ({ showSuccess, showError, setAuth }) => {
  const { id } = useParams();
  const [bug, setBug] = useState({});
  const [title, setTitle] = useState("");
  const [bugDescription, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [assignedToUserName, setAssignedToUserName] = useState("");
  const [bugs, setBugs] = useState([]);

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
      })
      .catch((error) => console.log(error));
  }, [id]);

  const onBugUpdate = async (e) => {
    e.preventDefault();
    console.log("Updating bug");

    const updatedBug = {
      ...bug,
      title,
      description: bugDescription,
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
        setAuth(response.data);
        localStorage.setItem("auth", JSON.stringify(response.data));
        navigate("/bugs");
      } else {
        showError(response.data.message);
        setAuth(null);
      }
    } catch (e) {
      console.log(`catch block: ${JSON.stringify(e.response.data)}`);
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
        <div className="card">
          <div className="bg-white">
            <h1> {bug.title}</h1>
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
                  value={bugDescription}
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
                  Assigned To
                </label>
                <select
                  className="form-select"
                  id="userName"
                  value={assignedToUserName}
                  onChange={(e) => setAssignedToUserName(e.target.value)}
                >
                  <option value="">Select User</option>
                  <option value="Jalen Williams">Jalen Williams</option>
                  <option value="Steven Adams">Steven Adams</option>
                  <option value="Anthony Davis">Anthony Davis</option>
                    
                
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
    </>
  );
};
export default BugEditor;
