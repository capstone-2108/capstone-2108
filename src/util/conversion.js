import {TILE_HEIGHT, TILE_HEIGHT_HALF, TILE_WIDTH, TILE_WIDTH_HALF} from '../constants/constants';
import {Vertex} from '../pathfinding/Vertex';

export function mapToScreen(mapX, mapY) {
  let screenX = mapX * TILE_WIDTH;
  let screenY = mapY * TILE_HEIGHT;
  return [screenX, screenY];
}

export function screenToMap(screenX, screenY) {
  screenX = Math.floor(screenX);
  screenY = Math.floor(screenY);
  let mapX = Math.floor(screenX / TILE_WIDTH);
  let mapY = Math.floor(screenY / TILE_HEIGHT);
  return new Vertex(mapX, mapY)
}
