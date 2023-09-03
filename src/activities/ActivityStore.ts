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
            actions:[]
        };
        return this._data[activityId];
    }

    public async addAction(activityId:string,action:bpa.ActionStoreData){
        this.get(activityId).actions.push(action);
        //TODO this will always store all activity data maybe only update the change.
        await this._scene.setFlag(NAMESPACE,"activity",this._data);
    }

    public async addResult(activityId:string,result:ActivityResultData){
        this.get(activityId).results.push(result);
        await this._scene.setFlag(NAMESPACE,"activity",this._data);
    }
}