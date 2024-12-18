import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const DisplayUserDetails = ({ auth, showSuccess, showError }) => {
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [createdDate, setCreatedDate] = useState("");
  const [lastUpdatedOn, setLastUpdatedOn] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:2024/api/users/me", { withCredentials: true })
      .then((response) => {
        console.log("Selected User Data returned", response.data);
        setUser(response.data.user);
        setGivenName(response.data.user.givenName);
        setFamilyName(response.data.user.familyName);
        setFullName(response.data.user.fullName);
        setEmail(response.data.user.email);
        setRoles(response.data.user.role);
        setCreatedDate(response.data.user.createdOn);
        setLastUpdatedOn(response.data.user.lastUpdatedOn);
      })
      .catch((error) => console.log(error));
  }, []);

  const cancelEdit = (e) => {
    e.preventDefault();
    console.log("Canceling edit and returning to users list");
    navigate("/users");
  };

  const OnDetailsUpdate = async (e) => {
    e.preventDefault();
    console.log("Updating user");
    console.log("Fetched user data:", user);

    const updatedUser = {
      ...user,
      givenName,
      familyName,
      fullName,
      email,
      createdDate,
      roles,
    };


    try {
      let response = await axios.patch(
       " http://localhost:2024/api/users/me",
        { ...updatedUser },
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log("You have successfully updated your data", response.data);
        setUser(response.data.users);
        showSuccess(response.data.message);
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

  return (
    <>
      {auth && (
        <div className="user-card-container">
          <div className="card">
            <div className="bg-white">
              <h1 className="text-center">User info</h1>
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
                    onChange={(e) => setGivenName(e.target.value)}
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
                    onChange={(e) => setFamilyName(e.target.value)}
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
                  <label htmlFor="createdDateForm" className="form-label">
                    Created Date
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="createdDateForm"
                    value={moment(createdDate).fromNow()}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="rolesForm" className="form-label">
                    Roles
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="rolesForm"
                    value={roles}
                    readOnly
                  />
                  </div>
                <div className="card-footer">
                  <div className="mb-3">
                    <label htmlFor="lastUpdatedOn" className="form-label">
                      Last Updated
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastUpdatedOn"
                      value={moment(lastUpdatedOn).fromNow()}
                      readOnly
                    />
                  </div>
                  </div>
                  <div className="mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={(e) => OnDetailsUpdate(e)}
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
      )}
    </>
  );
};

export default DisplayUserDetails;
