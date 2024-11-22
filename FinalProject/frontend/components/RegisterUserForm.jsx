import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import _ from "lodash";

export default function RegisterUserForm({ showSuccess, showError, setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:2024/api/users/register",
        { email, password, givenName, familyName },
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log(response.data);
        if (response.data.message === "Email already exists") {
          setAuth(null);
          showError(response.data.message);
        } else {
          setAuth(response.data);
          showSuccess("User registered successfully");
          localStorage.setItem("auth", JSON.stringify(response.data));
          navigate("/bugs");
        }
      }
    } catch (error) {
      showError("Registration failed. Please try again.", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group mb-3">
        <label htmlFor="exampleInputEmail1">Email address:</label>
        <input
          type="email"
          className="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Enter email"
          value={email}
          onChange={(evt) => setEmail(evt.target.value)}
          required
        />
        <small id="emailHelp" className="form-text text-muted">
          We&apos;ll never share your email with anyone else.
        </small>
      </div>
      <div className="form-group mb-3">
        <label htmlFor="exampleInputPassword1">Password:</label>
        <input
          type="password"
          className="form-control"
          id="exampleInputPassword1"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group mb-3">
        <label htmlFor="exampleInputPassword2">Confirm Password:</label>
        <input
          type="password"
          className="form-control"
          id="exampleInputPassword2"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group mb-3">
        <label htmlFor="exampleInputName">Given Name:</label>
        <input
          type="text"
          className="form-control"
          id="exampleInputName"
          placeholder="First Name"
          value={givenName}
          onChange={(e) => setGivenName(e.target.value)}
          required
        />
      </div>
      <div className="form-group mb-3">
        <label htmlFor="exampleInputSurname">Family Name:</label>
        <input
          type="text"
          className="form-control"
          id="exampleInputSurname"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="Last Name"
          required
        />
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="exampleCheck1"
        />
        <label className="form-check-label" htmlFor="exampleCheck1">
          Remember me
        </label>
      </div>
      <button type="submit" className="btn btn-primary mt-3">
        Submit
      </button>
    </form>
  );
}
