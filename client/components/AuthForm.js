/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { connect, useDispatch } from "react-redux";
import { authenticate } from "../store";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/core";
import LockedOutlinedIcon from "@material-ui/icons/LockOutlined";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  form: {
    height: 450,
    top: "50%",
    width: 350,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    fontFamily: "Cinzel Decorative",
    padding: 20,
    borderRadius: "8%"
  },
  text: {
    color: "#f5f3e6",
    fontFamily: "Cinzel Decorative"
  },
  textfield: {
    background: "rgb(150,192,213)",
    background: "linear-gradient(180deg, rgba(150,192,213,1) 0%, rgba(109,152,194,1) 100%)",
    // backgroundColor: "#adbe39",
    marginBottom: 20,
    color: "primary",
    textShadow: "3px 3px #888"
  },
  btn: {
    fontFamily: "Cinzel Decorative",
    backgroundColor: "#5194b6",
    color: "#f5f3e6",
    marginTop: 20,
    "&:hover": {
      backgroundColor: "#344a95"
    }
  },
  signup: {
    color: "#f5f3e6",
    paddingTop: 20
  },
  titleGridItem: {
    height: "200px",
    display: "flex",
    alignItems: "center"
  }
}));

const AuthForm = (props) => {
  const classes = useStyles();

  const { name, displayName, error } = props;
  const [email, setEmail] = useState("fox@mmo.com");
  const [password, setPassword] = useState("123");
  const [firstName, setFirstName] = useState("");

  const [snackBarWarningOpen, setSnackBarWarningOpen] = useState(false);
  const [snackBarErrorOpen, setSnackBarErrorOpen] = useState(false);

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
    if (name === "signup") {
      let path = `/select`;
      history.push(path);
    } else {
      let path = "/game";
      history.push(path);
    }
  };

  const dispatch = useDispatch();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (name === "signup") {
      const successLogIn = await dispatch(authenticate(name, { email, password, firstName }));
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
    <div className="authForm">
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
      <Grid container alignContent="center" direction="column">
        <Grid item className={classes.titleGridItem}>
          <div className="title">World of Arcana</div>
        </Grid>
        <Grid item>
          <Card elevation={15} className={classes.form}>
            <Grid align="center" className={classes.text}>
              <Avatar style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}>
                <LockedOutlinedIcon />
              </Avatar>
              <h2>{displayName}</h2>
            </Grid>
            <Box component="form" onSubmit={handleSubmit} name={name}>
              <TextField
                required
                fullWidth
                label="Email Address"
                value={email}
                onChange={(evt) => {
                  setEmail(evt.target.value);
                }}
                name="email"
                type="text"
                className={classes.textfield}
                InputLabelProps={{
                  className: classes.text
                }}
                variant="outlined"></TextField>
              <TextField
                required
                fullWidth
                label="Password"
                value={password}
                onChange={(evt) => {
                  setPassword(evt.target.value);
                }}
                name="password"
                // styling goes to hell if I add this
                // so currently, the password is not hidden when typing
                // type="password"
                className={classes.textfield}
                InputLabelProps={{
                  className: classes.text
                }}
                variant="outlined"></TextField>
              {name === "signup" && (
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(evt) => {
                    setFirstName(evt.target.value);
                  }}
                  name="firstName"
                  type="text"
                  className={classes.textfield}
                  InputLabelProps={{
                    className: classes.text
                  }}
                  variant="outlined"></TextField>
              )}
              <Grid align="center">
                <Button type="submit" className={classes.btn}>
                  {displayName}
                </Button>
              </Grid>
              {name === "login" && (
                <Link to="signup" style={{ textDecoration: "none" }}>
                  <Grid align="center" className={classes.signup}>
                    <p>New player? Sign Up Here</p>
                  </Grid>
                </Link>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </div>
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
