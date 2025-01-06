import { useState } from "react";
import Box from "../components/Box";

interface Props {
  setNewGraphBoxActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleNewGraph: (name: string) => void;
  setGraphPopupActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleSetError: (message: string) => void;
}

export default function NewGraphBox({
  setNewGraphBoxActive,
  handleNewGraph,
  setGraphPopupActive,
}: Props) {
  const [newGraphName, setNewGraphName] = useState("");

  const handleNewGraphSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newName: string = newGraphName;
    setNewGraphName("");
    handleNewGraph(newName);
    setNewGraphBoxActive(false);
    setGraphPopupActive(false);
  };

  return (
    <Box
      mainText={"create a new graph"}
      placeholderText={"enter title here"}
      closeFunction={() => setNewGraphBoxActive(false)}
      submitFunction={handleNewGraphSubmit}
      inputValue={newGraphName}
      inputChangeFunction={setNewGraphName}
      error={null}
      loading={null}
      loadingMessage={null}
    />
  );
}
