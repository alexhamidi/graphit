interface Props {
  handleStartShortest: () => void;
}

export default function Appearance({ handleStartShortest }: Props) {
  return (
    <button onClick={handleStartShortest} className="basic-button">
      Run shortest path
    </button>
  );
}
