import { Button, Container, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import "../App.css";
const HomePage = () => {
  return (
    <Container
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography
          variant="h1"
          align="center"
          fontFamily={"Roboto Flex"}
          sx={{ color: "primary.main", my: 1 }}
        >
          Tail Runner
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "primary.subtitle" }}>
          A dog walking service
        </Typography>
        <Typography
          variant="h1"
          align="center"
          sx={{
            "&:hover": { position: "relative", top: "5px", left: "5px" },
            bgcolor: "lightblue",
            width: "fit-content",
          }}
        >
          <Link to="/login">
            <Button sx={{ padding: "10px 20px" }}>Get Started</Button>
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
