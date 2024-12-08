import {
  Avatar,
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Link,
  Grid2,
} from "@mui/material";
import "../Components/LoginForm.css";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const LoginForm = ({ showSuccess, showError, setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    (function () {
      "use strict";

      var forms = document.querySelectorAll(".needs-validation");

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
    console.log("Form submitted");

    try {
      let response = await axios.post(
        "http://localhost:2023/api/users/login",
        { email, password },
        { withCredentials: true }
      );
      {
        console.log(response);
      }
      if (response.status === 200) {
        console.log(response.data);
        if (response.data.message === " Invalid email or password") {
          setAuth(null);
          showError("Invalid username or password");
        }
      } else {
        setAuth(response.data);
        showSuccess(response.data.message);
        localStorage.setItem("auth", JSON.stringify(response.data));
        navigate("/users");
      }
    } catch (e) {
      console.log(`Errror Block ${JSON.stringify(e.response.data)}`);
      showError("Invalid username or password");
    }
  };

  return (
    <>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 2, mt: 6, height: "350px" }}>
          <Avatar sx={{ m: "auto", bgcolor: "secondary.main", mb: 1 }}>
            🐶
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ textAlign: "center" }}>
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              placeholder="Enter email"
              fullWidth
              required
              autoFocus
              sx={{ mb: 2 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              placeholder="Enter password"
              fullWidth
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link component={RouterLink} to="/users">
              <Button type="submit" variant="contained" sx={{ mt: 1, mb: 1 }}>
                Sign In
              </Button>
            </Link>
          </Box>
          <Box component={Grid2} container justifyContent="space-between">
            <Box item>
              <Link component={RouterLink} to="/signup">
                Dont have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default LoginForm;
