
//usecases
//interact with wall:
//- detect secret doors && add testOptions to walls/secretdoors
//- unlock door || strength break || pickLock || enter passphrase
//- later for gamepad use open doors
//interact with grid:
//- investigate clues on grids + drop clues.
//- advanced search for loot + drop loot || maybe other module e.g. make itempiles visible.
//- advanced search for traps + drop traps || it needs not to trigger the trap that is another module.
//- advanced disable found traps.
//interact with token:
//- advanced quest-giver || other module beavers-crafting
//- advanced anvil || other module beavers-crafting
//- advanced openShop || other module shop ?


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

    interface ActivityStoreData {
        results: ActivityResult[],
        actions: {
            default: ActionStoreData[],
            fallback: ActionStoreData[]
        }
    }
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

