import {ActivityResultStoreClass} from "./ActivityResultStoreClass.js";
import {ActionGridClass} from "./ActionGridClass.js";
import {ProximitySquareGrid} from "./ProximitySquareGrid.js";

export class BeaversProximityAction {

    private _data:{
        [sceneId:string]:{
            activityResultStore:ActivityResultStore,
            actionGrid:ActionGrid,
            appStatus:{
                [appId:string]:string,
            }
        }
    }={};
    _actionApps:ActionApp[]=[];

    public getActivityResultStore(sceneId:string=this.defaultSceneId()):ActivityResultStore|null{
        if(!this._data[sceneId]){
            return null;
        }
        return this._data[sceneId].activityResultStore
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
            const grid = new ProximitySquareGrid();
            const actionGrid = new ActionGridClass(activityResultStore, grid);
            this._data[sceneId] = {
                activityResultStore: activityResultStore,
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