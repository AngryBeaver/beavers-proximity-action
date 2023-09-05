import {NAMESPACE} from "../Settings.js";
import {bpa} from "./Activity.js";

export class ActivityStore {

    _data:{
        [activityId:string]:bpa.ActivityStoreData
    }
    _scene:Scene;

    constructor(scene:Scene){
        this._data = {};
        this._scene=scene;
        const flags = scene.getFlag(NAMESPACE,"activity") as {
            [activityId:string]:bpa.ActivityStoreData
        };
        this._data = flags || {};
    }

    public get(activityId:string):bpa.ActivityStoreData{
        this._data[activityId] = this._data[activityId] || {
            results:[],
            actions:{
                default:[],
                fallback:[]
            }
        };
        return this._data[activityId];
    }

    /**
     * On Scenes GMs can register additional Actions for an activity on this scene
     * They are persisted with activityStore.
     * @param actionData
     */
    public async addAction(activityId:string,actionData:bpa.ActionStoreData){
        this.get(activityId)[actionData.priority].push(actionData);
        //TODO this will always store all activity data maybe only update the change.
        await this._scene.setFlag(NAMESPACE,"activity",this._data);
    }

    /**
     * users can execute Activities the result can be stored on a scene
     */
    public async addResult(activityId:string,result:bpa.ActivityResult){
        this.get(activityId).results.push(result);
        await this._scene.setFlag(NAMESPACE,"activity",this._data);
    }
}