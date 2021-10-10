import {Vector2} from './Vector2';

export class Node {
  constructor(x, y, isWalkable = true, worldNode) {
    this.id = x.toString() + '-' + y.toString();
    this.x = x;
    this.y = y;
    this.isWalkable = isWalkable;
    this.distanceFromStart = Infinity; //gScore - current shortest distance from start to the current node
    this.estimatedDistanceToEnd = Infinity; //heuristic score - the educated guess distance from this node to the end node
    this.worldNode = worldNode;
    this.cameFrom = null;
    this.direction = 'south';
    this.vector2 = new Vector2(this.worldNode.x, this.worldNode.y);
  }
}