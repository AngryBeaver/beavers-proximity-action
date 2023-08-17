//activities can be registered and are either globally or only on ActionSpaces active.
//each grid can have multiple activities.
//you can execute one activity in your proximity area e.g. on multiple grid spaces next to you.
//you can not execute one action in your proximity area each action correspond to one activity.
//an action can share activities or define a unique activity
//one activity on one grid can trigger multiple Actions. //e.g. overlapping traps.

// for each grid you get all actions
// for each action you get all unique activities. activties + grids = VisualActivities.
// user can choose an activity for all grids available  -> he does not know which actions he triggers
// for an activity on a list of grids you trigger actions to this activity.
// for each action you store the grids and result of the activity.

//usecases
//detect secret doors all "wallAction" -> one action global walls -> test parameter Wall.
//detect traps room "gridAction" global -> one activity global grids
//search for loot "gridAction" global -> usually nothing -> one activity multiple actions per treasure drop.
//place traps -> trap action
//open locked doors -> doorWallAction -> one specific activity per door
//open locked chests -> drag and drop -> one specific activity per chest
//investigate clues -> drag and drop -> one activity multiple actions per clue drop
//enter passphrase for quiz.
//hover icon above token.


//an activity describes how to test.
//when an activity is triggered it executes one test or no test.
//activities can have one or many actions
//an action describe what happens with the result of an activityCheck it returns a success string.
//an action defines if it is available.
//fallbackActions: actions have priority on each grid only the actions with the highest priority will get executed.
//all actions with the same priority on each grid will be executed in parallel.

//detect action is available
//an action can store the gridId, wallId, actorId and successString
//an action is defined for wall or grids.
//an action isAvailable

type ProximityType = "close" | "cone"
type TestType = "skill" | "ability" | "hit" | "choices";
type LocationType = "wall" | "grid" ;
type ActionType = "always" | "once" | "perGrid" | "perWall" | "perActor" | "each"
type PriorityType = "fallback" | "normal"

interface ProximityRequest {
    token:Token
    type: ProximityType,
    distance: number,
}

interface VisualActivity extends Activity {
    origin:Point
    gridIds: string[]
}

interface RegisterActivity {
    name: string,
    mapIcon: string,
    testOptions: TestOptions,
}

interface Activity extends RegisterActivity{
    id:string
}

interface TestOptions {
    [key:number]: Test
}

interface Test {
    id:string,
    choices: {
        [id:string]:{text:string,img?:string}
    }
    type: TestType
}

interface ActivityResult {
    choice?: string,
    value?: number,
    type: TestType,
}

interface ActivityResultData extends ActivityResult {
    actorId: string,
    gridIds: string[],
    wallIds: string[],
}

interface Location {
    type:LocationType
    //or directly actionSpaces
    gridIds: string[],
    //or walls
    wallFilter:[attribute:string,value:string][],
    isGlobal:boolean
}

interface ActionData {
    id: string,
    activityId: string,
    location:Location
    type: ActionType,
    onActivate: (result:ActivityResultData)=>string;
    priority:PriorityType
}

interface Action {
    id:string,
    activityId:string,
    isMatchingGrid:(gridId:string)=>boolean,
    isMatchingWall:(wall:Wall)=>boolean,
    isAvailable:(gridId: string, actorId: string, wall?: Wall)=>boolean,
}

interface ActionGrid {
    activityResults: {
        [actionId:string]:ActivityResultData[]
    }
    getProximity: (request:ProximityRequest) => VisualActivity[],
    executeActivity:(activityId: string, request:ProximityRequest) => Promise<void>,
    registerAction: (action:ActionData) => string,
    unregisterAction: (id:number)=>void,
}
interface Grid {
    getProximityGrids: (request: ProximityRequest) => ProximityGrids;
    getGrid: (point: Point) => Point;
    getGrids: (token: Token) => string[];
    centerOfGridId: (gridId:string)=>Point;
}

interface ActivityResultStore {
    get:(actionId)=>ActivityResultData[],
    add:(actionId,ActivityResultData)=>void,
}

type ProximityGrids = [distance: number,grids: string[]][];

