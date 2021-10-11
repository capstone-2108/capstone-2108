import React from "react";
import { CardMedia, makeStyles, CardContent, CardActionArea } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import { useHistory } from "react-router-dom";

// DELETE LATER
import fox from "../../public/assets/characters/character-protrait-emotes-2/Fox_frame.png";
import beastMaster from "../../public/assets/characters/character-protrait-emotes-2/Beastmaster_frame.png";
import sorcerer from "../../public/assets/characters/character-protrait-emotes-2/Sorcerer_frame.png";
import swashbuckler from "../../public/assets/characters/character-protrait-emotes-2/Swashbuckler_frame.png";

const dummyData = [
  {
    id: 1,
    name: "Fox",
    strength: 75,
    portrait: fox
    // description: "Sly, quick, and mega cute"
  },
  {
    id: 2,
    name: "Beast Master",
    strength: 100,
    portrait: beastMaster
    // description: "Strong, resilient, and wise"
  },
  {
    id: 3,
    name: "Sorcerer",
    strength: 90,
    portrait: sorcerer
    // description: "Magical, mysterious, and powerful"
  },
  {
    id: 4,
    name: "Swashbuckler",
    strength: 100,
    portrait: swashbuckler
    // description: "Daring, romantic, and handsome"
  }
];

// END DELETE

const useStyles = makeStyles(() => ({
  bkgd: {
    backgroundColor: "#2c3b7a",
    minHeight: "100vh",
    marginTop: 0
  },
  cardArea: {
    marginTop: "5%"
  },
  root: {
    maxWidth: "100%",
    margin: "auto",
    fontFamily: "Cinzel Decorative",
    backgroundColor: "#e8e5d3"
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

  const history = useHistory();
  const routeChange = () => {
    let path = `/game`;
    history.push(path);
  };

  return (
    <div className={classes.bkgd}>
      <h1 className={classes.heading}>Select Your Character</h1>
      <Grid container justifyContent="space-evenly">
        {dummyData.map((character) => (
          <Grid item key={character.id} xs={12} md={10} lg={2} className={classes.cardArea}>
            <Card>
              <CardActionArea className={classes.root} onClick={() => routeChange()}>
                <CardMedia
                  className={classes.media}
                  component="img"
                  image={character.portrait}
                  alt={character.name}
                />
                <CardContent>
                  <h3>{character.name}</h3>
                  <h5>{character.description}</h5>
                  <h5>Strength: {character.strength}</h5>
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
