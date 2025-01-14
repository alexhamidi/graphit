import { COLORS, GRAPH_COLORS} from "../constants";
import { GraphConfig } from "../interfaces";

interface Props {
  handleSaveGraphPng: () => void;
  graphConfig: GraphConfig;
  setGraphConfig: React.Dispatch<React.SetStateAction<GraphConfig>>;
  darkMode: boolean
}

export default function Appearance({
  graphConfig,
  setGraphConfig,
  handleSaveGraphPng,
  darkMode,
}: Props) {
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
          max={50}
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
          checked={graphConfig.edgeMode}
          onChange={() => updateGraphConfig("edgeMode", !graphConfig.edgeMode)}
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
      <div>
        Colors
        <div id="colors">
          <button
              onClick={() => updateGraphConfig("currentChosenColor", GRAPH_COLORS[+darkMode].main)} //not actually setting to this color- auxillary to reset
              className="color-option"
              id={
                graphConfig.currentChosenColor === GRAPH_COLORS[+darkMode].main ? "selected-color" : ""
              }
              style={{ backgroundColor: GRAPH_COLORS[+darkMode].main }}
            ></button>
          {COLORS.map((color, idx) => (
            <button
              onClick={() => updateGraphConfig("currentChosenColor", color)}
              key={idx}
              className="color-option"
              id={
                graphConfig.currentChosenColor === color ? "selected-color" : ""
              }
              style={{ backgroundColor: color }}
            ></button>
          ))}
          <button
            onClick={() => updateGraphConfig("currentChosenColor", null)}
            id="deselect-color"
            className="color-option"
            style={{ backgroundColor: "white" }}
          >
            <i className="fa-solid fa-xmark fa-xl"></i>
          </button>
        </div>
      </div>
      <button onClick={handleSaveGraphPng} className="basic-button">
        Download Graph (.png)
      </button>
    </>
  );
}
