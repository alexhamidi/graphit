import { LIGHT_COLORS, DARK_COLORS } from "../constants";
import { GraphConfig } from "../interfaces";

interface Props {
  graphConfig: GraphConfig;
  setGraphConfig: React.Dispatch<React.SetStateAction<GraphConfig>>;
  darkMode: boolean;
}

export default function Appearance({
  graphConfig,
  setGraphConfig,
  darkMode,
}: Props) {

  const updateChosenColor = (newValue : string | null) => {
    updateGraphConfig("currentChosenColor", newValue)
  }


  const updateGraphConfig = <K extends keyof GraphConfig>(
    key: K,
    value: GraphConfig[K],
  ) => {
    setGraphConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className="slider-section">
        <label htmlFor="circle-radius" className="section-label">
          Node Radius
        </label>
        <input
          type="range"
          id="circle-radius"
          value={graphConfig.circleRadius}
          min={10}
          max={80}
          step={1}
          onChange={(e) =>
            updateGraphConfig("circleRadius", Number(e.target.value))
          }
        />
      </div>
      <div className="slider-section">
        <label htmlFor="font-size" className="section-label">
          Font Size
        </label>
        <input
          type="range"
          id="font-size"
          value={graphConfig.fontSize}
          min={8}
          max={22}
          step={1}
          onChange={(e) =>
            updateGraphConfig("fontSize", Number(e.target.value))
          }
        />
      </div>
      <div className="slider-section">
        <label htmlFor="line-weight" className="section-label">
          Line Weight
        </label>
        <input
          type="range"
          id="line-weight"
          value={graphConfig.lineWeight}
          min={0}
          max={4}
          step={0.1}
          onChange={(e) =>
            updateGraphConfig("lineWeight", Number(e.target.value))
          }
        />
      </div>
      <div className="toggle-item">
        <label htmlFor="edge-mode" className="toggle-label">
          Valued Edges
        </label>
        <input
          type="checkbox"
          id="edge-mode"
          checked={graphConfig.valuedMode}
          onChange={() => updateGraphConfig("valuedMode", !graphConfig.valuedMode)}
        />
      </div>

      <div className="toggle-item">
        <label htmlFor="directed-mode" className="toggle-label">
          Directed Edges
        </label>
        <input
          id="directed-mode"
          type="checkbox"
          checked={graphConfig.directedMode}
          onChange={() =>
            updateGraphConfig("directedMode", !graphConfig.directedMode)
          }
        />
      </div>

      <div className="toggle-item">
        <label htmlFor="gravity-mode" className="toggle-label">
          Gravity Mode
        </label>
        <input
          type="checkbox"
          id="gravity-mode"
          checked={graphConfig.gravityMode}
          onChange={() =>
            updateGraphConfig("gravityMode", !graphConfig.gravityMode)
          }
        />
      </div>
      <div className="toggle-item">
        <label htmlFor="node-outline-color" className="toggle-label">
          Color Node Outlines
        </label>
        <input
          type="checkbox"
          id="node-outline-color"
          checked={graphConfig.nodeOutlineColor}
          onChange={() =>
            updateGraphConfig("nodeOutlineColor", !graphConfig.nodeOutlineColor)
          }
        />
      </div>
      {/* <div className="toggle-item">
        <label htmlFor="unbounded-mode" className="toggle-label">
          Infinite Mode
        </label>
        <input
          type="checkbox"
          id="unbounded-mode"
          checked={graphConfig.unboundedMode}
          onChange={() =>
            updateGraphConfig("unboundedMode", !graphConfig.unboundedMode)
          }
        />
      </div> */}
      <div>
        Colors
        <div id="colors">

          <button
            onClick={() => updateGraphConfig("currentChosenColor", "")} //not actually setting to this color- auxillary to reset
            id="transparent-color"
            className={`color-option ${graphConfig.currentChosenColor === "" ? "selected-color" : ""}`}
            style={{ backgroundColor: "gray"}}
          ></button>
            <button
            onClick={() => updateChosenColor(null)}
            id="deselect-color"
            className={"color-option"}
            style={{ backgroundColor: "white" }}
          >
            <i className="fa-solid fa-xmark fa-xl"></i>
          </button>
          <hr/>

          {LIGHT_COLORS.map((color, idx) => (
            <button
              onClick={() => updateChosenColor(color)}
              key={idx}
              className={`color-option ${graphConfig.currentChosenColor === color ? "selected-color" : ""}`}
              style={{ backgroundColor: color }}
            ></button>
          ))}
          <hr/>
          {DARK_COLORS.map((color, idx) => (
            <button
              onClick={() => updateChosenColor(color)}
              key={idx}
              className={`color-option ${graphConfig.currentChosenColor === color ? "selected-color" : ""}`}
              style={{ backgroundColor: color }}
            ></button>
          ))}

          {/* <button
            onClick={handleHighlightSelect}
            className={`color-option ${highlightClicking ? "selected-outline" : "outline-color"}`}
            style={{ backgroundColor: "white" }}
          >
          </button> */}

        </div>
      </div>
    </>
  );
}
