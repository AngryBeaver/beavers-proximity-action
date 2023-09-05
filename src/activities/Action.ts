import {Activity, bpa} from "./Activity.js";
import ActivityGrid = bpa.ActivityGrid;


export abstract class Action {
    _parent: Activity;
    _data: bpa.ActionData;

    /**
     * Actions can have defaultData merged with data Stored inside Activity
     * @param parent
     * @param data
     */
    constructor(parent: Activity, data = {}) {
        if (new.target === Action) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this._parent = parent;

        // @ts-ignore
        this._data = foundry.utils.mergeObject(this.constructor.defaultData, data, {
            insertKeys: true,
            insertValues: true,
            overwrite: true,
            inplace: false
        });
    }

    public get id() {
        return this._data.id;
    }

    public get parentId() {
        return this._parent.id;
    }

    /**
     * an activity can ask if its actions are available to a proximity request.
     */
    public isAvailable(actorId:string,activityGrids:bpa.ActivityGrid[]):boolean{

        //TODO
        return false
    }
    //TODO change to HITAREA
    public isAvailable(actorId: string, activityGrid:bpa.ActivityGrid):boolean {
        const activityResults = this._parent._data.results;//TODO fix me
        const type = this._data.available;
        const gridId = activityGrid[0];
        const wall= activityGrid[1];
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

    /**
     * bpa-engine is executing verifyResult on each Action of an Activity.
     * @param result
     */
    abstract execute(activityResult: bpa.ActivityResult):Promise<boolean>

}
