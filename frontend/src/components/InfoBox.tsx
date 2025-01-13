import Box from "./Box";
import { DEFAULT_BOX_ACTIVE } from "../constants";
import { BoxActive } from "../interfaces";

interface Props {
    setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
    handleSetError: (message: string) => void;
}

export default function InfoBox({
    setBoxActive,
    handleSetError,
}: Props) {

  return (
    <Box //use children to render the other stuff
      mainText={"Basics"}
      placeholderText={''}
      closeFunction={() =>
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, infoBox: false })
      }
      submitFunction={null}
      inputValue={null}
      inputChangeFunction={null}
      error={null}
      loading={null}
      loadingMessage={null}
      containsPrimaryInput={false}
      children={
        <>
          {/* welcome to graphit. This is an all in one ... */}
          <div className = "info">
            <h4>graph editing:</h4>
            <ul>
              <li>click to place a node</li>
              <li>drag nodes with your cursor</li>
              <li>shift-click on a node or edge to edit its value</li>
              <li>shift-drag a node to create an edge</li>
              <li>once you've selected a color, color nodes by clicking existing nodes or adding new nodes</li>
              <li>note: for mouse events to be considered a "click", the mouse must remain stationary.</li>
            </ul>
          </div>
          <div className = "info">
            <h4>keyboard commands:</h4>
            <ul>
              <li>[cmd]+[i] to create a blank graph </li>
              <li>[cmd]+[u] to create a graph from text</li>
              <li>[cmd]+[k] to create a graph with ai</li>
            </ul>
          </div>
          <p id="love">
            this project was made with love by <a href="https://alexhamidi.github.io/">alex hamidi</a>
          </p>
          </>
      }
    />
  );
}
