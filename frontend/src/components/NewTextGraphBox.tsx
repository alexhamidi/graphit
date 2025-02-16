import { useState } from "react";
import Box from "./Box";
import { DEFAULT_BOX_ACTIVE } from "../constants";
import { BoxActive } from "../interfaces";
import { MiniEdge } from "../interfaces";
interface Props {
  setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
  handleNewGraphFromInput: (
    name: string,
    nodeValues: string[],
    edgeValues: MiniEdge[],
    referringIds: boolean,
  ) => void;
  setGraphPopupActive: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: (message: string) => void;
}

export default function NewTextGraphBox({
  setBoxActive,
  handleNewGraphFromInput,
  setGraphPopupActive,
  setErrorMessage,
}: Props) {
  const [newGraphName, setNewGraphName] = useState("");
  const [nodeInput, setNodeInput] = useState("");
  const [edgeInput, setEdgeInput] = useState("");
  const [referringIds, setReferringIds] = useState(true)

  const handleNewGraphSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGraphName === "") {
      setErrorMessage("Please provide a name");
      return;
    }

    let invalidInput = false;

    const nodeValues: string[] = nodeInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean) //
      .filter((line) => {
        const splitLine = line.split(" ");
        if (splitLine.length >= 1) {
          return true;
        } else {
          setErrorMessage("Invalid input format");
          invalidInput = true;
          return false;
        }
      });
      console.log(nodeValues)


      const edgeValues: MiniEdge[] = edgeInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const splitLine = line.split(/\s+/);
          if (splitLine.length === 2 || splitLine.length === 3) {
            return [splitLine[0], splitLine[1], splitLine[2]] as MiniEdge;
          } else {
            setErrorMessage("Invalid input format");
            invalidInput = true;
            return null;
          }
        })
        .filter((entry): entry is MiniEdge => entry !== null);

      if (invalidInput) {
        return;
      }

    handleNewGraphFromInput(newGraphName, nodeValues, edgeValues, referringIds);

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
      closeFunction={() =>
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, newTextGraphBox: false })
      }
      submitFunction={handleNewGraphSubmit}
      inputValue={newGraphName}
      inputChangeFunction={setNewGraphName}
      loading={null}
      loadingMessage={null}
      containsPrimaryInput={true}
      children={
        <>
          <label>
            refer to nodes by with their id? &nbsp;
            <select
              value={referringIds.toString()}
              onChange={(e) => setReferringIds(e.target.value === "true")}
            >
              <option value="true">yes</option>
              <option value="false">no</option>
            </select>
          </label>
          <textarea
            className="text-input graph-input"
            value={nodeInput}
            onChange={(e) => setNodeInput(e.target.value)}
            placeholder="enter nodes"
          />
          <textarea
            className="text-input graph-input"
            value={edgeInput}
            onChange={(e) => setEdgeInput(e.target.value)}
            placeholder="enter edges"
          />
        </>
      }
    />
  );
}
