import Close from "../components/Close";

interface Props {
  mainText: string;
  placeholderText: string;
  closeFunction: () => void;
  submitFunction: null | ((event: React.FormEvent) => void);
  inputValue: null | string;
  inputChangeFunction: null | ((value: string) => void);
  loading: boolean | null;
  loadingMessage: string | null;
  children: React.ReactNode;
  containsPrimaryInput: boolean;
}

export default function Box({
  mainText,
  placeholderText,
  closeFunction,
  submitFunction,
  inputValue,
  inputChangeFunction,
  loading,
  loadingMessage,
  children,
  containsPrimaryInput,
}: Props) {
  return (
    <div id="box" className="main-component">
      <header id="box-header">{mainText}</header>
      {}
      {containsPrimaryInput && (
        <form onSubmit={submitFunction!} id="box-form">
          <input
            className="text-input"
            placeholder={placeholderText}
            id="box-input"
            type="text"
            name="box-input"
            value={inputValue!}
            onChange={(e) => inputChangeFunction!(e.target.value)}
            autoFocus
          />
          <button className="plain-button" id="box-submit" type="submit">
            <i className="fa-solid fa-3x fa-square-arrow-up-right"></i>
          </button>
        </form>
      )}
      <Close onClose={closeFunction} />
      {children && children}
      {loading && <div className="loading">{loadingMessage}</div>}
    </div>
  );
}
