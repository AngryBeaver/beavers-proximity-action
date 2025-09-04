type EntityType = "wall" | "tile" | "region";
type ProximityType = "close" | "cone"
type Point = Canvas.Point
type ScopedInputField = InputField & { scope: InputFieldScope };
type InputFieldScope = "world" | "entity" | "private"
type BeaversDetectionMode = "sight" | "radius" | "touch";



/**
 * ActivityClass
 * - *Entity*ActivityClass
 * - - InvestigateActivity
 * - - - InvestigateActivityCustomized
 *
 * ActivityClass is the interface of all Activities
 * *Entity*ActivityClass is an abstract class for an entity e.g region and comes with some entity specifics e.g. how to interact with this entity
 * InvestigateActivityClass is the concret class that is registered in a world
 * InvestigateActivity is a customized class that
 *
 * An Activity consists of
 *  optionaly conditions who can use it or see it.
 *  optionally tests what needs to be done
 *  an action that can consume the result of the tests
 *
 *  Condition
 *  Is a method consuming the triggering user and the entity it is placed upon
 *  Can consume userInput either globally or entity based
 *
 *  Tests
 *  Is a list of Tests
 *  uses a TestDefinition to define which attributes can be set where
 *  - ❗attributes are part of tests can change without notice.
 *  - ✅attributes can always change also in existing recipes this will anyway break.
 *  - defaultValues can always be set globaly
 *
 *  Action
 *  Is a method consuming the TestResult and triggering user as well as userInput
 */

interface ActivityClass {
  new (entityId: string, initiator: InitiatorI): ActivityInstance;
  // Required static members
  readonly id: string;
  readonly type: EntityType;
  readonly template: ActivityTemplate;
  readonly defaultData: ActivityData;
  customizationFields?: Record<string, InputField>;
  readonly worldData: ActivityData;
  mergeData: (activityData?: Partial<ActivityData>)=> ActivityData
  getConfigs: (any) => EntityConfigs;
}

interface ActivityDetection {
  mode: BeaversDetectionMode;
  radius?: number;
}

/**
 * ActivityConfigs is the configuration for individual Entities.
 * holds information on which activities are active on Entity and individual data stored to those activities.
 */
interface EntityConfigs {
    activities:{
        [uid:string]:EntityConfig
    }
}

/**
 * ActivityConfig is the configuration for one activity on individual Entities.
 * holds information on which activities are active on Entity and individual data stored to those activities.
 */
interface EntityConfig {
   name: string,
   activityId:string,
   activityData?: Partial<ActivityData>
}

/**
 * ActivityData is the configuration setting for Activities.
 * can be configured globally or comes with as default from Activity declaration
 * holds information on which entity it is enabled per default.
 * holds information on how the Test needs to look like for this Activity.
 */
interface ActivityData {
    enabled?: { attribute: string, value: any }[],
    beaversTests?: BeaversTests,
    data: {
      [property:string]:any
    },
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
    inputs: {
        [configId: string]: InputField,
    },
    allowSubOptions?: boolean,
    fallback?: (initiator: InitiatorData) => void,//fallback when no tile is successfull.
    detection: ActivityDetection
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
    type: EntityType,
    entityIds: string[]
}

interface HitAreaData {
    tileIds: string[],
    wallIds: string[],
    polygon: number[]
}

interface BeaversProximityAppI {
    addActivity:(activityClass: ActivityClass) => void,
    getActivities: (type: EntityType) => ActivityClass[],
    getActivity: (activityId: string) => ActivityClass,
    scan:(initiator: InitiatorI) => ProximityResponse
}

/**
 * An ActivityInstance
 * configured with the entity it is activated on the initiator that activates it and all global and individual configurations.
 * it has one Run method that is executed with the TestResult given.
 * run returns a string that is displayed to the user.
 */
interface ActivityInstance {
    entity: any;
    config: EntityConfig;
    data: ActivityData;
    run:(initiator: InitiatorI, testResults:TestResults)=>Promise<string>;
}
interface SettingsI {
    addActivity:(activityClass: ActivityClass)=>void,
    getActivityData:(activityId: string)=>ActivityData,
    setActivityData:(activityId:string, activityData:ActivityData)=>Promise<any>,
    set:(key:string, value:any)=>void
    //getActivitySettingData:(activity:Activity)=>any,
}

type MsgType = "info" | "warn" | "error";

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


interface TabData {
    id: string,
    name: string,
    icon: string,
    group: string,
    content: string,
    onClick: ()=>void
}
interface TestResults extends TestResult {
  maxFails:number,
  maxHits: number
}
interface ActivityOutput {
  clear: () => Promise<void>;
  msg: (msg: string, type?: MsgType) => Promise<void>;
  akk: (label: string) => Promise<boolean|null>;
  choose: (options: { [key: string]: { label: string; note?: string } }, prompt: string) => Promise<string | null>;
}
interface ActivityTestOutput extends ActivityOutput {
  nextTest?: (infoHtml: string, current: TestResults, initiator: InitiatorData) => Promise<boolean>;
  progress?: (current: TestResults, initiator: InitiatorData) => Promise<void>;
}

interface ActivityPayload {
  activityId: string;
  entityId: string;
  testResults: TestResults;
  initiatorData: InitiatorData;
}
interface GmApprovalRequest {
  id: string;
  moduleId: string;
  question: string;
  initiator: InitiatorData;
  created: number;
}

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (e?: unknown) => void;
  settled: boolean;
};
