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
  const [email, setEmail] = useState("");
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
      role: user.role || [],
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
    } catch (e) {
      console.log(`catch block: ${JSON.stringify(e.response.data)}`);
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
      <form onSubmit={(e) => onUserUpdate(e)} className="editorForm">
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
        <div className="form-group">
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
        <button type="submit" className="btn btn-primary">
          Update
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
  );
}
