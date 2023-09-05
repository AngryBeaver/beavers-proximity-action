import {ProximitySquareGrid} from "./ProximitySquareGrid.js";
import {ActivityStore} from "./activities/ActivityStore.js";
import {Activity} from "./activities/Activity.js";
import {BPAEngine} from "./activities/BPAEngine.js";

export class BeaversProximityAction {

    private _data:{
        [sceneId:string]:BPAEngine
    }={};
    _actionClasses:{
        [activityId:string]:{
            [actionClassId:string]:any
        }
    }={};
    _activityClasses:{
        [activityId:string]:typeof Activity
    }

    /**
     * Modules can add activityClasses
     * They are not stored and needs to be registered each time with a ready hook.
     */
    public addActivityClass(activityId:string, activityClass:typeof Activity){
        this._activityClasses[activityId] = activityClass;
    }

    /**
     * Modules can extend existing Activities by register additional ActionClasses.
     * They are not stored and needs to be registered each time when with a ready hook.
     */
    public addActionClass(activityId:string, actionClassId:string,actionClass){
        this._actionClasses[activityId] = this.getActionClasses(activityId);
        this._actionClasses[activityId][actionClassId] = actionClass;
    }

    /**
     * Activities can lookUp actionClasses that had been registered from other modules
     */
    public getActionClasses(activityId:string){
        return this._actionClasses[activityId] || {};
    }

    /**
     * instanciate BPAEngine for scene if not exists
     * @param sceneId
     */
    public async activateScene(sceneId:string=this.defaultSceneId()){
        if(!this._data[sceneId]) {
            const scene = await fromUuid(sceneId) as Scene;
            this._data[sceneId] = new BPAEngine(scene);
        }
    }


    private defaultSceneId(){
        return canvas?.scene?.uuid || "";
    }

}