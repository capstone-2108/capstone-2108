/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import { authenticate } from "../store";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core";
import LockedOutlinedIcon from "@material-ui/icons/LockOutlined";
import { useHistory } from "react-router-dom";
import desktopImage from "../../public/images/colorfulTreeLandscape.jpeg";

const useStyles = makeStyles((theme) => ({
  bkimg: {
    minHeight: "100vh",
    backgroundImage: `url(${desktopImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  form: {
    height: "60vh",
    width: 350,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#211510",
    fontFamily: "Cinzel Decorative",
    padding: 20
  },
  text: {
    color: "#ffff"
    // textTransform: "lowercase"
  }
}));


const AuthForm = (props) => {
  const classes = useStyles();

  const { name, displayName, error } = props;
  const [email, setEmail] = useState("cody@charm.com");
  const [password, setPassword] = useState("123");
  const [firstName, setFirstName] = useState("Cody");

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
    <Grid className={classes.bkimg}>
    <Paper elevation={15} className={classes.form}>
      <Grid align="center" className={classes.text}>
        <Avatar style={{ backgroundColor: "#414dbf" }}>
          <LockedOutlinedIcon />
        </Avatar>
        <h2>Login</h2>
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
      >

      </TextField>
      </Box>
    </Paper>
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
