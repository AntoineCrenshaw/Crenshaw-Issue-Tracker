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

const RegisterForm = ({ showSuccess, showError, setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [fullName, setFullName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    try {
      let response = await axios.post(
        "http://localhost:2023/api/users/register",
        { email, password, fullName, givenName, familyName },
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
        navigate("/");
      }
    } catch (e) {
      console.log(`Errror Block ${JSON.stringify(e.response.data)}`);
      showError("Invalid username or password");
    }
  };

  return (
    <>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 2, mt: 6, height: "fit-content" }}>
          <Avatar sx={{ m: "auto", bgcolor: "secondary.main", mb: 1 }}>
            🐶
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ textAlign: "center" }}>
            Create Account
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
              sx={{ mb: 2 }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              placeholder="Enter First Name"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
            />
            <TextField
              placeholder="Enter Last Name"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
            <TextField
              placeholder="Enter Full Name"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 1, mb: 2 }}
            >
              Create Account
            </Button>
          </Box>
          <Box component={Grid2} container justifyContent="space-between">
            <Box item>
              <Link component={RouterLink} to="/login">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default RegisterForm;
