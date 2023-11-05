import {BPAEngine} from "../activities/BPAEngine.js";
import {bpa} from "../bpaTypes.js";
import {NAMESPACE} from "../Settings.js";

export class BeaversProximityAction implements BeaversProximityActionI{

    public currentSceneId:string;
    private _data:{
        [sceneId:string]:BPAEngine
    }={};
    private _actionClasses:{
        [activityId:string]:{
            [actionClassId:string]:any
        }
    }={};
    private _activityClasses:{
        [activityId:string]:bpa.ActivityClass
    }={};


    /**
     * socket can execute Activity on scene
     */
    public async executeActivity(sceneId:string,activityId:string,activityResult:bpa.ActivityResult){
        await this.initializeBPAEngine(sceneId)
        await this._data[sceneId].executeActivity(activityId,activityResult);
    }

    /**
     * UserInteraction can get current bpa engine synchronous if available
     */
    public getBPAEngine(): BPAEngine{
        return this._data[this.currentSceneId];
    }


    /**
     * Modules can add activityClasses
     * They are not stored and needs to be registered each time with a ready hook.
     */
    public addActivityClass(activityClass:bpa.ActivityClass){
        this._activityClasses[activityClass.defaultData.id] = activityClass;
        game[NAMESPACE].Settings.addActivity(activityClass);
        for(const bpaEngine of Object.values(this._data)){
            bpaEngine.addActivity(activityClass);
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
     * is called on each client whenever a scene is changing
     * @param sceneId
     */
    public async activateScene(){
        if(this._data[this.currentSceneId]){
            this._data[this.currentSceneId].disableHooks();
        }
        const currentSceneId = this.defaultSceneId();
        await this.initializeBPAEngine(currentSceneId);
        this.currentSceneId = currentSceneId;
        this._data[this.currentSceneId].enableHooks();
    }

    private async initializeBPAEngine(sceneId:string){
        if(!this._data[sceneId]) {
            this.currentSceneId = "";
            const scene = await fromUuid(sceneId) as Scene;
            this._data[sceneId] = new BPAEngine(scene);
            for(const activityClass of Object.values(this._activityClasses)){
                this._data[sceneId].addActivity(activityClass)
            }
        }
    }

    private defaultSceneId(){
        return canvas?.scene?.uuid || "";
    }

}