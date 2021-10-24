export const WEST = "west";
export const NORTHWEST = "northwest";
export const NORTH = "north";
export const NORTHEAST = "northeast";
export const EAST = "east";
export const SOUTHEAST = "southeast";
export const SOUTH = "south";
export const SOUTHWEST = "southwest";

export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
export const TILE_WIDTH_HALF = 8;
export const TILE_HEIGHT_HALF = 8;

export const DIRECTION_CONVERSION = {
  [NORTH]: NORTH,
  [NORTHWEST]: NORTH,
  [WEST]: WEST,
  [SOUTHWEST]: SOUTH,
  [SOUTH]: SOUTH,
  [SOUTHEAST]: SOUTH,
  [EAST]: EAST,
  [NORTHEAST]: NORTH
};

export const DIRECTIONS = [NORTH, NORTHWEST, WEST, SOUTHWEST, SOUTH, SOUTHEAST, EAST, NORTHEAST];

export const SNAPSHOT_REPORT_INTERVAL = 300;
export const MONSTER_SNAPSHOT_REPORT_INTERVAL = 200;
