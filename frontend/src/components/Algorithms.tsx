interface Props {
  handleStartShortest: () => void;
  handleGenCPP: () => void;
}

export default function Appearance({
  handleStartShortest,
  handleGenCPP,
}: Props) {
  return (
    <>
      <button onClick={handleStartShortest} className="basic-button">
        Run shortest path
      </button>
      <button onClick={handleGenCPP} className="basic-button">
        Generate Code (.cpp)
      </button>
    </>
  );
}
