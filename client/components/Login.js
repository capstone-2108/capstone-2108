import React from 'react';
import { createTheme, ThemeProvider, Typography } from '@material-ui/core';

const theme = createTheme({
  typography: {
    fontFamily: 'Press Start 2P'
  }
})

const TempLogin = () => {
  console.log(theme)
  return (
    <ThemeProvider theme={theme}>
      <Typography variant="h1" gutterBottom>
        HELLO WORLD
      </Typography>
    </ThemeProvider>
  )
}

export default TempLogin
