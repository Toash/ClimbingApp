import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "scenes/homePage";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";



function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);



  return (
    <div className="app">
      <BrowserRouter>
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
