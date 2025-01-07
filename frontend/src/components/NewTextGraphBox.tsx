import { useState } from "react";
import Box from "./Box";
import { DEFAULT_BOX_ACTIVE } from "../constants";
import { BoxActive } from "../interfaces";
import { MiniEdge } from "../interfaces"
interface Props {
  setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
  handleNewGraphFromInput: (name: string, nodeValues: string[], edgeValues: MiniEdge[]) => void;
  setGraphPopupActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleSetError: (message: string) => void;
}

export default function NewTextGraphBox({
  setBoxActive,
  handleNewGraphFromInput,
  setGraphPopupActive,
  handleSetError,
}: Props) {


  const [newGraphName, setNewGraphName] = useState("");
  const [nodeInput, setNodeInput] = useState("");
  const [edgeInput, setEdgeInput] = useState("");

  const handleNewGraphSubmit = (e: React.FormEvent) => {
    e.preventDefault();



    // we just have values
    //make a constructor
    let invalidInput = false

    const nodeValues: string[] = nodeInput
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean) //
      .filter(line => {
        const splitLine = line.split(" ");
        if (splitLine.length === 1) {
          return true;
        } else {
          handleSetError("Invalid input format");
          invalidInput = true;
          return false;
        }
    });

    const edgeValues: MiniEdge[] = edgeInput
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const splitLine = line.split(/\s+/);
        if (splitLine.length === 2 || splitLine.length === 3) {
          return [splitLine[0], splitLine[1], splitLine[2]] as MiniEdge;
        } else {
          handleSetError("Invalid input format");
          invalidInput = true;
          return null;
        }
      })
      .filter((entry): entry is MiniEdge => entry !== null);


    if (invalidInput) {
      return;
    }

    handleNewGraphFromInput(newGraphName, nodeValues, edgeValues);

    setNewGraphName("");
    setNodeInput("");
    setEdgeInput("");
    setBoxActive({ ...DEFAULT_BOX_ACTIVE, newTextGraphBox: false });
    setGraphPopupActive(false);
  };




  return (
    <Box //use children to render the other stuff
      mainText={"create a new graph with nodes and edges"}
      placeholderText={"enter title here"}
      closeFunction={() => setBoxActive({...DEFAULT_BOX_ACTIVE, newTextGraphBox: false})}
      submitFunction={handleNewGraphSubmit}
      inputValue={newGraphName}
      inputChangeFunction={setNewGraphName}
      error={null}
      loading={null}
      loadingMessage={null}
      children={
        <>
          <textarea
            className="text-input graph-input"
            value={nodeInput}
            onChange={(e)=>setNodeInput(e.target.value)}
            placeholder="enter nodes"
          />
          <textarea
            className="text-input graph-input"
            value={edgeInput}
            onChange={(e)=>setEdgeInput(e.target.value)}
            placeholder="enter edges"
          />
        </>
      }
    />
  );
}
