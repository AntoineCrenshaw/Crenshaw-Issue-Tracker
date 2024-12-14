import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./UserEditor.css";

export default function UserEditor({ showSuccess, showError }) {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [givenName, setFirstName] = useState("");
  const [familyName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Display the user details on open of the page
  useEffect(() => {
    axios
      .get(`http://localhost:2024/api/users/${id}`, { withCredentials: true })
      .then((response) => {
        console.log(response.data.users);
        console.log("Roles from API:", response.data.role);

        setUser(response.data);
        setFirstName(response.data.givenName);
        setLastName(response.data.familyName);
        setFullName(response.data.fullName);
        setEmail(response.data.email);
      })
      .catch((error) => console.log(error));
  }, []);

  const onUserUpdate = async (e) => {
    e.preventDefault();
    console.log("Updating user");
    console.log("Fetched user data:", user);

    const updatedUser = {
      ...user,
      givenName,
      familyName,
      fullName,
      email,
    };

    delete updatedUser._id;

    try {
      let response = await axios.patch(
        `http://localhost:2024/api/users/${id}`,
        { ...updatedUser },
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log(response.data);
        setUser(response.data.users);
        showSuccess(response.data.message);
        navigate("/users");
      } else {
        showError(response.data.message);
      }
    } catch (err) {
      if (err.response) {
        // Error from the server (HTTP status code, response data, etc.)
        console.log(
          `Server Error: ${err.response.status} - ${err.response.statusText}`
        );
        console.log(`Details: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // Error with the request itself, no response received
        console.log("Network Error: No response received");
        console.log(`Request: ${err.request}`);
      } else {
        // Some other error occurred
        console.log(`Unexpected Error: ${err.message}`);
      }
    }
  };

  const cancelEdit = (e) => {
    e.preventDefault();
    // Redirect to the users page
    console.log("Cancelling edit and returning to users page");
    navigate("/users");
  };

  return (
    <div className="user-card-container">
      <div className="card">
        <div className="bg-white">
          <h1>Edit user info</h1>
        </div>
        <div className="card-body">
          <form>
            <div className="mb-3">
              <label htmlFor="firstNameForm" className="form-label">
                First Name
              </label>
              <input
                type="text"
                className="form-control"
                id="firstNameForm"
                value={givenName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="lastNameForm" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className="form-control"
                id="lastNameForm"
                value={familyName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="emailForm" className="form-label">
                Email
              </label>
              <input
                type="text"
                className="form-control"
                id="emailForm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="fullNameForm" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="fullNameForm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <button
                type="submit"
                className="btn btn-primary"
                onClick={(e) => onUserUpdate(e)}
              >
                Update
              </button>
              <button
                type="button"
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
}
