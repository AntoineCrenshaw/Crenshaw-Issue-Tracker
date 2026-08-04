import "../components/RegisterUserForm.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { applyBootstrapValidation } from "../utils/applyBootstrapValidation";

export default function RegisterUserForm({ showSuccess, showError, setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    applyBootstrapValidation();
  }, []);

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:2024/api/users/register",
        { email, password, givenName, familyName },
        { withCredentials: true },
      );

      if (response.status === 200) {
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
    } catch (err) {
      console.log(`Error Block ${JSON.stringify(err.response.data)}`);
      if (err.response.data.error) {
        err.response.data.error.forEach((error) => {
          showError(error.message);
        });
      }
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-box">
          <h1 className="register-title">Register</h1>
          <form
            onSubmit={handleSubmit}
            className="register-form needs-validation"
            noValidate
          >
            <div className=" mb-3">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                className={`form-control ${
                  email === ""
                    ? ""
                    : email.includes("@")
                      ? "is-valid"
                      : "is-invalid"
                }`}
                id="email"
                placeholder="ENTER EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="valid-feedback">Looks good!</div>
              <div className="invalid-feedback">
                Please enter a valid email.
              </div>
            </div>
            <div className=" mb-3">
              <label
                htmlFor="password"
                className={`form-label ${password.length > 5 ? "is-valid" : "is-invalid"}`}
              >
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text" id="password-addon">
                  <i className="bi bi-lock-fill input-icon"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  minLength={6}
                  className="form-control"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="input-group-text"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                    }`}
                  ></i>
                </span>
              </div>
              <div className="valid-feedback">Looks good!</div>
              <div className="invalid-feedback">
                Please enter a valid 6 or more character password.
              </div>
            </div>
            <div className=" mb-3">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className=" mb-3">
              <label htmlFor="givenName">First Name</label>
              <input
                type="text"
                className="form-control"
                minLength={3}
                id="givenName"
                placeholder="Enter first name"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                required
              />
              <div className="valid-feedback">Looks good!</div>
              <div className="invalid-feedback">
                Please enter a valid 3 or more character first name.
              </div>
            </div>
            <div className=" mb-3">
              <label htmlFor="familyName">Last Name</label>
              <input
                type="text"
                className="form-control"
                minLength={3}
                id="familyName"
                placeholder="Enter last name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
              />
              <div className="valid-feedback">Looks good!</div>
              <div className="invalid-feedback">
                Please enter a valid 3 or more character last name.
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Sign Up
            </button>
            <div className="text-center mt-3">
              <NavLink to="/login">
                <span>Already have an account? Sign In here</span>
              </NavLink>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
