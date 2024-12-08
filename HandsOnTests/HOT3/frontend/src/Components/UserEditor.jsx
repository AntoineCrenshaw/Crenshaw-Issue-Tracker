import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";

export const UserEditor = ({ showSuccess, showError, setAuth }) => {
  const { id } = useParams();
  const [user, setUser] = useState([]);
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:2023/api/users/${id}`, { withCredentials: true })

      .then((response) => {
        console.log(response.data.users);
        setUser(response.data);
        setEmail(response.data.email);
        setRoles(response.data.role);
        setGivenName(response.data.givenName);
        setFamilyName(response.data.familyName);
        setFullName(response.data.fullName);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  const onUserUpdate = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const updatedUser = {
      ...user,
      email,
      roles,
      fullName,
      givenName,
      familyName,
    };

    delete updatedUser._id;

    try {
      let response = await axios.put(
        `http://localhost:2023/api/users/${id}`,
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
      console.log(`Errror Block ${JSON.stringify(e.response.data)}`);
      showError("Invalid username or password");
      console.error(e);
    }
  };

  const cancelEdit = (e) => {
    e.preventDefault();
    console.log("Cancelling edit and returning to users list");
    navigate("/users");
  };

  return (
    <>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 2, mt: 6, height: "fit-content" }}>
          <Typography component="h1" variant="h5" sx={{ textAlign: "center" }}>
            User - {user.id}
          </Typography>
          <Box
            component="form"
            onSubmit={(e) => onUserUpdate(e)}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              placeholder="Enter email"
              fullWidth
              autoFocus
              sx={{ mb: 2 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              placeholder="Roles"
              fullWidth
              sx={{ mb: 2 }}
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
            />
            <TextField
              placeholder="Enter First Name"
              fullWidth
              sx={{ mb: 2 }}
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
            />
            <TextField
              placeholder="Enter Last Name"
              fullWidth
              sx={{ mb: 2 }}
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
            <TextField
              placeholder="Enter Full Name"
              fullWidth
              sx={{ mb: 2 }}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Button
              type="button"
              className="btn btn-warning text-black"
              onClick={(e) => cancelEdit(e)}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn btn-warning text-black">
              Update
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};
