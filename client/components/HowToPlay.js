import React from 'react';
import { makeStyles, Card, Grid, Box, Button } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  form: {
    width: 550,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // backgroundColor: "rgba(0, 0, 0, 0.8)",
    backgroundColor: "#f6f6f6",
    fontFamily: "Cinzel Decorative",
    padding: 20,
    color: "#00000",
    borderRadius: "8%"
  },
  btn: {
    fontFamily: "Cinzel Decorative",
    backgroundColor: "#5194b6",
    color: "#00000",
    marginTop: 10,
    "&:hover": {
      backgroundColor: "#77963f"
    },
    textTransform: "lowercase"
  },
}))

const HowToPlay = (props) => {
  const classes = useStyles();

  return (
    <div >
      <Card elevation={15} className={classes.form}>
        <Grid align="center">
          <h2>How to Play</h2>
        </Grid>
        <Box component="div">
          <Grid align="center">
            <img src="/images/controls2.jpeg"/>
            <Button type="submit" onClick={props.handleClose} className={classes.btn}>
              Lets Play!
            </Button>
          </Grid>
        </Box>
      </Card>
    </div>
  )
}

export default HowToPlay
