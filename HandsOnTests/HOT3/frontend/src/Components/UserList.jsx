import { Typography, Box, Container, Paper, Link } from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";

export const UserList = ({ showError, showSuccess }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:2023/api/users", {
        withCredentials: true,
      });
      console.log(response.data);
      setUsers(response.data);
      showSuccess(response.data.message);
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Error fetching users";
      console.error(e);
      showError(errorMessage);
    }
    setIsLoading(false);
  };

  {
    isLoading && <Typography variant="h6">Loading...</Typography>;
  }

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ my: 2, textAlign: "center" }}>
          Users
        </Typography>
        {!isLoading && users.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              justifyContent: "center",
              alignContent: "center",
              flexWrap: "wrap",
            }}
          >
            {users.map((user) => (
              <Link
                component={RouterLink}
                to={`/users/${user._id}`}
                key={user._id}
              >
                <Paper
                  variant="h6"
                  sx={{
                    my: 2,
                    padding: "3.5rem",
                    "&:hover": {
                      position: "relative",
                      right: "5px",
                      bottom: "5px",
                    },
                    flex: "1 1 300px",
                  }}
                >
                  <Typography variant="h4">{user.fullName}</Typography>
                  <Typography variant="subtitle1">{user.email}</Typography>
                </Paper>
              </Link>
            ))}
          </Box>
        ) : (
          <Typography variant="subtitle1">No users found</Typography>
        )}
      </Container>
    </>
  );
};
