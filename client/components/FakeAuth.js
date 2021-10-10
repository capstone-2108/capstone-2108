import React, { useState } from "react";
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
import {
  ThemeProvider,
  Typography,
  createTheme,
  makeStyles,
  CssBaseline,
  Paper,
  Avatar
} from "@material-ui/core";
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

const AuthForm = () => {
  const classes = useStyles();

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
