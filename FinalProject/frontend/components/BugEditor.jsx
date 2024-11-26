import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const BugEditor = ({ showSuccess, showError, setAuth }) => {
  const { id } = useParams();
  const [bug, setBug] = useState({});
  const [title, setTitle] = useState("");
  const [bugDescription, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [assignedToUserName, setAssignedToUserName] = useState("");

  const navigate = useNavigate();

  // Display the bug details on open of the page
  useEffect(() => {
    axios
      .get(`http://localhost:2024/api/bugs/${id}`, { withCredentials: true })
      .then((response) => {
        console.log(response.data.bugs);
        setBug(response.data);
        setTitle(response.data.title);
        setDescription(response.data.description);
        setStepsToReproduce(response.data.stepsToReproduce);
        setAssignedToUserName(response.data.assignedToUserName);
      })
      .catch((error) => console.log(error));
  }, []);

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
    console.log("Cancelling edit and returning to users page");
    navigate("/bugs");
  };

  return (
    <>
      <div className="container mt-5">
        <h1>Edit Bug - {id}</h1>
        <div className="row">
          {/* First Row */}
          <div className="col-12">
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
            </form>
          </div>
        </div>

        <div className="row mt-3">
          {/* Second Row */}
          <div className="col-12">
            <form onSubmit={(e) => onBugUpdate(e)}>
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
                <textarea
                  className="form-control"
                  id="userName"
                  value={assignedToUserName}
                  onChange={(e) => setAssignedToUserName(e.target.value)}
                ></textarea>
              </div>
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
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default BugEditor;
