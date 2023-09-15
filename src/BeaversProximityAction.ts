import {BPAEngine} from "./activities/BPAEngine.js";
import {bpa} from "./types.js";
import {NAMESPACE} from "./Settings.js";

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
        [activityId:string]:bpa.ActivityClass
    }={};

    /**
     * socket can execute Activity on scene
     */
    public async executeActivity(sceneId:string,activityId:string,activityResult:bpa.ActivityResult){
        await this.activateScene(sceneId)
        await this._data[sceneId].executeActivity(activityId,activityResult);
    }

    /**
     * UserInteraction can get current bpa engine synchronous if available
     */
    public getBPAEngine(): BPAEngine{
        return this._data[this.defaultSceneId()];
    }


    /**
     * Modules can add activityClasses
     * They are not stored and needs to be registered each time with a ready hook.
     */
    public addActivityClass(activityClass:bpa.ActivityClass){
        this._activityClasses[activityClass.defaultData.id] = activityClass;
        const currentSceneId = this.defaultSceneId();
        game[NAMESPACE].Settings.addActivity(activityClass);
        if(this._data[currentSceneId]){
            this._data[currentSceneId].addActivity(activityClass);
        }
    }

    /**
     * Modules can extend existing Activities by register additional ActionClasses.
     * They are not stored and needs to be registered each time with a ready hook.
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
        for(const activityClass of Object.values(this._activityClasses)){
            this._data[sceneId].addActivity(activityClass)
        }
    }

    private defaultSceneId(){
        return canvas?.scene?.uuid || "";
    }

}