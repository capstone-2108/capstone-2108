import {MinHeap} from './MinHeap';
import {Node} from './node';
import {calculateManhattanDistance, euclideanDistance} from './heuristics';

/**
 * @param {Node} startNode
 * @param {Node} endNode
 * @param {PathGrid} grid
 * @returns {Node[]|[]}
 */
export function aStar(startNode, endNode, grid) {
  if(inBounds(startNode, endNode, grid)) {
    startNode.distanceFromStart = 0;
    startNode.estimatedDistanceToEnd = calculateManhattanDistance(startNode, endNode);
    const nodesToVisit = new MinHeap([startNode]);
    while (!nodesToVisit.isEmpty()) {
      const currentMinDistanceNode = nodesToVisit.remove();
      if (currentMinDistanceNode === endNode) break;
      const neighbors = grid.getAdjacentNodes(currentMinDistanceNode);
      for (const neighbor of neighbors) {
        let {distance: distanceMoved, nextNode} = neighbor;
        const distanceToNext = currentMinDistanceNode.distanceFromStart + distanceMoved;
        if (distanceToNext >= nextNode.distanceFromStart) continue;
        nextNode.cameFrom = currentMinDistanceNode;
        nextNode.distanceFromStart = distanceToNext;
        nextNode.estimatedDistanceToEnd = distanceToNext + calculateManhattanDistance(startNode, endNode);
        !nodesToVisit.containsNode(nextNode) ?  nodesToVisit.insert(nextNode) : nodesToVisit.update(nextNode);
      }
    }
    return reconstructPath(endNode, grid);
  }
  else {
    return [];
  }
}

function inBounds(startNode, endNode, grid) {
  return startNode.x >= 0 && startNode.x < grid.size &&
    endNode.x >= 0 && endNode.x < grid.size &&
    startNode.y >= 0 && startNode.y < grid.size &&
    endNode.y >= 0 && endNode.y < grid.size;
}

/**
 *
 * @param  {Node} endNode
 * @returns {Node[]}
 */
function reconstructPath(endNode, grid) {
  if (endNode.cameFrom == null) {
    return [];
  }
  let testBreak = 0;
  let currentNode = endNode;
  const path = [];
  while (currentNode != null) {
    if(testBreak > 300) {
      console.log('reconBreak');
      console.log(grid);
      return [];
    }
    testBreak++;
    path.push(currentNode);
    currentNode = currentNode.cameFrom;
  }
  path.reverse(); // reverse path so it goes from start to end
  return path;
}



