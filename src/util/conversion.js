import { TILE_HEIGHT, TILE_HEIGHT_HALF, TILE_WIDTH, TILE_WIDTH_HALF } from "../constants/constants";
import { Vertex } from "../pathfinding/Vertex";

export function mapToScreen(mapX, mapY, tileSize) {
  let screenX = mapX * tileSize;
  let screenY = mapY * tileSize;
  return new Vertex(screenX, screenY);
}

export function screenToMap(screenX, screenY, tileSize) {
  let mapX = Math.floor(screenX / tileSize);
  let mapY = Math.floor(screenY / tileSize);
  return new Vertex(mapX, mapY);
}
