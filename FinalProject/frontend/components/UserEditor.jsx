import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./UserEditor.css";

export default function UserEditor({ showSuccess, showError, setAuth }) {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const navigate = useNavigate();

  // Display the user details on open of the page
  useEffect(() => {
    axios
      .get(`http://localhost:2024/api/users/${id}`, { withCredentials: true })
      .then((response) => {
        console.log(response.data.users);
        setUser(response.data);
        setFirstName(response.data.givenName);
        setLastName(response.data.familyName);
        setFullName(response.data.fullName);
        setEmail(response.data.email);
        setPassword(response.data.password);
        setRole(response.data.role);
      })
      .catch((error) => console.log(error));
  }, []);

  const onUserUpdate = async (e) => {
    e.preventDefault();
    console.log("Updating user");

    const updatedUser = {
      ...user,
      firstName,
      lastName,
      fullName,
      password,
      email,
      role,
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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="parent">
      <h1 className="text-center">Edit User</h1>
      <form onSubmit={onUserUpdate} className="editorForm">
        <div className="form-group editEmail">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group editFullName">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="form-group editFirstName">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-group editLastName">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            className="form-control"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-group editPassword">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group editRole">
          <label htmlFor="role">Role</label>
          <input
            type="text"
            className="form-control"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update
        </button>
      </form>
    </div>
  );
}
