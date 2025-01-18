import Close from "../components/Close";

interface Props {
    children: React.ReactNode;
    onClose: ()=>void;
}


export default function TopBox({
    children,
    onClose
  }: Props) {
    return (
        <div className="main-component message">
        {children}
         <Close
          onClose={onClose}
        />
      </div>
    );
  }
