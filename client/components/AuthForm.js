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
import makeStyles from "@material-ui/core/styles/makeStyles";
import LockedOutlinedIcon from "@material-ui/icons/LockOutlined";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  form: {
    width: 350,
    position: "flex",
    flex: 2,
    margin: "auto",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    fontFamily: "Cinzel Decorative",
    padding: 20,
    borderRadius: "8%"
  },
  text: {
    color: "#d8eaec",
    fontFamily: "Cinzel Decorative"
  },
  textfield: {
    "& .MuiInputBase-root": {
      // background: "linear-gradient(180deg, rgba(150,192,213,1) 0%, rgba(109,152,194,1) 100%)"
      background: "#5194b6"
    },
    marginBottom: 20,
    "& label.Mui-focused": {
      color: "#d8eaec"
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#d8eaec"
    },
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: "#d8eaec"
      },
      "&.Mui-focused fieldset": {
        borderColor: "#d8eaec"
      }
    }
  },
  btn: {
    fontFamily: "Cinzel Decorative",
    backgroundColor: "#5194b6",
    color: "#f5f3e6",
    marginTop: 20,
    "&:hover": {
      backgroundColor: "#77963f"
    }
  },
  signup: {
    color: "#d8eaec",
    paddingTop: 20,
    "&:hover": {
      textDecoration: "underline"
    }
  },
  titleGridItem: {
    display: "flex",
    alignItems: "center",
    flex: 0.6
  }
}));

const AuthForm = (props) => {
  const classes = useStyles();

  const { name, displayName, error } = props;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      history.push({
        pathname: path,
        state: { newUser: false }
      });
    }
  };

  const dispatch = useDispatch();

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (name === "signup") {
      const successLogIn = await dispatch(authenticate(name, { email, password, firstName }, history));
      if (successLogIn) {
        routeChange();
      } else {
        setSnackBarErrorOpen(true);
      }
    } else {
      const successLogIn = await dispatch(authenticate(name, { email, password }, history));
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
          Incorrect Email/Password OR Already Logged In
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
                type="password"
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
                    <p>New player? <span className="sign-up-emphasize">Sign Up!</span></p>
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
