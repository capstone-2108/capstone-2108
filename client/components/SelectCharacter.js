import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CardMedia, makeStyles, CardContent, CardActionArea } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import { useHistory } from "react-router-dom";
import { fetchTemplateCharacters } from "../store/templateCharacters";
import { setChosenCharacter } from "../store/chosenCharacter";

const useStyles = makeStyles(() => ({
  cardArea: {
    marginTop: "5%"
  },
  root: {
    maxWidth: "100%",
    margin: "auto",
    fontFamily: "Cinzel Decorative",
    backgroundColor: "#211511",
    color: "#f5f3e6"
  },
  media: {
    height: 250,
    width: "100%",
    paddingTop: 0
  },
  heading: {
    paddingTop: 75,
    marginTop: 0,
    fontFamily: "Cinzel Decorative",
    textAlign: "center",
    color: "#e8e5d3"
  }
}));

const selectCharacter = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(false)

  const history = useHistory();
  const routeChange = (character) => {
    console.log('CHARACTER', character)
    dispatch(setChosenCharacter(character))
    let path = `/select/${character.id}`;
    history.push(path);
  };

  useEffect(() => {

    dispatch(fetchTemplateCharacters())
  }, [])

  const templates = useSelector(state => state.templateCharacters)

  console.log('STATE', useSelector((state) => state))
  return (
    <div className="selectContainer">
      <h1 className={classes.heading}>Select Your Character</h1>
      <Grid container justifyContent="space-evenly">
        {templates.map((character) => (
          <Grid item key={character.id} xs={12} md={4} lg={2} className={classes.cardArea}>
            <Card>
              <CardActionArea className={classes.root} onClick={() => routeChange(character)}>
                <CardMedia
                  className={classes.media}
                  component="img"
                  image={character.portrait}
                  alt={character.name}
                />
                <CardContent>
                  <h3>{character.name}</h3>
                  <h5>{character.description}</h5>
                  <h6>Strength: {character.baseStrength}</h6>
                  <h6>Intelligence: {character.baseIntelligence}</h6>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default selectCharacter;
