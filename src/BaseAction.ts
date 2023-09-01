//TODO problem with storing and callback method.
//actions are registered by other modules action ids will change except other modules define the ids "module name prefix ?"

import {NAMESPACE} from "./main";

export class BaseAction implements Action {

    _data:ActionData;
    activityResultStore:ActivityResultStore;

    constructor(actionData:ActionData){
        this._data = actionData;
        this.activityResultStore = game[NAMESPACE].ActivityResultStore;
    }

    public get id():string {
        return this._data.id;
    }
    public get activityId():string {
        return this._data.activityId;
    }

    public async activate(data:ActivityResultData){
        return await this._data.onActivate(data);
    }

    public isMatchingGrid(gridId:string){
        if(this._data.location.isGlobal){
            return true;
        }
        if(gridId in this._data.location.gridIds){
            return true;
        }
        return false;
    }

    public isMatchingWall(wall:Wall){
        if(this._data.location.isGlobal){
            return true;
        }
        let isMatchingWall = true;
        for (const [attribute, value] of this._data.location.wallFilter) {
            if (beaversSystemInterface.objectAttributeGet(wall, attribute) !== value) {
                isMatchingWall = false;
            }
        }
        return isMatchingWall;
    }

    public isAvailable(gridId: string, actorId: string, wall: Wall|undefined=undefined) {
        const activityResults = this.activityResultStore.get(this.id);
        const type = this._data.available.type;
        if(this._data.available.isAvailable && !this._data.available.isAvailable(gridId,actorId,wall)){
            return false;
        }
        return (type === "always")
            || (type === "once" && activityResults.length === 0)
            || (type === "perGrid" && activityResults.filter(a => gridId in a.gridIds).length > 0)
            || (type === "perWall" && wall?.id && activityResults.filter(a => wall?.id in a.wallIds).length > 0)
            || (type === "perActor" && activityResults.filter(a => actorId === a.actorId).length > 0)
            || (type === "each" && activityResults.filter(a => actorId === a.actorId).length > 0 && (
                (wall?.id && activityResults.filter(a => wall?.id in a.wallIds).length > 0)
                || (!wall && activityResults.filter(a => gridId in a.gridIds).length > 0)
            ));
    }

}