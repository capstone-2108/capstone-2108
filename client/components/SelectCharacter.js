import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CardMedia, makeStyles, CardContent, CardActionArea } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import { useHistory } from "react-router-dom";
import { fetchTemplateCharacters } from "../store/templateCharacters";
import { setChosenCharacter } from "../store/chosenCharacter";

const useStyles = makeStyles(() => ({
  root: {
    maxWidth: "100%",
    margin: "auto",
    fontFamily: "Cinzel Decorative",
    // backgroundColor: "#75735f",
    backgroundColor: "#bed4e6",
    color: "#312731"
  },
  media: {
    height: 250,
    width: "100%",
    paddingTop: 0
  },
}));

const selectCharacter = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(false);

  const history = useHistory();

  const routeChange = (character) => {
    dispatch(setChosenCharacter(character));
    let path = `/select/${character.id}`;
    history.push(path);
  };

  useEffect(() => {
    dispatch(fetchTemplateCharacters());
  }, []);

  const templates = useSelector((state) => state.templateCharacters);

  return (
    <div className="selectContainer">
      <h1
        className="title"
        style={{
          color: "#312731",
          fontSize: "60px",
          marginTop: "0px",
          textAlign: "center",
          paddingTop: "50px",
          animationDelay: ".5s",
          animationDuration: "2s"
        }}>
        Select Your Character
      </h1>
      <Grid container justifyContent="space-evenly">
        {templates.map((character) => (
          <Grid item key={character.id} xs={12} md={4} lg={2} >
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
