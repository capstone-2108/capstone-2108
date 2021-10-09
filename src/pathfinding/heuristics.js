export function calculateManhattanDistance(currentNode, endNode) {
  const currentRow = currentNode.x;
  const currentCol = currentNode.y;
  const endRow = endNode.x;
  const endCol = endNode.y;
  return Math.abs(currentRow - endRow) + Math.abs(currentCol - endCol);
}

//euclidean heuristic - distance formula
export function euclideanDistance(start, end) {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

export function manhattanDistance(start, end) {
  return Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1]);
}