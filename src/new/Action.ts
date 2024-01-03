import {bp} from "./types.js";

export class Action {

    /**
     * Actions can have defaultData merged with data Stored inside Activity
     * @param parent
     * @param data
     */
    constructor(data = {}) {
        if (new.target === ActionDefinition) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        // @ts-ignore
        this._data = foundry.utils.mergeObject(this.constructor.data, data, {
            insertKeys: true,
            insertValues: true,
            overwrite: true,
            inplace: false
        });
    }

    public get id() {
        return this._data.id;
    }




}
