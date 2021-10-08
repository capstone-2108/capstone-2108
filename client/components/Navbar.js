/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { logout } from "../store";
import NavbarMenu from "./NavbarMenu";
import AppBar from "@material-ui/core/AppBar";
import ToolBar from "@material-ui/core/Toolbar";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  navbar: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "white",
    paddingTop: "5px",
    paddingBottom: "5px",
    paddingLeft: "1%",
    paddingRight: "1%",
    boxShadow: "none",
    borderBottom: "2px solid gray"
  },
  toolBar: {
    width: "100%",
    display: "flex",
    flexDirection: "row"
  },
  link: {
    color: "#484848",
    margin: "2%",
    marginRight: "3%",
    "&:hover": {
      color: "#e71e07",
      textDecoration: "none",
      transition: "all .4s ease"
    },
    display: "flex",
    flexFlow: "row nowrap",
    whiteSpace: "nowrap"
  },
  links: {
    width: "75%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2
  },
  linkLeft: {
    display: "flex",
    width: "30%",
    justifyContent: "space-around",
    alignItems: "center"
  },
  logo: {
    zIndex: 3,
    marginRight: "3%"
  },
  linkRight: {
    display: "flex",
    width: "40%",
    justifyContent: "space-around",
    alignItems: "center"
  },
  badge: {
    marginRight: "4%",
    marginBottom: "15px"
  },
  total: {},
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#484848",
    opacity: ".8",
    "&:hover": {
      backgroundColor: "#484848",
      opacity: ".7"
    },
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto"
    },
    zIndex: 4
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  inputRoot: {
    color: "inherit"
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch"
      }
    }
  }
}));

const Navbar = ({ handleClick, isLoggedIn }) => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        className={styles.navbar}
        style={{ backgroundColor: "white !important" }}>
        <ToolBar className={styles.toolBar}>
          <RouterLink to="/" className={styles.logo}>
            Super Cool MMO
          </RouterLink>
          <div className={styles.links}>
            <div className={styles.linkLeft}>
              <NavbarMenu />
            </div>
          </div>
        </ToolBar>
      </AppBar>
    </Box>
  );
};

/**
 * CONTAINER
 */
const mapState = (state) => {
  return {
    isLoggedIn: state.auth.loggedIn,
  };
};

const mapDispatch = (dispatch) => {
  return {
    handleClick() {
      dispatch(logout());
    }
  };
};

export default connect(mapState, mapDispatch)(Navbar);
