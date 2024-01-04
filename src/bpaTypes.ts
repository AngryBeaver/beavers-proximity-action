
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


import {Action} from "./activities/Action.js";
import {Activity} from "./activities/Activity.js";
import {BPAEngine} from "./activities/BPAEngine.js";

type ProximityType = "close" | "cone"
type LocationType = "wall" | "tile" ;
//version1 only use "always" until we can clean up again.
type AvailableType = "always" | "once" | "perTile" | "perWall" | "perActor" | "each"
type PriorityType = "fallback" | "normal"


export const PriorityTypeOrder: PriorityType[] = ["normal", "fallback"];

export declare namespace bpa {
    //version1 do not use "choices" until ui is build for it.
    type TestType = "skill" | "ability" | "hit" | "choices" | "input" | "prompt";


    interface ActionLocation {
        type: LocationType
        filter: {attribute: string, value: any}[],
        isGlobal: boolean
    }

    interface ActionData extends ActionStoreData {
        id: string,
        location: ActionLocation
        available: {
            type: AvailableType
        }
    }

    interface ActionStoreData {
        classId: string,
        priority: PriorityType,
        location?: ActionLocation
        available?: {
            type: AvailableType
        }
    }

    interface ActionClass {
        new(activity: Activity, options?: any): Action
        [any: string]: any,
    }

    interface ActivityClass {
        new(parent: BPAEngine, sceneId: string): Activity
        defaultData:ActivityData
        [any: string]: any,
    }

    interface ActivityStoreData {
        results: ActivityResult[],
        actions: {
            normal: ActionStoreData[],
            fallback: ActionStoreData[]
        }
    }
    interface ActivityData extends ActivityStoreData {
        id: string,
        name: string,
        config: ActivityConfiguration,
        test:{
            name:string,
            options: TestOptions
        }
        actionClasses: {
            [actionClassId: string]: bpa.ActionClass
        }
    }
    interface ActivityTest {
        name:string,
        options: TestOptions
    }

    interface ActivitySettings {
        enabled:boolean,
        test:{
            options: TestOptions
        }
    }

    interface ActivityRequest {
        actorId: string,
        activityId: string,
        hitArea: HitArea
    }
    interface ActivityResult {
        testResult: TestResult,
        hitArea: HitArea,
        actorId: string
    }

    interface ProximityRequest {
        token: Token,
        distance: number,
        type: ProximityType,
        color?: string,
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


    interface Grid {
        getProximityGrids: (request: ProximityRequest) => Point[];
        getGrid: (point: Point) => Point;
        getGrids: (token: Token) => string[];
        centerOfGridId: (gridId:string)=>Point;
        getGridId: (point: Point) => string;
    }

    interface TestResult {
        text?: string,
        number?: number,
        isSuccess?: boolean,
        testId: string,
    }

    interface HitArea {
        tileIds: string[],
        wallIds: string[],
        polygon: number[]
    }

    interface TestOptions {
        [testId:string]: Test
    }

    interface Test {
        id:string,
        type: TestType
        name?: string //contains selected skill/ability id
        choices?: {
            [id:string]:{text:string,img?:string}
        }
        inputDialog?: InputDialog
        promptDialog?: PromptDialog
        defaultValue?:any
    }
    interface ActivityConfiguration {
        [configId: string]: InputField,
    }


    interface InputDialog {
        title?:string,
        label:string,
        type:InputType
    }
    interface PromptDialog {
        title?:string,
        label:string,
    }
}

