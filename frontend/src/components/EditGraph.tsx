// import React, { useState, useEffect } from "react";
// import { Graph } from "../interfaces";

// interface Props {
//   graph: Graph;
// }

// export default function EditGraph({ graph }: Props) {
//   const [nodeInput, setNodeInput] = useState<string>("");
//   const [nodeInputLength, setNodeInputLength] = useState<number>(0);
//   const [inputNodes, setInputNodes] = useState<number>(0);
//   const [graphNodeValFreqs, setGraphNodeValFreqs] = useState<Map<string, number>>(new Map());

//   useEffect(() => {
//     // Initialize state from graph
//     const initialNodeValues = graph.nodes.map((node) => node.value);
//     setNodeInput(initialNodeValues.join("\n"));
//     setInputNodes(initialNodeValues.length);

//     const initialFreqMap = initialNodeValues.reduce((freqMap, value) => {
//       freqMap.set(value, (freqMap.get(value) || 0) + 1);
//       return freqMap;
//     }, new Map<string, number>());
//     setGraphNodeValFreqs(initialFreqMap);
//   }, [graph]);

//   function getNodeInputLength(): number {
//     return nodeInput
//       .split("\n")
//       .map((value) => value.trim())
//       .filter(Boolean)
//       .join(" ").length;
//   }

//   useEffect(() => {
//     const currNodeInputLength = getNodeInputLength();
//     if (currNodeInputLength === nodeInputLength) {
//       // Ignore changes that don't alter the effective node values
//       return;
//     }

//     const currNodeValues = nodeInput
//       .split("\n")
//       .map((value) => value.trim())
//       .filter(Boolean);

//     const currInputNodes = currNodeValues.length;

//     const currNodeValFreqs = currNodeValues.reduce((freqMap, value) => {
//       freqMap.set(value, (freqMap.get(value) || 0) + 1);
//       return freqMap;
//     }, new Map<string, number>());

//     if (currInputNodes === inputNodes) {
//       // Node values edited
//       const graphNodeValues = Array.from(graphNodeValFreqs.keys());
//       currNodeValues.forEach((value, index) => {
//         if (value !== graphNodeValues[index]) {
//           handleDeleteNodeValue(graphNodeValues[index]); // Delete old value
//           handleAddNode(undefined, value); // Add new value
//         }
//       });n
//     } else if (currInputNodes > inputNodes) {
//       // Node(s) added
//       for (const [value, freq] of currNodeValFreqs.entries()) {
//         if ((graphNodeValFreqs.get(value) || 0) < freq) {
//           handleAddNode(undefined, value); // Add node to graph
//         }
//       }
//     } else if (currInputNodes < inputNodes) {
//       // Node(s) deleted
//       for (const [value, freq] of graphNodeValFreqs.entries()) {
//         if ((currNodeValFreqs.get(value) || 0) < freq) {
//           handleDeleteNodeValue(value); // Remove node from graph
//         }
//       }
//     }

//     // Update state
//     setGraphNodeValFreqs(currNodeValFreqs);
//     setNodeInputLength(currNodeInputLength);
//     setInputNodes(currInputNodes);
//   }, [nodeInput]);

//   return (
//     <>
//       {graph ? (
//         <>
//           <label>Nodes (one per line):</label>
//           <textarea
//             value={nodeInput}
//             onChange={(e) => setNodeInput(e.target.value)}
//             placeholder="Enter node values"
//           />
//         </>
//       ) : (
//         <>select a graph to edit</>
//       )}
//     </>
//   );

// }
