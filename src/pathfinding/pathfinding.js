import EasyStar from "easystarjs";

/**
 *
 * @param {Phaser.Tilemaps.Tilemap} map
 * @param {Phaser.Tilemaps.TilemapLayer[]} layers
 */
// export const createPathFinder = (map, layers) => {
//   const pathFinder = new EasyStar.js();
//   // pathFinder.enableDiagonals();
//   pathFinder.disableDiagonals();
//   pathFinder.disableCornerCutting();
//   // pathFinder.disableSync();
//
//
//   const tileset = map.tilesets[0];
//   // const tilesetProperties = tileset.tileProperties;
//   const tilesetProperties = {};
//   for(let i = 0; i < map.tilesets.length; i++) {
//     tilesetProperties[map.tilesets[i].name] = map.tilesets[i];
//   }
//   console.log(tilesetProperties);
//
//   const grid = [];
//   const acceptableTiles = new Set();
//   for (let col = 0; col < map.height; col++) {
//     grid[col] = [];
//     for (let row = 0; row < map.width; row++) {
//       // console.log(map.tileToWorldXY(row, col));
//       // console.log(map.getTileAt(row, col));
//       let finalTile;
//       let collisionTile;
//       for (let i = 0; i < layers.length; i++) {
//         // console.log(layers[i].getTileAt(row, col));
//
//         const proposedTile = map.getTileAt(row, col, true, layers[i]);
//         // const proposedTile = layers[i].getTileAt(row, col, true);
//         if (proposedTile.index !== -1) {
//           // const myTileset = tile.tile
//           console.log(proposedTile);
//           finalTile = proposedTile;
//
//           const tileIndex = finalTile.index;
//           if(proposedTile.collides || proposedTile.properties.collides) {
//             // console.log('collision at ', proposedTile);
//           // if (tilesetProperties[tileIndex - 1] && tilesetProperties[tileIndex - 1].collides) {
//             collisionTile = finalTile;
//           } else {
//             acceptableTiles.add(finalTile.index);
//           }
//         }
//       }
//       grid[col][row] = collisionTile ? collisionTile.index : finalTile.index;
//     }
//   }
//   console.log(map);
//   pathFinder.setGrid(grid);
//   pathFinder.setAcceptableTiles(Array.from(acceptableTiles));
//   return pathFinder;
// };


export const createPathFinder = (map, layers) => {
  const pathFinder = new EasyStar.js();
  // pathFinder.enableDiagonals();
  pathFinder.disableDiagonals();
  pathFinder.disableCornerCutting();
  // pathFinder.disableSync();
  
  const grid = [];
  const acceptableTiles = new Set();
  for (let col = 0; col < map.height; col++) {
    grid[col] = [];
    for (let row = 0; row < map.width; row++) {
      let finalTile;
      let collisionTile;
      for (let i = 0; i < layers.length; i++) {
        const proposedTile = map.getTileAt(row, col, true, layers[i]);
        if (proposedTile.index !== -1) {
          finalTile = proposedTile;
          if (proposedTile.collides || proposedTile.properties.collides) {
            collisionTile = finalTile;
          }
        }
      }
      if(!collisionTile) acceptableTiles.add(finalTile.index);
      grid[col][row] = collisionTile ? collisionTile.index : finalTile.index;
    }
  }
  pathFinder.setGrid(grid);
  pathFinder.setAcceptableTiles(Array.from(acceptableTiles));
  return pathFinder;
};
