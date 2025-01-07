import { useState, useEffect } from "react";
import { post } from "../networking";
import { DEFAULT_BOX_ACTIVE, AI_ERROR } from "../constants";
import { BoxActive, Graph } from "../interfaces";
import Box from "../components/Box";

interface Props {
  setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
  handleAddGraph: (graph: Graph) => void;
  canvasRect: DOMRect | null;
  handleSetError: (message: string) => void;
}

export default function AiBox({
  setBoxActive,
  handleAddGraph,
  canvasRect,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("loading");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessage((prev) => {
          if (prev === "loading...") return "loading";
          return prev + ".";
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAiSubmit = async (e: React.FormEvent) => {
    setError("");
    e.preventDefault();
    const currPrompt: string = prompt;
    setPrompt("");
    if (currPrompt === "") {
      setError("Please provide a prompt");
      return;
    }
    try {
      setLoading(true);
      const response = await post("/api/ai", {
        prompt: currPrompt,
        width: canvasRect!.width,
        height: canvasRect!.height,
      });
      const graph: Graph = response.data.graph;
      handleAddGraph(graph);
      setLoading(false);
      setBoxActive({...DEFAULT_BOX_ACTIVE, aiBox: false})
    } catch (err) {
      setLoading(false);
      setError(AI_ERROR);
    }
    setPrompt("");
  };

  return (
    <Box
      mainText={"create a new graph using AI"}
      placeholderText={"enter prompt here"}
      closeFunction={() => setBoxActive({...DEFAULT_BOX_ACTIVE, aiBox: false})}
      submitFunction={handleAiSubmit}
      inputValue={prompt}
      inputChangeFunction={setPrompt}
      error={error}
      loading={loading}
      loadingMessage={loadingMessage}
      children={null}
    />
  );
}
