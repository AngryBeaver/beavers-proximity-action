import {Activity, bpa} from "./Activity.js";

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
     * bpa-engine is executing verifyResult on each Action of an Activity.
     * @param result
     */
    abstract execute(result: bpa.ActivityResult):Promise<boolean>

}
