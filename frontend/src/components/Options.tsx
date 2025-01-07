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
}

export default function Options({
  handleSaveGraphPng,
  graphConfig,
  setGraphConfig,
}: Props) {
  const [chosenPage, setChosenPage] = useState<string>(OPTIONS_PAGES[0]);

  return (
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
          />
        )}
        {chosenPage == OPTIONS_PAGES[1] && <Algorithms />}
        {/* {chosenPage == OPTIONS_PAGES[2] && <EditGraph
          graphs={graphs}
          setGraphs={setGraphs}
        />} */}
      </section>
    </div>
  );
}
