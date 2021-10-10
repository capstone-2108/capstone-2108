import {TILE_HEIGHT, TILE_HEIGHT_HALF, TILE_WIDTH, TILE_WIDTH_HALF} from '../constants/constants';

export function mapToScreen(mapX, mapY) {
  let screenX = mapX * TILE_WIDTH;
  let screenY = mapY * TILE_HEIGHT;
  return [screenX, screenY];
}


export function screenToMap(screenX, screenY) {
  screenX = Math.floor(screenX);
  screenY = Math.floor(screenY);
  let mapX = Math.round(screenX / TILE_WIDTH);
  let mapY = Math.round(screenY / TILE_HEIGHT);

  return [mapX, mapY];
}

function cart2Iso(cartX, cartY) {
  let isoX = cartX - cartY;
  let isoY = (cartX + cartY) / 2;
  return [isoX, isoY];
}

function iso2Cart(isoX, isoY) {
  let x = (2 * isoY + isoX) / 2;
  let y = (2 * isoY - isoX) / 2;
  return [x, y];
}

// cart2Iso(cartPt) {
//   let cartPoint = new Phaser.Point();
//   cartPoint.x = cartPt.x - cartPt.y;
//   cartPoint.y = (cartPt.x + cartPt.y) / 2;
//   return (cartPoint);
// }
//
// iso2Cart(isoPt) {
//   let tempPt = new Phaser.Point();
//   tempPt.x = (2 * isoPt.y + isoPt.x) / 2;
//   tempPt.y = (2 * isoPt.y - isoPt.x) / 2;
//   return (tempPt);
// }