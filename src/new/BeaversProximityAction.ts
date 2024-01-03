export class BeaversProximityAction implements BeaversProximityActionI{

    private actions:{
        [activityId:string]:{
            [actionClassId:string]:any
        }
    }={};

    /**
     * socket can execute Actions
     */
    public async executeAction(){
        await this.initializeBPAEngine(sceneId)
        await this._data[sceneId].executeActivity(activityId,activityResult);
    }

    /**
     * Modules can add Actions by register additional ActionClasses.
     * They are not stored and needs to be registered each time with a ready hook.
     */
    public addAction( ){
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

    public getActivities(type):bpa.ActivityClass[]{
        return Object.values(this._activityClasses).filter(a=>a.prototype instanceof type);
    }

    private defaultSceneId(){
        return canvas?.scene?.uuid || "";
    }

}