import { Node, LocatedEdge } from "../interfaces";
import { TEXT_BOX_ADJUSTMENT } from "../constants";
interface Props {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editInputRef: React.RefObject<HTMLInputElement>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  canvasRect: DOMRect | null;
  editingObj: Node | LocatedEdge;
}

export default function EditBox({
  handleSubmit,
  editInputRef,
  value,
  setValue,
  canvasRect,
  editingObj,
}: Props) {
  return (
    <form onSubmit={handleSubmit}>
      <input
        id="editing-box"
        type="text"
        onChange={(e) => setValue(e.target.value)} // Updated to set the correct value
        value={value}
        style={{
          position: "absolute",
          top: canvasRect!.top + editingObj.pos.y - TEXT_BOX_ADJUSTMENT.height,
          left: canvasRect!.left + editingObj.pos.x - TEXT_BOX_ADJUSTMENT.width,
        }}
        ref={editInputRef}
      />
      <input className="invisible-submit" type="submit" />
    </form>
  );
}
