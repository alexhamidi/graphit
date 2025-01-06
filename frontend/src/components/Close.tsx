interface Props {
  onClose: any;
}

export default function Close({ onClose }: Props) {
  return (
    <button className="plain-button close" onClick={onClose}>
      <i className="fa-solid fa-xmark fa-lg"></i>
    </button>
  );
}
