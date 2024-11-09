import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./scenes/homePage/index.jsx";

import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme.js";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { SnackbarProvider } from "notistack";

function App() {
  const theme = createTheme(themeSettings("dark"));

  return (
    <div className="app">
      <BrowserRouter>
        {/* Pass the theme down for our mui components to use. */}
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={4} autoHideDuration={4500}>
            {/* Provide localziation information such as time zone / date format to child components */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CssBaseline />
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </LocalizationProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
