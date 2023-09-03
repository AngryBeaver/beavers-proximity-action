import {ActivityResultStoreClass} from "./ActivityResultStoreClass.js";
import {ActionGridClass} from "./ActionGridClass.js";
import {ProximitySquareGrid} from "./ProximitySquareGrid.js";
import {ActivityStore} from "./activities/ActivityStore.js";
import {Activity} from "./activities/Activity.js";

export class BeaversProximityAction {

    private _data:{
        [sceneId:string]:{
            activityResultStore:ActivityResultStore,
            activityStore:ActivityStore,
            actionGrid:ActionGrid,
            appStatus:{
                [appId:string]:string,
            }
        }
    }={};
    _actionClasses:{
        [activityId:string]:{
            [actionClassId:string]:any
        }
    }={};
    _activityClasses:{
        [activityId:string]:typeof Activity
    }
    _actionApps:ActionApp[]=[];

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


    public getActivityResultStore(sceneId:string=this.defaultSceneId()):ActivityResultStore|null{
        if(!this._data[sceneId]){
            return null;
        }
        return this._data[sceneId].activityResultStore
    }

    public getActivityStore(sceneId:string=this.defaultSceneId()):ActivityStore|null{
        if(!this._data[sceneId]){
            return null;
        }
        return this._data[sceneId].activityStore
    }

    public getActionGrid(sceneId:string=this.defaultSceneId()):ActionGrid|null{
        if(!this._data[sceneId]){
            return null;
        }
        return this._data[sceneId].actionGrid
    }

    public async activateScene(sceneId:string=this.defaultSceneId()){
        if(!this._data[sceneId]) {
            const scene = await fromUuid(sceneId) as Scene;
            const activityResultStore = new ActivityResultStoreClass(scene);
            const activityStore = new ActivityStore(scene);
            const grid = new ProximitySquareGrid();
            const actionGrid = new ActionGridClass(activityResultStore, grid);
            this._data[sceneId] = {
                activityResultStore: activityResultStore,
                activityStore: activityStore,
                actionGrid: actionGrid,
                appStatus: {},
            }
            this._activateAppsOnScene(sceneId);
        }
    }


    public registerApp(app:ActionApp){
        this._actionApps.push(app);
        this._activateAppOnScene(this.defaultSceneId(),app);
    }

    private _activateAppsOnScene(sceneId:string=this.defaultSceneId()){
        for(const app of this._actionApps){
            this._activateAppOnScene(sceneId,app);
        }
    }

    private _activateAppOnScene(sceneId:string,app:ActionApp){
        if(this._data[sceneId] && !this._data[sceneId].appStatus[app.id]){
            this._data[sceneId].appStatus[app.id] = "loading";
            app.enableOnScene(this._data[sceneId].actionGrid)
                .then(()=>this._data[sceneId].appStatus[app.id] = "loaded");
        }
    }

    private defaultSceneId(){
        return canvas?.scene?.uuid || "";
    }

}