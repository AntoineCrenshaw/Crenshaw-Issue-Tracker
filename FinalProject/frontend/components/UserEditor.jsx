import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./UserEditor.css";

export default function UserEditor({ showSuccess, showError, setAuth }) {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]); // State to hold roles
  const [selectedRole, setSelectedRole] = useState(""); // State for selected role
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
        const rolesData = Array.isArray(response.data.role)
          ? response.data.role
          : [];
        setRoles(rolesData);
        setSelectedRole(response.data.role);
      })
      .catch((error) => console.log(error));
  }, []);

  const onUserUpdate = async (e) => {
    e.preventDefault();
    console.log("Updating user");
    console.log("Fetched user data:", user);

    const updatedUser = {
      ...user,
      firstName,
      lastName,
      fullName,
      email,
      role: selectedRole,
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
        setAuth(response.data);
        localStorage.setItem("auth", JSON.stringify(response.data));
        navigate("/users");
      } else {
        showError(response.data.message);
        setAuth(null);
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
    <div className="parent">
      <h1 className="text-center">Edit User</h1>
      <form onSubmit={(e) => onUserUpdate(e)}>
        <div className="form-group ">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group ">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Choose your roles:</label>
          <div id="role">
            {roles.map((role, index) => (
              <div key={index} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`role-${index}`}
                  value={role}
                  checked={selectedRole.includes(role)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRole([...selectedRole, role]); // Add role to selected list
                    } else {
                      setSelectedRole(selectedRole.filter((r) => r !== role)); // Remove role from selected list
                    }
                  }}
                />
                <label htmlFor={`role-${index}`} className="form-check-label">
                  {role}
                </label>
              </div>
            ))}
          </div>
        </div>

        <br />
        <NavLink to="/users">
          <button type="submit" className="btn btn-primary">
            Update
          </button>
        </NavLink>
        <button
          type="button"
          className="btn btn-warning text-black"
          onClick={(e) => cancelEdit(e)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
