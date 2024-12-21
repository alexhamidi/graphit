interface Props {
    setEdgeMode: React.Dispatch<React.SetStateAction<boolean>>;
    setDirectedMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Options({ setEdgeMode, setDirectedMode }: Props) {
    return (
        <div id="optionsRow">
            <form className="component">
                <input
                    type="checkbox"
                    onChange={() => setEdgeMode(prev => !prev)}
                    id="edgeMode"
                />
                <label htmlFor="edgeMode">turn on valued edges</label>
            </form>
            <form className="component">
                <input
                    type="checkbox"
                    onChange={() => setDirectedMode(prev => !prev)}
                    id="directedMode"
                />
                <label htmlFor="directedMode">turn on directed edges</label>
            </form>
        </div>
    );
}
