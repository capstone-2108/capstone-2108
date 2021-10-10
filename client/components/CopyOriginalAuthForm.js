import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import { authenticate } from "../store";
import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { ThemeProvider, Typography, createTheme } from "@material-ui/core";
import { loginSuccess } from "../store/auth";
import { useHistory } from "react-router-dom";
import desktopImage from "../../public/images/croppedCliffs1.jpeg";

const theme = createTheme({
  typography: {
    fontFamily: "Cinzel Decorative"
  }
});

const AuthForm = (props) => {
  const { name, displayName, error } = props;
  const [email, setEmail] = useState("cody@charm.com");
  const [password, setPassword] = useState("123");
  const [firstName, setFirstName] = useState("Cody");

  const [snackBarWarningOpen, setSnackBarWarningOpen] = useState(false);
  const [snackBarErrorOpen, setSnackBarErrorOpen] = useState(false);

  // useEffect(() => {
  //   document.body.style.backgroundColor = "#5c5005";
  // });

  const handleWarningClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBarWarningOpen(false);
  };
  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBarErrorOpen(false);
  };

  const history = useHistory();
  const routeChange = () => {
    let path = `/game`;
    history.push(path);
  };

  const dispatch = useDispatch();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (name === "signup") {
      const successLogIn = await dispatch(authenticate(name, { email, password, firstName }));
      console.log("success login", successLogIn);
      if (successLogIn) {
        routeChange();
      } else {
        setSnackBarErrorOpen(true);
      }
    } else {
      const successLogIn = await dispatch(authenticate(name, { email, password }));
      if (successLogIn) {
        routeChange();
      } else {
        setSnackBarWarningOpen(true);
      }
    }
  };

  return (
    <Grid
      item
      xs={12}
      style={{
        margin: "0 auto",
        backgroundColor: "#211510",
      }}>
      <Snackbar
        open={snackBarErrorOpen}
        autoHideDuration={3000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: "100%" }}>
          This email address is already associated with an account
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackBarWarningOpen}
        autoHideDuration={3000}
        onClose={handleWarningClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleWarningClose} severity="warning" sx={{ width: "100%" }}>
          Incorrect Email/Password
        </Alert>
      </Snackbar>
      <div id="loginContainer">
        <img src={desktopImage} id="wallpaper" />
        <ThemeProvider theme={theme}>
          <Typography variant="h1" gutterBottom id="title">
            Game Title
          </Typography>
          <Grid container direction="row" justifyContent="center" alignItems="center">
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
              style={{ width: "50%" }}>
              <Box style={{ margin: 25, width: "100%" }}>
                <form onSubmit={handleSubmit} name={name}>
                  <Card
                    style={{
                      display: "flex",
                      border: "8px solid #966a2c",
                      margin: "10px",
                      padding: "5px",
                      borderRadius: "10px",
                      backgroundColor: "#e3dbb3"
                    }}>
                    <Box style={{ margin: 0, width: "250px", padding: "1em" }} htmlFor="Email">
                      <Typography>
                        <h1>Email</h1>
                      </Typography>
                    </Box>
                    <TextField
                      value={email}
                      onChange={(evt) => {
                        setEmail(evt.target.value);
                      }}
                      name="email"
                      type="text"
                      style={{ flexGrow: 1, justifyContent: "center", alignItems: "flex-start" }}
                      InputProps={{ disableUnderline: true }}
                    />
                  </Card>
                  <Card
                    style={{
                      display: "flex",
                      border: "8px solid #966a2c",
                      margin: "10px",
                      padding: "5px",
                      borderRadius: "10px",
                      backgroundColor: "#e3dbb3"
                    }}>
                    <Box style={{ margin: 0, width: "250px", padding: "1em" }} htmlFor="password">
                      <Typography>
                        <h1>Password</h1>
                      </Typography>
                    </Box>
                    <TextField
                      value={password}
                      onChange={(evt) => {
                        setPassword(evt.target.value);
                      }}
                      InputProps={{ disableUnderline: true }}
                      style={{ flexGrow: 1, justifyContent: "center", alignItems: "flex-start" }}
                      name="password"
                      type="password"
                    />
                  </Card>
                  {name === "signup" && (
                    <Card
                      style={{
                        display: "flex",
                        border: "8px solid #966a2c",
                        margin: "10px",
                        padding: "5px",
                        borderRadius: "10px",
                        backgroundColor: "#e3dbb3"
                      }}>
                      <Box
                        htmlFor="First Name"
                        style={{ margin: 0, width: "250px", padding: "1em" }}>
                        <Typography>
                          <h1>First Name</h1>
                        </Typography>
                      </Box>
                      <TextField
                        value={firstName}
                        onChange={(evt) => {
                          setFirstName(evt.target.value);
                        }}
                        name="firstName"
                        type="text"
                        InputProps={{ disableUnderline: true }}
                        style={{ flexGrow: 1, justifyContent: "center", alignItems: "flex-start" }}
                      />
                    </Card>
                  )}
                  <Box style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      style={{
                        margin: "10px",
                        border: "3px solid #966a2c",
                        backgroundColor: "#e3dbb3",
                        textTransform: "lowercase"
                      }}
                      type="submit">
                      <Typography>
                        <h3>{displayName}</h3>
                      </Typography>
                    </Button>
                  </Box>
                  {name === "login" ? (
                    <Link to="/signup" style={{ textDecoration: "none" }}>
                      <Button
                        style={{
                          margin: "10px",
                          border: "3px solid #966a2c",
                          backgroundColor: "#e3dbb3",
                          textTransform: "lowercase"
                        }}
                        type="submit">
                        <Typography>
                          <h3>New Player? Sign Up Here</h3>
                        </Typography>
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/" style={{ textDecoration: "none" }}>
                      <Button
                        style={{
                          margin: "10px",
                          border: "3px solid #966a2c",
                          backgroundColor: "#e3dbb3",
                          textTransform: "lowercase"
                        }}
                        type="submit">
                        <Typography>
                          <h3>Back to Login</h3>
                        </Typography>
                      </Button>
                    </Link>
                  )}
                  {error && error.response && <Box> {error.response.data} </Box>}
                </form>
              </Box>
            </Grid>
          </Grid>
        </ThemeProvider>
      </div>
    </Grid>
  );
};

const mapLogin = (state) => {
  return {
    name: "login",
    displayName: "Login",
    error: state.auth.error
  };
};

const mapSignup = (state) => {
  return {
    name: "signup",
    displayName: "Sign Up",
    error: state.auth.error
  };
};

export const Login = connect(mapLogin)(AuthForm);
export const Signup = connect(mapSignup)(AuthForm);
