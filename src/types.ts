type ActivityType = "wall" | "tile";
type ProximityType = "close" | "cone"
type AvailableType = "always" | "once" | "perTile" | "perWall" | "perActor" | "each"


/**
 * ActivityData is the configuration setting for Activities.
 * can be configured globally or comes with as default from Activity declaration
 * holds information on which entity it is enabled per default.
 * holds information on how the Test needs to look like for this Activity.
 */
interface ActivityData {
    enabled: { attribute: string, value: any }[],
    test: Test
}
/**
 * ActivityTemplate describes an Activity
 * it holds configuration fields unique to this Activity that can then be set on the Action.
 * it describes how it should be used programatically.
 * e.g. has a global fallback, Actions can be configured to have subOptions etc.
 */
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
 * in your ActivityDeclaration you should overwrite template and defaultData.
 */
interface Activity {
    new(entityId: string, initiator: Initiator): ActionI
    template: ActivityTemplate,
    data: ActivityData,
    defaultData: ActivityData,
    id: string,
}

/**
 * the request that starts a proximityScan
 */
interface ProximityRequest {
    initiator: InitiatorData,
    distance: number,
    type: ProximityType,
}
/**
 * the response of a proximityScan
 */
interface ProximityResponse {
    origin: Point
    initiator: InitiatorData,
    activities:
        ActivityHit[],
}
/**
 * an ActivityReqeust followed by a proxmityScan
 * will lead to a test
 */
interface ActivityRequest {
    activityHit: ActivityHit,
    initiatorData: InitiatorData,
}
/**
 * an Activity found by a proximityScan including the entities hitted
 */
interface ActivityHit {
    activityId: string,
    name: string,
    type: ActivityType,
    entityIds: string[]
}

interface HitAreaData {
    tileIds: string[],
    wallIds: string[],
    polygon: number[]
}

interface BeaversProximityActionI {
    getActivities: (type: ActivityType) => Activity[],
    getActivity: (type: ActivityType, actionId: string) => Activity,
    scanProximity: (request: ProximityRequest) => ProximityResponse;
}

/**
 * An ActivityInstance
 * configured with the entity it is activated on the initiator that activates it and all global and individual configurations.
 * it has one Run method that is executed with the TestResult given.
 */
interface ActionI {
    entity: any;
    config: any;
    initiator: InitiatorData;
    run:(TestResult)=>Promise<void>;
}
interface ActivityLayerI {
    drawActivity:(points: number[], id:string, color?:string)=>void
}
interface SettingsI {
    addActivity:(activity: Activity)=>void,
    getActivityData:(activityId: string)=>ActivityData,
}







type InputType = "text" | "number" | "area" | "selection" | "boolean" ;
type TestType = "skill" | "ability" | "hit" | "input" | "prompt" ;
type MsgType = "info" | "warn" | "error";

interface InputField {
    label: string,
    type: InputType,
    note?: string,
    defaultValue?: any,
    choices?: {
        [id:string]:{text:string,img?:string}
    }
}

interface Test {
    type: TestType
    name: string
    inputField: InputField
}

interface TestResult {
    type: InputType,
    fails?: number,
    value?: string | number | boolean,
}

interface DisplayModule {
    msg: (msg: string, type: MsgType,initiatorData:InitiatorData ) => Promise<void>
    prompt: (inputField:InputField,initiatorData:InitiatorData)=>Promise<boolean|null>
    input: (inputField: InputField,initiatorData:InitiatorData)=>Promise<any>
}

interface InitiatorData {
    userId: string,
    actorId: string,
    tokenId: string,
    sceneId: string,
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

