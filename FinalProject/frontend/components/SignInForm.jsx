import "../components/SignInForm.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const SignInForm = ({ showSuccess, showError, setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Example starter JavaScript for disabling form submissions if there are invalid fields
    (function () {
      "use strict";

      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.querySelectorAll(".needs-validation");

      // Loop over them and prevent submission
      Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener(
          "submit",
          function (event) {
            if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();
            }

            form.classList.add("was-validated");
          },
          false
        );
      });
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response = await axios.post(
        "http://localhost:2024/api/users/login",
        { email, password },
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log(response.data);
        if (response.data.message === "Invalid email or password") {
          setAuth(null);
          // setMessage(response.data.message);
          showError(response.data.message);
        } else {
          setAuth(response.data);
          showSuccess(response.data.message);
          localStorage.setItem("auth", JSON.stringify(response.data));
          navigate("/bugs");
        }
      }
    } catch (err) {
      // Error from the server (HTTP status code, response data, etc.)
      // showError(
      //   `Server Error: ${err.response.status} - ${err.response.statusText}`
      // );
      showError(`Details: ${JSON.stringify(err?.response?.data?.error)}`);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">Sign In</h1>
          <form
            className="login-form needs-validation"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="input-group">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-group">
                  <span className="input-group-text" id="email-addon">
                    <i className="bi bi-envelope-fill input-icon"></i>
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control input-field"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="valid-feedback">Looks good!</div>
                <div className="invalid-feedback">
                  Please enter a valid email.
                </div>
              </div>
            </div>
            <div className="input-group">
              <div className="mb-3">
                <label
                  htmlFor="password"
                  className="form-label"
                  aria-autocomplete="current-password"
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
                    className="form-control input-field"
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <span onClick={() => setShowPassword(!showPassword)}>
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                      }`}
                    ></i>
                  </span>
                </div>
                <div className="invalid-feedback">
                  Please enter a valid 6 or more character password.
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Sign In
            </button>

            <NavLink to="/register">
              <span>Don&apos;t have an account? Register here</span>
            </NavLink>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
