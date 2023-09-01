import {NAMESPACE} from "./main.js";

export class ActivityResultStoreClass implements ActivityResultStore {

    _data:{
        [actionId:string]:ActivityResultData[]
    }
    scene:Scene;

    constructor(scene:Scene){
        this._data = {};
        this.scene=scene;
        const flags = scene.getFlag(NAMESPACE,"activityResult") as {
            [actionId:string]:ActivityResultData[]
        };
        this._data = flags || {};
    }

    public get(actionId:string):ActivityResultData[]{
        return this._data[actionId] || [];
    }

    public async add(actionId:string,result:ActivityResultData){
        this.get(actionId).push(result);
        await this.scene.setFlag(NAMESPACE,"activityResult",this._data);
    }
}