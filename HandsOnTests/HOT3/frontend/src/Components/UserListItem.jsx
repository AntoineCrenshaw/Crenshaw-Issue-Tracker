import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Box,
} from "@mui/material";

export const UserListItem = ({ showSuccess, showError }) => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    console.log("ID from URL: ", id);
    axios
      .get(`http://localhost:2023/api/users/${id}`, { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        setUser(response.data);
      })
      .catch((error) => {
        console.error(error);
        showError("Error fetching user");
      });
    setIsLoading(false);
  }, [id, showError]);

  const handleConfirmDelte = async (e, id) => {
    console.log("Deleting user with ID: ", id);
    e.preventDefault();
    try {
      await axios.delete(`http://localhost:2023/api/users/${id}`, {
        withCredentials: true,
      });
      showSuccess("User deleted successfully");
      setShowModal(false);
      navigate("/users");
    } catch (e) {
      console.error(e);
      showError("Error deleting user");
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <>
      {isLoading && <Typography variant="h6">Loading...</Typography>}
      {user && (
        <Paper
          key={user._id}
          variant="h6"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            my: 2,
            padding: "3.5rem",
            "&:hover": {
              position: "relative",
              right: "5px",
              bottom: "5px",
              cursor: "pointer",
            },
          }}
        >
          <Typography variant="h4">Full Name: {user.fullName}</Typography>
          <Typography variant="subtitle1">Email: {user.email}</Typography>
          <Typography variant="subtitle1">Roles</Typography>
          {user.role && user.role.length > 0 ? (
            user.role.map((role, index) => (
              <>
                <Box sx={{ display: "inline-flex" }}>
                  <Chip
                    key={index}
                    sx={{
                      maxWidth: "fit-content",
                    }}
                    label={`${role}`}
                    color="primary"
                  />
                </Box>
              </>
            ))
          ) : (
            <span className="badge bg-primary me-1">No Roles</span>
          )}
          <Typography variant="subtitle1">
            Given Name: {user.givenName}
          </Typography>
          <Typography variant="subtitle1">
            Family Name: {user.familyName}
          </Typography>
          <Box>
            <Chip
              label="Delete User"
              color="error"
              onClick={() => handleUserClick(user)}
            />
          </Box>
        </Paper>
      )}
      {showModal && selectedUser && (
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1">
              Are you sure you want to delete {selectedUser.fullName}?
            </Typography>
            <Typography variant="subtitle2">
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={(e) => handleConfirmDelte(e, selectedUser._id)}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
