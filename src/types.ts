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

import {Action} from "./activities/Action";
import {Activity} from "./activities/Activity";

type ProximityType = "close" | "cone"
type TestType = "skill" | "ability" | "hit" | "choices" | "input" | "prompt";
type LocationType = "wall" | "grid" ;
type AvailableType = "always" | "once" | "perGrid" | "perWall" | "perActor" | "each"
type PriorityType = "fallback" | "normal"


export const PriorityTypeOrder: PriorityType[] = ["normal", "fallback"];

export declare namespace bpa {
    type ProximityGrids = [distance: number,grids: string[]][];
    interface ActivityData extends ActivityStoreData {
        id: string,
        name: string
        testOptions: TestOptions,
        actionClasses: {
            [actionClassId: string]: bpa.ActionClass
        },
        actions: {
            default: ActionStoreData[],
            fallback: ActionStoreData[]
        },
        configurations: {
            [configId: string]: {
                inputData: InputData,
                defaultValue: any,
            }
        },
        results: ActivityResult[]
    }

    interface ActionLocation {
        type: LocationType
        //or directly actionSpaces
        gridIds: string[],
        //or walls
        wallFilter: [attribute: string, value: any][],
        isGlobal: boolean
    }

    interface ActionData extends ActionStoreData {
        id: string,
        location: ActionLocation
        available: {
            type: AvailableType
        }
        priority: PriorityType
    }

    interface ActionStoreData {
        classId: string,
        priority: PriorityType,
        location?: ActionLocation
        available?: {
            type: AvailableType
        }
    }

    interface InputData {
        label: string,
        type: string,
    }

    interface ActivityStoreData {
        results: ActivityResult[],
        actions: {
            default: ActionStoreData[],
            fallback: ActionStoreData[]
        }
    }

    interface ActionClass {
        new(activity: Activity, options?: any): Action
        [any: string]: any,
    }


    interface ProximityRequest {
        token: Token,
        actorId: string,
        distance: number,
        type: ProximityType
    }

    interface ProximityResult {
        origin: Point
        actorId: string,
        activities:
            {
                id: string,
                name: string
            }[],
        hitArea:HitArea,
    }


    interface ActivityRequest {
        actorId: string,
        activityId: string,
        hitArea: HitArea
    }

    interface Grid {
        getProximityGrids: (request: ProximityRequest) => ProximityGrids;
        getGrid: (point: Point) => Point;
        getGrids: (token: Token) => string[];
        centerOfGridId: (gridId:string)=>Point;
    }

    type ActivityGrid = [gridId: string, wall?: Wall];

    interface TestResult {
        text?: string,
        number?: number,
        isSuccess?: boolean,
        testId: string,
    }

    interface ActivityResult {
        testResult: TestResult,
        hitArea: HitArea,
        actorId: string
    }

    interface HitArea {
        gridIds: string[],
        wallIds: string[]
    }

    interface TestOptions {
        [testId:string]: Test
    }

    interface Test {
        id:string,
        name:string
        choices?: {
            [id:string]:{text:string,img?:string}
        }
        inputDialog?: InputDialog
        promptDialog?: PromptDialog
        type: TestType
    }

    interface InputDialog {
        title?:string,
        label?:string,
        type?:string
    }
    interface PromptDialog {
        title?:string,
        label?:string,
    }
}

