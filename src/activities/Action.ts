import {Activity} from "./Activity.js";
import {bpa} from "../types.js";
import HitArea = bpa.HitArea;


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

    private _validateGridId(gridId:string):boolean{
        return this._data.location.gridIds.includes(gridId);
    }
    private _validateWallId(wallId:string):boolean{
        const wall = canvas?.scene?.walls.get(wallId);
        for(const wallFilter of this._data.location.wallFilter) {
            if (beaversSystemInterface.objectAttributeGet(wall, wallFilter.attribute) != wallFilter.value) {
                return false;
            }
        }
        return true;
    }

    /**
     * filter the HitArea to match only the action location,
     * when executing a single Action it should have reduced HitArea to this action only.
     * @param hitArea
     */
    public filterHitArea(hitArea:HitArea):HitArea{
        const result:HitArea = {
            gridIds:[],
            wallIds:[]
        }
        for(const gridId of hitArea.gridIds){
            if(this._validateGridId(gridId)){
                result.gridIds.push(gridId);
            }
        }
        for(const wallId of hitArea.wallIds){
            if(this._validateWallId(wallId)){
                result.wallIds.push(wallId);
            }
        }
        return result;
    }

    /**
     * bpa-engine is executing verifyResult on each Action of an Activity.
     * @param result
     */
    abstract execute(result: bpa.ActivityResult):Promise<boolean>


}
