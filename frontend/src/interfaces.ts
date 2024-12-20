export interface Edge {
    id:string;
    value:string;
    n1:string;
    n2:string;
}

export interface Position {
    x:number;
    y:number;
}

export interface Node {
    id:string;
    value:string;
    pos:Position;
    edges:string[];
}

export interface Size {
    width:number;
    height:number;
}

export interface TempEdge {
    n1: string;
    p1: Position;
    p2: Position;
}
