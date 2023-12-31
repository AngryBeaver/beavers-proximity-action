type InputType = "text" | "number" | "area" | "selection";

interface InputField {
    label: string,
    type: InputType,
    note?: string,
    defaultValue?: any,
    choices?: {
        [id:string]:{text:string,img?:string}
    }
}

interface InputData {
    inputField: InputField,
    value: any,
    name: string
}


interface BeaversProximityActionI {

}

interface Edge {
    p1: Point,
    p2: Point
}
interface Polygon {
    edges: Edge[],
    bounds: Bounds,
}
interface Bounds {
    x:number,
    y:number,
    width: number,
    height: number
}
/*********************************** extend foundry types */
interface Game {
    "beavers-proximity-action":{
        BeaversProximityAction:BeaversProximityActionI,
    }
}

/*********************************** fix foundry types */
interface ClockwiseSweepPolygon {
    _constrainBoundaryShapes:()=>void
    addPoint:(pt:PolygonVertex)=>void
    _switchEdge:(result:CollisionResult, activeEdges?:any)=>void
    // @ts-ignore
    _isVertexBehindActiveEdges:(vertex:PolygonVertex, activeEdges:EdgeSet)=>{isBehind:boolean, wasLimited:boolean}
}


interface TileDocument {
    x:number,
    y:number,
    width: number,
    height: number,
}

interface User {
    id: string,
}

interface CollisionResult {
    target:PolygonVertex
}
interface PolygonEdge {
    wall?:Wall
}
interface PolygonVertex {
    isEndpoint:boolean
}
