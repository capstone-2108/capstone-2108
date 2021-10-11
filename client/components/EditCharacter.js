import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, Card, Grid, Box, TextField } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  heading: {
    paddingTop: 75,
    marginTop: 0,
    fontFamily: "Cinzel Decorative",
    textAlign: "center",
  },
  form: {
    height: 250,
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
  text: {
    color: "#f5f3e6",
    fontFamily: "Cinzel Decorative"
  },
  textfield: {
    backgroundColor: "#872441",
    marginBottom: 20
  },
}))

const editCharacter = () => {
  const classes = useStyles();
  const character = useSelector(state => state.chosenCharacter);

  const [characterName, setCharacterName] = useState("")

  return (
    <div className="selectContainer">
      <Card elevation={15} className={classes.form}>
        <Grid align="center">
          <h2>Name Your {character.name}</h2>
        </Grid>
        <Box component="form" onSubmit={() => console.log('submitted')} className={classes.text}>
          <TextField
            required
            fullWidth
            value={characterName}
            onChange={(evt) => {
              setCharacterName(evt.target.value)
            }}
            name="characterName"
            className={classes.textField}
            InputLabelProps={{
              className: classes.text
            }}
            variant="outlined"
          >
          </TextField>
        </Box>
      </Card>
    </div>
  )
}

export default editCharacter
