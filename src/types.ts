type TestType = "skill" | "ability" | "hit" | "choices" | "input" | "prompt";
type ActivityType = "wall" | "tile";
type ProximityType = "close" | "cone"
type AvailableType = "always" | "once" | "perTile" | "perWall" | "perActor" | "each"

interface Test {
    type: TestType
    name: string
    inputField?: InputField
}

//each Activity has ActivityData
interface ActivityData {
    enabled: { attribute: string, value: any }[],
    test: Test
}

interface ActivityTemplate {
    id: string,
    name: string,
    desc: string,
    config: {
        [configId: string]: InputField,
    },
    allowSubOptions?: boolean,
    fallback?: (initiator: Initiator) => void,//fallback when no tile is successfull.
}

/**
 * An Activity is the class Action the instance of this class.
 */
interface Activity {
    new(entityId: string, initiator: Initiator): ActionI
    template: ActivityTemplate,
    data: ActivityData,
    defaultData: ActivityData,
    id: string,
}

interface EntityActionConfig {      //this is stored in entity.flags.
    [actionId: string]: {
        subCheck?: string               //allow for additional user choice "search Table, investigate footprint"
        config: any,
    }
}

interface UserOutput {
    msg: (msg: string, type: "info | warn | error") => Promise<void>
}

interface InitiatorData {
    userId: string,
    actorId: string,
    tokenId: string,
    sceneId: string,
}


interface ProximityRequest {
    initiator: InitiatorData,
    distance: number,
    type: ProximityType,
}

interface ProximityResponse {
    origin: Point
    initiator: InitiatorData,
    actions:
        {
            id: string,
            name: string
        }[],
    hitArea: HitAreaData,
}

interface HitAreaData {
    tileIds: string[],
    wallIds: string[],
    polygon: number[]
}

interface BeaversProximityActionI {
    getActivities: (type: ActivityType) => {[id:string]:Activity},
    getActivity: (type: ActivityType, actionId: string) => Activity,
    scanProximity: (request: ProximityRequest) => ProximityResponse;
}
interface ActionI {
    entity: any;
    config: any;
    initiator: InitiatorData;
    success(): void;
    fail(): void;
}
interface ActivityLayerI {
    drawActivity:(points: number[], id:string, color?:string)=>void
}
interface SettingsI {
    addActivity:(activity: Activity)=>void,
    getActivityData:(activityId: string)=>ActivityData,
}







type InputType = "text" | "number" | "area" | "selection" | "boolean" ;

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
        ActivityLayer: ActivityLayerI,
        Settings: SettingsI
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

