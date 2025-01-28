import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./BugEditor.css";

const ReportBug = ({ auth, showSuccess, showError }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const navigate = useNavigate();

  const titleError = !title ? "Title is required" : "";

  const descriptionError = !description ? "Description is required" : "";

  const stepsToReproduceError = !stepsToReproduce
    ? "Steps to reproduce is required"
    : "";

  const createNewBug = async (evt) => {
    evt.preventDefault();
    console.log("Creating new bug");

    if (titleError) {
      showError(titleError);
      return;
    }

    if (descriptionError) {
      showError(descriptionError);
      return;
    }

    if (stepsToReproduceError) {
      showError(stepsToReproduceError);
      return;
    }

    if (title && description && stepsToReproduce) {
      try {
        const response = await axios.post(
          "http://localhost:2024/api/bugs/new",
          {
            title,
            description,
            stepsToReproduce,
          },
          { withCredentials: true }
        );
        console.log(response.data);
        showSuccess("Bug created successfully");
        navigate("/bugs");
      } catch (error) {
        console.error(error);
        showError("Failed to create bug");
      }
    }
  };

  const cancelEdit = (e) => {
    e.preventDefault();
    // Redirect to the users page
    console.log("Cancelling edit and returning to bugs page");
    navigate("/bugs");
  };

  return (
    <div className="bugs-card-container mt-5 mb-2">
      <div className="card">
        <div className="bg-white text-center">
          <h1 className="card-title">Report New Bug</h1>
          <p className="card-text">
            Please provide as much detail as possible so we can fix the issue as
            quickly as possible.
          </p>
        </div>
        <div className="card-body">
          <form>
            <div className="mb-4">
              <label htmlFor="bugTitle" className="form-label">
                Title:
              </label>
              <input
                type="text"
                className="form-control"
                id="bugTitle"
                value={title}
                onChange={(evt) => setTitle(evt.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="form-label">
                Description:
              </label>
              <textarea
                className="form-control"
                id="description"
                value={description}
                onChange={(evt) => setDescription(evt.target.value)}
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="stepsToReproduce" className="form-label">
                Steps to Reproduce:
              </label>
              <textarea
                className="form-control"
                id="stepsToReproduce"
                value={stepsToReproduce}
                onChange={(evt) => setStepsToReproduce(evt.target.value)}
              ></textarea>
            </div>

            <div className="d-flex flex-row gap-2">
              <button
                className="btn btn-primary"
                onClick={(evt) => createNewBug(evt)}
              >
                Submit Bug
              </button>
              <button
                className="btn btn-secondary"
                onClick={(e) => cancelEdit(e)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportBug;
