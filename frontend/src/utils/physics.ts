import {
  GRAVITATIONAL_CONSTANT,
  DAMPING,
  DELTA_TIME,
  MOVEMENT_THRESHOLD,
  REFRESH_RATE,
  SPRING_FORCE,
  EPSILON,
} from "../constants";
import {
  addPos,
  subtractPos,
  multiplyPos,
  lengthPos,
  getBoundedPosition,
} from "../utils/utils";
import { Graph, TempEdge } from "../interfaces";

export function updateNodePositions(
  graphRef: React.MutableRefObject<Graph | null>,
  draggingRef: React.MutableRefObject<string | null>,
  edgingRef: React.MutableRefObject<TempEdge | null>,
  canvasRectRef: React.MutableRefObject<DOMRect | null>,
  numTotalIters: number,
  setNumTotalIters: React.Dispatch<React.SetStateAction<number>>,
  edgingBool: boolean,
  setEdging: React.Dispatch<React.SetStateAction<TempEdge | null>>,
  setGraphs: React.Dispatch<React.SetStateAction<Map<string, Graph>>>,
  circleRadius:number
) {
  const currentGraph = graphRef.current;
  const canvasRect = canvasRectRef.current;
  const edging = edgingRef.current;
  const dragging = draggingRef.current;
  if (!currentGraph || !canvasRect) return;

  let anyNodeMoved = false; // Track if any node had significant movement

  const updatedGraph = {
    ...currentGraph,
    nodes: currentGraph.nodes.map((node) => {
      if (dragging !== null && node.id === dragging) {
        return node;
      } else {
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;

        const k = Math.sqrt(
          (canvasRect.width * canvasRect.height) / currentGraph.nodes.length,
        );

        let force = { x: 0, y: 0 };

        // Gravitation towards center to keep layout balanced

          const distanceToCenter = subtractPos(
            { x: centerX, y: centerY },
            node.pos,
          );
          const centerDistance = lengthPos(distanceToCenter);
          if (centerDistance > k * 3) {
            force = addPos(
              force,
              multiplyPos(
                distanceToCenter,
                (GRAVITATIONAL_CONSTANT * (centerDistance - k * 3)) /
                  centerDistance,
              ),
            );
          }


        currentGraph.nodes.forEach((otherNode) => {
          if (node.id !== otherNode.id) {
            const diff = subtractPos(node.pos, otherNode.pos);
            let distance = lengthPos(diff);

            distance = Math.max(k * 0.2, distance);

            let repulsionStrength = 0.5;
            let repulsionForce =
              ((k * k) / (distance * distance)) * repulsionStrength;

            force = addPos(force, multiplyPos(diff, repulsionForce / distance));
          }
        });



        currentGraph.edges.forEach((edge) => { //happens here
          if (
            (edge.n1 === node.id || edge.n2 === node.id) &&
            edge.n1 !== edge.n2
          ) {
            const otherNodeId = edge.n1 === node.id ? edge.n2 : edge.n1;
            const otherNode = currentGraph.nodes.find(
              (n) => n.id === otherNodeId,
            );

            if (otherNode) {
              const diff = subtractPos(otherNode.pos, node.pos);
              const distance = lengthPos(diff);
              const springForce = (distance - k) * SPRING_FORCE;
              force = addPos(force, multiplyPos(diff, springForce / (distance+EPSILON)));
            }
          }
        });


        force = multiplyPos(force, DAMPING * DELTA_TIME);

        let newPos = addPos(node.pos, force);

          const margin = k / 2;
          const boundaryForce = 0.05;
          if (newPos.x < margin) newPos.x += (margin - newPos.x) * boundaryForce;
          if (newPos.x > canvasRect.width - margin)
            newPos.x -= (newPos.x - (canvasRect.width - margin)) * boundaryForce;
          if (newPos.y < margin) newPos.y += (margin - newPos.y) * boundaryForce;
          if (newPos.y > canvasRect.height - margin)
            newPos.y -= (newPos.y - (canvasRect.height - margin)) * boundaryForce;
          newPos = getBoundedPosition(newPos, canvasRect, circleRadius);


        const displacement = Math.abs(lengthPos(node.pos) - lengthPos(newPos));

        if (displacement > MOVEMENT_THRESHOLD) {
          anyNodeMoved = true;
        }

        const ITERS_PER_UPDATE = Math.round(20 / REFRESH_RATE);
        if (
          edgingBool &&
          edging &&
          edging.n1 === node.id &&
          numTotalIters % ITERS_PER_UPDATE === 0
        ) {
          setEdging((prevEdging) => {
            if (prevEdging === null) {
              return null;
            }
            return {
              ...prevEdging,
              p1: newPos,
            };
          });
        }

        return {
          ...node,
          pos: newPos,
        };
      }
    }),
  };

  // Only update if at least one node had significant movement
  if (!anyNodeMoved) {
    return;
  }

  setGraphs((prevGraphs) => {
    const newGraphs = new Map(prevGraphs);
    newGraphs.set(updatedGraph.id, updatedGraph);
    return newGraphs;
  });
  setNumTotalIters((p) => (p + 1) % 10000);
}
