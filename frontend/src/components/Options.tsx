import { useState } from "react";
import Appearance from "../components/Appearance";
import Algorithms from "../components/Algorithms";
// import EditGraph from "../components/EditGraph";
import { GraphConfig } from "../interfaces";
import { OPTIONS_PAGES } from "../constants";

interface Props {
  graphConfig: GraphConfig;
  setGraphConfig: React.Dispatch<React.SetStateAction<GraphConfig>>;
  darkMode: boolean;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  handleStartAlgo: (type: string) => void;
  highlightClicking: boolean;
  setHighlightClicking: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Options({
  graphConfig,
  setGraphConfig,
  handleStartAlgo,
  darkMode,
  collapsed,
  setCollapsed,
}: Props) {
  const [chosenPage, setChosenPage] = useState<string>(OPTIONS_PAGES[0]);
  return (
    <>
      <button
        id="collapse"
        className={`plain-button ${collapsed ? "collapsed" : "uncollapsed"}`}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <i className="fa-solid fa-chevron-up"></i>
      </button>
      {!collapsed && (
        <div id="options" className="main-graphpage-section main-component">
          <header id="options-header">
            {OPTIONS_PAGES.map((value, idx) => (
              <button
                key={idx}
                onClick={() => setChosenPage(value)}
                className={`plain-button options-pagetitle ${
                  chosenPage == value ? "selected-options-pagetitle" : ""
                }`}
              >
                {value}
              </button>
            ))}
          </header>
          <hr />
          <section id="options-lower">
            {chosenPage == OPTIONS_PAGES[0] && (
              <Appearance
                graphConfig={graphConfig}
                setGraphConfig={setGraphConfig}
                darkMode={darkMode}
              />
            )}
            {chosenPage == OPTIONS_PAGES[1] && (
              <Algorithms handleStartAlgo={handleStartAlgo} graphConfig={graphConfig} />
            )}
          </section>
        </div>
      )}
    </>
  );
}
