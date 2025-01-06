import { useEffect } from "react";
import Close from "../components/Close";

interface Props {
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function Error({ errorMessage, setErrorMessage }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => setErrorMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [setErrorMessage]);

  return (
    errorMessage && (
      <div id="error" className="main-component">
        Error: {errorMessage}
        <Close onClose={() => setErrorMessage(null)} />
      </div>
    )
  );
}
