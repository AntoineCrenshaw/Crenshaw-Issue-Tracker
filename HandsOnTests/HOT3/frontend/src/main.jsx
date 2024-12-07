import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.jsx";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { blue, purple } from "@mui/material/colors";

let theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
      subtitle: "#D9D9D9",
    },
    secondary: {
      main: purple[600],
    },
  },
  typography: {
    h1: {
      fontSize: "6rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "4.5rem",
      fontWeight: 700,
    },
    h3: {
      fontSize: "3.2rem",
      fontWeight: 700,
    },
  },
});

theme = responsiveFontSizes(theme);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
