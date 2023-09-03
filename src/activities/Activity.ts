import {NAMESPACE} from "../Settings.js";
import {BPAEngine} from "./BPAEngine.js";
import {Action} from "./Action.js";

export declare namespace bpa {
    interface ActivityData {
        id:string,
        testOptions:TestOptions,
        actionClasses:{
            [actionClassId:string]:typeof Action
        },
        actions:ActionStoreData[],
        configurations:{
            [configId:string]:{
                inputData:InputData,
                defaultValue:any,
            }
        },
        results:[]
    }
    interface ActionData extends ActionStoreData{
        id:string,
        location:ActionLocation
        available:{
            type:AvailableType
        }
        priority:PriorityType
    }
    interface ActionStoreData {
        classId:string,
        location?:ActionLocation
        available?:{
            type:AvailableType
        }
        priority?:PriorityType
    }

    interface InputData {
        label:string,
        type:string,
    }
    interface ActivityStoreData{
        results:ActivityResultData[],
        actions:ActionStoreData[]
    }
}

/**
 * There is exactly one activity instance per scene
 */
export class Activity {
     _data:bpa.ActivityData;
     _parent:BPAEngine;
     _sceneId:string;

     constructor(parent:BPAEngine, sceneId:string) {
         if (new.target === Activity) {
             throw new TypeError("Cannot construct Abstract instances directly");
         }
         this._parent = parent;
         this._sceneId = sceneId;
         const storedOptions = this._parent.activityStore.get(this.id) || {};

         // merge Activity defaultData with activityStoreData
         // @ts-ignore
         this._data = foundry.utils.mergeObject(this.constructor.defaultData, storedOptions, {
             insertKeys: true,
             insertValues: true,
             overwrite: true,
             inplace: false
         });
     }

    get id():string {
        return this._data.id;
    }

    /**
     * An actionClass can be preconfigured with its Activity within the defaultData
     * or modules can register Actions on BeaversProximityAction to extend an existing Activity.
     */
    public getActionClasses(){
        return {...this._data.actionClasses,...game[NAMESPACE].BeaversProximityAction.getActionClasses(this.id)}
    }

    /**
     * On Scenes GMs can register additional Actions for this Activity on this scene
     * They are persisted with activityStore.
     * @param actionData
     */
    public async addAction(actionData:bpa.ActionStoreData):Promise<void> {
        this._data.actions.push(actionData);
        return this._parent.activityStore.addAction(this.id,actionData);
    }

    /**
     * Activities can load a global configuration value either from scene or settings
     * @param configId
     */
    public getConfigValue(configId:string):any{
        //TODO load from scene or settings;
        return this._data.configurations.value
    }
}