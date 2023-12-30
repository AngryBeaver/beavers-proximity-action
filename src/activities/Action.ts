import {Activity} from "./Activity.js";
import {bpa} from "../bpaTypes.js";
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

    private _validateTileId(tileId:string):boolean{
        const tile = this._getTile(tileId);
        for(const filter of this._data.location.filter) {
            if (beaversSystemInterface.objectAttributeGet(tile, filter.attribute) !== filter.value) {
                return false;
            }
        }
        return true;
    }
    private _validateWallId(wallId:string):boolean{
        const wall = this._getWall(wallId);
        for(const filter of this._data.location.filter) {
            if (beaversSystemInterface.objectAttributeGet(wall, filter.attribute) !== filter.value) {
                return false;
            }
        }
        return true;
    }

    protected _getWall(wallId:string):WallDocument|undefined {
        return this._parent._parent._scene.walls.get(wallId)
    }

    protected _getTile(tileId:string):TileDocument|undefined {
        return this._parent._parent._scene.tiles.get(tileId)
    }

    /**
     * filter the HitArea to match only the action location,
     * when executing a single Action it should have reduced HitArea to this action only.
     * @param hitArea
     */
    public filterHitArea(hitArea:HitArea):HitArea{
        const result:HitArea = {
            tileIds:[],
            wallIds:[],
            polygon: hitArea.polygon
        }
        for(const tileId of hitArea.tileIds){
            if(this._validateTileId(tileId)){
                result.tileIds.push(tileId);
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
