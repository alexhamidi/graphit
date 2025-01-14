import { useState } from "react";
import Appearance from "../components/Appearance";
import Algorithms from "../components/Algorithms";
// import EditGraph from "../components/EditGraph";
import { GraphConfig } from "../interfaces";
import { OPTIONS_PAGES } from "../constants";

interface Props {
  // appearance
  handleSaveGraphPng: () => void;
  graphConfig: GraphConfig;
  setGraphConfig: React.Dispatch<React.SetStateAction<GraphConfig>>;
  handleStartShortest: () => void;
  handleGenCPP: () => void;
  darkMode:boolean;
}

export default function Options({
  handleSaveGraphPng,
  graphConfig,
  setGraphConfig,
  handleStartShortest,
  handleGenCPP,
  darkMode,
}: Props) {
  const [chosenPage, setChosenPage] = useState<string>(OPTIONS_PAGES[0]);
  const [collapsed, setCollapsed] = useState<boolean>(false);
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
                handleSaveGraphPng={handleSaveGraphPng}
                graphConfig={graphConfig}
                setGraphConfig={setGraphConfig}
                darkMode={darkMode}
              />
            )}
            {chosenPage == OPTIONS_PAGES[1] && (
              <Algorithms
                handleStartShortest={handleStartShortest}
                handleGenCPP={handleGenCPP}
              />
            )}
          </section>
        </div>
      )}
    </>
  );
}
