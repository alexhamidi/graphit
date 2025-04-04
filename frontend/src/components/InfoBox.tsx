import Box from "./Box";
import { DEFAULT_BOX_ACTIVE, AI_ACCESSIBLE } from "../constants";
import { BoxActive } from "../interfaces";

interface Props {
  setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
  setErrorMessage: (message: string) => void;
}

export default function InfoBox({ setBoxActive, setErrorMessage }: Props) {
  return (
    <Box //use children to render the other stuff
      mainText={"Basics"}
      placeholderText={""}
      closeFunction={() =>
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, infoBox: false })
      }
      submitFunction={null}
      inputValue={null}
      inputChangeFunction={null}
      loading={null}
      loadingMessage={null}
      containsPrimaryInput={false}
      children={
        <>
          {/* welcome to graphit. This is an all in one ... */}
          <div className="info">
            <h3>graph editing</h3>
            <ul>
              <li>click to place a node</li>
              <li>drag nodes with your cursor</li>
              <li>drag connected components by dragging edges</li>
              <li>right-click on a node or edge to delete it</li>
              <li>shift-click on a node or edge to edit its value</li>
              <li>shift-drag a node to create an edge</li>
              <li>
                once you've selected a color, color nodes/edges by adding new ones or clicking existing ones

              </li>
              <li>
                note: for mouse events to be considered a "click", the mouse
                must remain stationary.
              </li>
            </ul>
          </div>
          <div className="info">
            <h3>keyboard commands</h3>
            <ul>
              <li>[cmd]+[b] to create a blank graph </li>
              <li>[cmd]+[i] to create a graph from text input</li>
             {AI_ACCESSIBLE && <li>[cmd]+[k] to create a graph with ai</li>}
              {AI_ACCESSIBLE && <li>[cmd]+[h] to query the current graph</li>}
            </ul>
          </div>
          <p id="love">
            graphit was made by{" "}
            <a href="https://www.linkedin.com/in/alexander-hamidi-208736254" target="_blank" rel="noopener noreferrer">alex hamidi</a>
          </p>
        </>
      }
    />
  );
}
