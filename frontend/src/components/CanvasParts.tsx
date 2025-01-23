import { INVISIBLE_CHAR } from "../constants";
import {
  Node,
  Colors,
  GraphConfig,
  NodeClickActions,
  Position,
  EdgeClickActions,
  Edge,
} from "../interfaces";
import {
  getBidirectionalOffsets,
  getMidpoint,
  adjustEndpoint,
} from "../utils/utils";

interface NodeProps {
  node: Node;
  nodeClickActions: NodeClickActions;
  graphConfig: GraphConfig;
  currColors: Colors;
  highlighted: Set<string>;
}

export function NodeComponent({
  node,
  nodeClickActions,
  graphConfig,
  currColors,
  highlighted,
}: NodeProps) {
  return (
    <g
      onMouseDown={(e) => nodeClickActions.handleMouseDownNode(e, node)}
      onContextMenu={(e) => nodeClickActions.handleRightClickNode(e, node)}
    >
      <circle
        cx={node.pos.x}
        cy={node.pos.y}
        r={graphConfig.circleRadius}
        fill={node.customColor ? node.customColor : "transparent"}
        strokeWidth={graphConfig.lineWeight}
        stroke={
          highlighted && highlighted.has(node.id) ? "red" : ((graphConfig.nodeOutlineColor && node.customColor) ? node.customColor : currColors.line)
        }
      />
      <text
        x={node.pos.x}
        y={node.pos.y}
        dy="0.35em"
        strokeWidth={0.4 * graphConfig.fontSize}
        stroke={node.customColor ? node.customColor : currColors.main}
        textAnchor="middle"
      >
        {INVISIBLE_CHAR.repeat(node.value.length)}
      </text>
      <text
        textAnchor="middle"
        x={node.pos.x}
        y={node.pos.y}
        dy="0.35em"
        fill={currColors.text}
      >
        {node.value}
      </text>
    </g>
  );
}

interface EdgeProps {
  edge: Edge;
  node1: Node;
  node2: Node;
  edgeClickActions: EdgeClickActions;
  graphConfig: GraphConfig;
  highlighted: Set<string>;
  currColors: Colors;
  bidirectional: Set<string>;
}

export function SelfEdgeComponent({
  edge,
  node1,
  edgeClickActions,
  graphConfig,
  highlighted,
  currColors,
}: EdgeProps) {
  const SELF_EDGE_HEIGHT = graphConfig.circleRadius * 2.5;
  const SELF_EDGE_WIDTH = graphConfig.circleRadius * 1.5;

  const startX = node1.pos.x;
  const startY = node1.pos.y - graphConfig.circleRadius * 1.44;

  const pathData = `
    M ${startX+ SELF_EDGE_WIDTH * 0.5} ${startY+SELF_EDGE_HEIGHT* 0.3}
    C ${startX + SELF_EDGE_WIDTH } ${startY},
        ${startX + SELF_EDGE_WIDTH} ${startY - SELF_EDGE_HEIGHT * 0.8},
        ${startX} ${startY - SELF_EDGE_HEIGHT*.8}
    C ${startX - SELF_EDGE_WIDTH} ${startY - SELF_EDGE_HEIGHT * 0.8},
        ${startX - SELF_EDGE_WIDTH} ${startY},
        ${startX - SELF_EDGE_WIDTH * 0.5} ${startY + SELF_EDGE_HEIGHT * 0.3}
    `;

  const labelPos: Position = {
    x: startX,
    y: startY - SELF_EDGE_HEIGHT*0.8,
  };

  return (<>
    <defs>
        <marker
        id="this-arrow-head-self"
        className="arrow-head"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerUnits="userSpaceOnUse"
        markerWidth={6 * graphConfig.lineWeight}
        markerHeight={6 * graphConfig.lineWeight}
        orient="auto-start-reverse"
        fill={edge.customColor || currColors.line}
        >
        <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
    </defs>
    <g
      style={{ userSelect: "none" }}
      onMouseDown={(e) =>
        edgeClickActions.handleMouseDownEdge(e, { ...edge, pos: labelPos, width:0, height:0})
      }
      onContextMenu={(e) => edgeClickActions.handleRightClickEdge(e, edge)}
    >
      <path
        d={pathData}
        fill="none"
        stroke={currColors.line}
        strokeWidth={graphConfig.lineWeight * 8}
        opacity={0}
      />

      <path
        d={pathData}
        fill="none"
        stroke={
          highlighted && highlighted.has(edge.id) ? "red" :  (edge.customColor ? edge.customColor : currColors.line)
        }
        strokeWidth={graphConfig.lineWeight}
        {...(graphConfig.directedMode && {
          markerEnd: `url(#this-arrow-head${highlighted.has(edge.id) ? "-red" : "-self"})`,
        })}
      />

      {graphConfig.valuedMode && (
        <>
          <text
            x={labelPos.x}
            y={labelPos.y}
            dy="0.35em"
            strokeWidth={0.4 * graphConfig.fontSize}
            stroke={currColors.main}

            textAnchor="middle"
          >
            {INVISIBLE_CHAR.repeat(edge.value.length)}
          </text>
          <text
            textAnchor="middle"
            x={labelPos.x}
            y={labelPos.y}
            dy="0.35em"
            fill={currColors.text}
          >
            {edge.value}
          </text>
        </>
      )}
    </g>
  </>);
}

export function EdgeComponent({
  edge,
  node1,
  node2,
  edgeClickActions,
  graphConfig,
  highlighted,
  currColors,
  bidirectional,
}: EdgeProps) {
  const offsets: Position = bidirectional.has(
    JSON.stringify([edge.n1, edge.n2].sort()),
  )
    ? getBidirectionalOffsets(node1.pos, node2.pos)
    : { x: 0, y: 0 };
  const labelPos: Position = {
    x: getMidpoint(node1.pos.x, node2.pos.x) + offsets.x,
    y: getMidpoint(node1.pos.y, node2.pos.y) + offsets.y,
  };
  return (<>
  <defs>
        <marker
                id="this-arrow-head"
                className="arrow-head"
                viewBox="0 0 10 10"
                refX="9.5"
                refY="5"
                markerUnits="userSpaceOnUse"
                markerWidth={6 * graphConfig.lineWeight}
                markerHeight={6 * graphConfig.lineWeight}
                orient="auto-start-reverse"
                fill={currColors.line}
                >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker
                id="this-arrow-head-red"
                className="arrow-head"
                viewBox="0 0 10 10"
                refX="9.5"
                refY="5"
                markerUnits="userSpaceOnUse"
                markerWidth={6 * graphConfig.lineWeight}
                markerHeight={6 * graphConfig.lineWeight}
                orient="auto-start-reverse"
                fill="red"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker
              id="this-arrow-head-custom"
              className="arrow-head"
              viewBox="0 0 10 10"
              refX="9.5"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth={6 * graphConfig.lineWeight}
              markerHeight={6 * graphConfig.lineWeight}
              orient="auto-start-reverse"
              fill={edge.customColor || currColors.line}
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>

        </defs>
    <g
      style={{ userSelect: "none" }}
      onMouseDown={(e) =>
        edgeClickActions.handleMouseDownEdge(e,
          {
            ...edge,
            pos: labelPos,
            width: Math.abs(node1.pos.x-node2.pos.x),
            height: Math.abs(node1.pos.y-node2.pos.y)

          })
      }
      onContextMenu={(e) => edgeClickActions.handleRightClickEdge(e, edge)}
    >
      <line
        x1={node1.pos.x}
        y1={node1.pos.y}
        x2={node2.pos.x}
        y2={node2.pos.y}
        opacity={0}
        stroke={currColors.line}
        strokeWidth={graphConfig.lineWeight * 8}
      />
      <line
        x1={adjustEndpoint(node2.pos, node1.pos, graphConfig.circleRadius).x}
        y1={adjustEndpoint(node2.pos, node1.pos, graphConfig.circleRadius).y}
        x2={adjustEndpoint(node1.pos, node2.pos, graphConfig.circleRadius).x}
        y2={adjustEndpoint(node1.pos, node2.pos, graphConfig.circleRadius).y}
        stroke={
          highlighted && highlighted.has(edge.id) ? "red" :  (edge.customColor ? edge.customColor : currColors.line)
        }

        strokeWidth={graphConfig.lineWeight}
        {...(graphConfig.directedMode && {
          markerEnd: `url(#this-arrow-head${highlighted.has(edge.id) ? "-red" : edge.customColor ? "-custom" : ""})`,
        })}
      />
      {graphConfig.valuedMode && (
        <>
          <text
            x={labelPos.x}
            y={labelPos.y}
            dy="0.35em"
            strokeWidth={0.4 * graphConfig.fontSize}
            className="invisible-edge-text"
            textAnchor="middle"
            stroke={currColors.main}
          >
            {INVISIBLE_CHAR.repeat(edge.value.length)}
          </text>
          <text
            textAnchor="middle"
            x={labelPos.x}
            y={labelPos.y}
            dy="0.35em"
            fill={currColors.text}
            className="edge-text"
          >
            {edge.value}
          </text>
        </>
      )}
    </g>
  </>);
}

