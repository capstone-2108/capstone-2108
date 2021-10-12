import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import { makeStyles, Card, Grid, Box, TextField, Button } from '@material-ui/core';
import { createPlayerCharacter } from '../store/player';

const useStyles = makeStyles(() => ({
  form: {
    height: 240,
    top: "50%",
    width: 350,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#211510",
    fontFamily: "Cinzel Decorative",
    padding: 20,
    color: "#e8e5d3"
  },
  textfield: {
    backgroundColor: "#872441",
    marginBottom: 20,
    marginTop: 10
  },
  btn: {
    fontFamily: "Cinzel Decorative",
    backgroundColor: "#872441",
    color: "#f5f3e6",
    marginTop: 10,
    "&:hover": {
      backgroundColor: "#344a95"
    }
  },
}))

const editCharacter = () => {
  console.log('STATE', useSelector((state) => state))
  const classes = useStyles();
  const character = useSelector(state => state.chosenCharacter);
  const [characterName, setCharacterName] = useState("");
  const dispatch = useDispatch();
  const history = useHistory()

  const handleSubmit = (evt) => {
    evt.preventDefault();
    dispatch(createPlayerCharacter(characterName, character))
    // Re-route to game
    // let path = "/game"
    // history.push(path)
  }

  return (
    <div className="selectContainer">
      <Card elevation={15} className={classes.form}>
        <Grid align="center">
          <h2>Name Your {character.name}</h2>
        </Grid>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            value={characterName}
            onChange={(evt) => {
              setCharacterName(evt.target.value)
            }}
            name="characterName"
            className={classes.textfield}
            InputLabelProps={{
              className: classes.text
            }}
            variant="outlined"
          >
          </TextField>
          <Grid align="center">
            <Button type="submit" className={classes.btn}>
              Submit
            </Button>
          </Grid>
        </Box>
      </Card>
    </div>
  )
}

export default editCharacter
