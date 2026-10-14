import { useEffect, useState } from "react";
import api from "../src/api";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./UserEditor.css";

export default function UserEditor({ showSuccess, showError, auth }) {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [givenName, setFirstName] = useState("");
  const [familyName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/api/users/${id}`, { withCredentials: true })
      .then((response) => {
        console.log(response.data.users);
        console.log("Roles from API:", response.data.role);

        setUser(response.data);
        setFirstName(response.data.givenName);
        setLastName(response.data.familyName);
        setFullName(response.data.fullName);
        setEmail(response.data.email);
        setRoles(response.data.role);
      })
      .catch((error) => console.log(error));
  }, [id]);

  function getErrorMessage(err) {
    if (err.response) return err.response.data?.message ?? "Server error";
    if (err.request) return "No response from server";
    return err.message ?? "Something went wrong";
  }

  const onUserUpdate = async (e) => {
    e.preventDefault();
    console.log("Updating user");
    console.log("Fetched user data:", user);

    if (givenName === "" || givenName.length < 3) {
      showError("First name is required and must be at least 3 characters");
      return;
    }

    if (familyName === "" || familyName.length < 3) {
      showError("Last name is required and must be at least 3 characters");
      return;
    }

    if (email === "" || email.length < 3) {
      showError("Email is required and must be at least 3 characters");
      return;
    }
    
    if (fullName === "") {
      showError("Full name is required")
    }

    const updatedUser = {
      givenName,
      familyName,
      fullName,
      email,
    };

    try {
      let response = await api.patch(`/api/users/${id}`, updatedUser, {
        withCredentials: true,
      });
      console.log(response.data);
      setUser(response.data.users);
      showSuccess(response.data.message);
      navigate("/users");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const cancelEdit = (e) => {
    e.preventDefault();
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
            {auth?.role?.some((role) =>
              ["Admin", "Technical Manager"].includes(role),
            ) ? (
              <div className="mb-3">
                <label htmlFor="roleForm" className="form-label">
                  Role
                </label>
                <select
                  className="form-select"
                  id="roleForm"
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                  <option value="Technical Manager">Technical Manager</option>
                  <option value="Business Analyst">Buisness Analyst</option>
                  <option value="Developer">Developer</option>
                  <option value="Quality Analyst">Quality Analyst</option>
                </select>
              </div>
            ) : null}
            <div className="d-flex flex-row gap-2">
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
