import { Graph } from "../interfaces";
import { generateCPP } from "../utils/code";

// SAVE GRAPH AS PNG
export function saveGraphPNG(
  canvasRef: React.RefObject<SVGSVGElement>,
  graph: Graph,
) {
  const svg = canvasRef.current!;
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = svg.clientWidth;
    canvas.height = svg.clientHeight;

    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(img, 0, 0);

      const pngDataUrl = canvas.toDataURL("image/png");

      const element = document.createElement("a");
      element.download = `${Graph.name}.png`;
      element.href = pngDataUrl;
      element.click();
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

export function saveGraphCPP(graph: Graph) {
  const cpp: string = generateCPP(graph);

  const blob = new Blob([cpp], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const element = document.createElement("a");
  element.download = `${graph.name}.cpp`;
  element.href = url;
  element.click();

  URL.revokeObjectURL(url);
}
