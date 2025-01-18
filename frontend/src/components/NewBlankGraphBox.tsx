import { useState } from "react";
import Box from "./Box";
import { DEFAULT_BOX_ACTIVE } from "../constants";
import { BoxActive } from "../interfaces";

interface Props {
  setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
  handleNewGraph: (name: string) => void;
  setGraphPopupActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleSetError: (message: string) => void;
}

export default function NewBlankGraphBox({
  setBoxActive,
  handleNewGraph,
  setGraphPopupActive,
  handleSetError,
}: Props) {
  const [newGraphName, setNewGraphName] = useState("");

  const handleNewGraphSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(newGraphName);
    if (newGraphName === "") {
      handleSetError("Please provide a name");
      return;
    }
    const newName: string = newGraphName;
    setNewGraphName("");
    handleNewGraph(newName);
    setBoxActive({ ...DEFAULT_BOX_ACTIVE, newBlankGraphBox: false });
    setGraphPopupActive(false);
  };

  return (
    <Box
      mainText={"create a new graph"}
      placeholderText={"enter title here"}
      closeFunction={() =>
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, newBlankGraphBox: false })
      }
      submitFunction={handleNewGraphSubmit}
      inputValue={newGraphName}
      inputChangeFunction={setNewGraphName}
      loading={null}
      loadingMessage={null}
      children={null}
      containsPrimaryInput={true}
    />
  );
}
