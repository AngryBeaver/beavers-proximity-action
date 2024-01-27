type ActivityType = "wall" | "tile";
type ProximityType = "close" | "cone"

/**
 * ActivityConfigs is the configuration for individual Entities.
 * holds information on which activities are active on Entity and individual data stored to those activities.
 */
interface ActivityConfigs {
    activities:{
        [uid:string]:{activityId:string, data: {[property:string]:any}}
    }
}

//TODO Rename to ActivitySetting
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
    fallback?: (initiator: InitiatorData) => void,//fallback when no tile is successfull.
}

/**
 * An Activity is the class Action the instance of this class.
 * in your ActivityDeclaration you should overwrite template and defaultData.
 */
interface Activity {
    new(entityId: string, initiator: InitiatorData): ActionI
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
    id: string,
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
    getActivity: (actionId: string) => Activity,
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
    run:(testResult:TestResult)=>Promise<void>;
}
interface ActivityLayerI {
    drawActivity:(points: number[], id:string, color?:string)=>void
}
interface SettingsI {
    addActivity:(activity: Activity)=>void,
    getActivityData:(activityId: string)=>ActivityData,
}






type InputType =  "selection" | "number" | "text" | "area" | "boolean";
type MsgType = "info" | "warn" | "error";
type InputField = TextField | SelectionField | BooleanField | NumberField;
type Test = NoneTest | RollTest | InputTest | GMTest

interface GenericField {
    label: string,
    note?: string,
    defaultValue?: any,
}

interface NumberField extends GenericField{
    type: "number",
    defaultValue?: number,
}

interface BooleanField extends GenericField{
    type: "boolean",
    defaultValue?: boolean,
}

interface TextField extends GenericField{
    type: "text"|"area",
    defaultValue?: string,
}

interface SelectionField extends GenericField{
    type: "selection",
    defaultValue?: string,
    choices: {
        [id:string]:{text:string,img?:string}
    }
}


interface NoneTest {
    type: "none"
}

interface RollTest {
    type: "skill" | "ability"
    inputField: NumberField,
    acceptedResponse: number,
}
interface InputTest {
    type: "input"
    inputField: InputField,
    acceptedResponse: string,
}
interface GMTest {
    type: "gm"
    inputField: BooleanField,
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

