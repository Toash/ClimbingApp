import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./scenes/homePage/index.jsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme.js";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function App() {
  const theme = createTheme(themeSettings("dark"));

  return (
    <div className="app">
      <BrowserRouter>
        {/* Pass the theme down for our mui components to use. */}
        <ThemeProvider theme={theme}>
          {/* Provide localziation information such as time zone / date format to child components */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
