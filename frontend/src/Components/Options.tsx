import react from 'react'
import { Position } from '../App'

interface Props {
    handleAddNode:(cursorPos: Position | null) => void;
}

export default function Options({ handleAddNode } : Props) {

    return (
        <div className="component" id='options'>
            <header>Options</header>
            <input type='button' onClick={()=>handleAddNode(null)} value='add node'/>
        </div>
    )
}
