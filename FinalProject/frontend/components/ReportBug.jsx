import useState, { useEffect } from "react";
import axios from "axios";

const ReportBug = ({}) => {
  const [title, setTitle] = useState("");
  const [bug, setBug] = useState({});
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:2024/api/bugs", {
        header: { authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        console.log(response.data.bugs);
        setBug(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const submitBug = async (e) => {
    e.preventDefault();
    axios.post(
      "http://localhost:2024/api/bugs"
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => console.log(error))
    );
  };

  return (
    <div>
      <h1>Report New Bug</h1>
      <p>
        Please provide as much detail as possible so we can fix the issue as
        quickly as possible.
      </p>
      <div className="col mb-2">
        <div className="row col-md-4">
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
        <div className="row col-md-4">
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
        <div className="row col-md-4">
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
      </div>
      <button className="btn btn-primary" onClick={(e) => submitBug(e)}>
        Submit Bug
      </button>
    </div>
  );
};

export default ReportBug;
