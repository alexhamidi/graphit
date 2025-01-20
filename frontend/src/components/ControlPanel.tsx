import { ZoomActions } from "../interfaces";

interface Props {
    controlPanelRef: React.RefObject<HTMLDivElement>;
    zoomActions:ZoomActions;
}

  export default function ControlPanel(
    {
        controlPanelRef,
        zoomActions
    }: Props) {
    return (
      <div id="control-panel"
        ref={controlPanelRef}
      >
        <button className="plain-button" onClick={zoomActions.handleZoomOut}>
            <i className="fa-solid fa-minus"></i>
        </button>
        <button className="plain-button" onClick={zoomActions.handleZoomIn}>
            <i className="fa-solid fa-plus "></i>
        </button>
        <button className="plain-button" onClick={zoomActions.handlePanLeft}>
            <i className="fa-solid fa-arrow-left "></i>
        </button>
        <button className="plain-button" onClick={zoomActions.handlePanDown}>
            <i className="fa-solid fa-arrow-down "></i>
        </button>
        <button className="plain-button" onClick={zoomActions.handlePanUp}>
            <i className="fa-solid fa-arrow-up"></i>
        </button>
        <button className="plain-button" onClick={zoomActions.handlePanRight}>
            <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    );
  }
