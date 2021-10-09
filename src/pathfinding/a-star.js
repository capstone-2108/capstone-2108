import {MinHeap} from './MinHeap';
import {Node} from './node';
import {calculateManhattanDistance, euclideanDistance} from './heuristics';

/**
 * @param {number} startRow
 * @param {number} startCol
 * @param {number} endRow
 * @param {number} endCol
 * @param {Grid} grid
 * @returns {Node[]|[]}
 */
export function aStar(startRow, startCol, endRow, endCol, grid, heuristic = 'euclidean distance') {
  if(inBounds(startRow, startCol, endRow, endCol, grid)) {
    const startNode = grid.getNode(startRow, startCol);
    const endNode = grid.getNode(endRow, endCol);
    startNode.distanceFromStart = 0;

    startNode.estimatedDistanceToEnd = (heuristic === 'euclidean distance' ? euclideanDistance(startNode, endNode) : calculateManhattanDistance(startNode, endNode));
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
        nextNode.estimatedDistanceToEnd = distanceToNext + ( heuristic === 'euclidean distance' ? euclideanDistance(startNode, endNode) : calculateManhattanDistance(startNode, endNode));
        !nodesToVisit.containsNode(nextNode) ?  nodesToVisit.insert(nextNode) : nodesToVisit.update(nextNode);
      }
    }
    return reconstructPath(endNode);
  }
  else {
    return [];
  }
}

function inBounds(startRow, startCol, endCol, endRow, grid) {
  return startRow >= 0 && startRow < grid.size &&
    endRow >= 0 && endRow < grid.size &&
    startCol >= 0 && startCol < grid.size &&
    endCol >= 0 && endCol < grid.size;
}

/**
 *
 * @param  {Node} endNode
 * @returns {Node[]}
 */
function reconstructPath(endNode) {
  if (endNode.cameFrom == null) {
    return [];
  }
  let currentNode = endNode;
  const path = [];
  while (currentNode != null) {
    path.push(currentNode);
    currentNode = currentNode.cameFrom;
  }
  path.reverse(); // reverse path so it goes from start to end
  return path;
}



