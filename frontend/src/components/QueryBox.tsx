import { useEffect, useRef, useState } from "react";
import { streamPost } from "../networking";
import { DEFAULT_BOX_ACTIVE, AI_ERROR } from "../constants";
import { BoxActive, Graph } from "../interfaces";
import Box from "../components/Box";
import { processHistory } from "../utils/utils";
interface Props {
  setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
  setErrorMessage: (message: string) => void;
  graph: Graph | undefined
}

export default function QueryBox({
  setBoxActive,
  setErrorMessage,
  graph
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<string[]>([]);//need to feed back
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currPrompt: string = prompt;
    setPrompt("");
    if (currPrompt === "") {
      setErrorMessage("Please provide a prompt");
      return;
    }
    if (graph === undefined) {
        setErrorMessage("Must select a graph");
        return;
    }
    try {

     const history = messages.slice(messages.length-4);
      console.log(processHistory(history));

      setMessages(prev=>[...prev, currPrompt]);


      const reader = await streamPost("/ai/query", {
        userPrompt: currPrompt,
        graph: graph,
        history: processHistory(history),
      });

      setMessages(prev=>[...prev, ""]);

      const decoder = new TextDecoder(); //get rid of all "data:" and newlines. thats it

      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        const text = decoder.decode(value);

        const trimmed = text.replace(/data:/g, "").replace(/\n/g, "");
        setMessages(prev => [...prev.slice(0, -1), prev[prev.length - 1] + trimmed]);
      }

    } catch (err) {
      setErrorMessage(AI_ERROR);
    }
    setPrompt("");
  };

  return (
    <Box
      mainText={"Query this graph using AI "}
      placeholderText={"enter prompt here"}
      closeFunction={() =>{
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, aiBox: false })
        setMessages([]);
      }}
      submitFunction={handleAiSubmit}
      inputValue={prompt}
      inputChangeFunction={setPrompt}
      loading={null}
      loadingMessage={null}
      containsPrimaryInput={true}
      children={<>
        {messages && <div id="messages">
            {messages.map((message, index) =>
              <div
                key={index}
                className={`query-message ${index%2===0?"user-message":"ai-message"}`}
              >
                {message}
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>}

        </>}
    />
  );
}
