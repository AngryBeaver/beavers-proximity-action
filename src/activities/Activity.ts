import {NAMESPACE} from "../Settings.js";
import {BPAEngine} from "./BPAEngine.js";
import {Action} from "./Action.js";
import {TestHandler} from "../TestHandler.js";
import {bpa, PriorityTypeOrder} from "../types.js";


/**
 * There is exactly one activity instance per scene
 */
export class Activity {
    _data: bpa.ActivityData;
    _parent: BPAEngine;
    _sceneId: string;

    static getId():string{
        throw new Error("overwrite static getID() in your activity");
    }

    constructor(parent: BPAEngine, sceneId: string) {
        if (new.target === Activity) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this._parent = parent;
        this._sceneId = sceneId;
        // @ts-ignore
        const storedOptions = this._parent.activityStore.get(this.constructor.getId()) || {};

        // merge Activity defaultData with activityStoreData
        // @ts-ignore
        this._data = foundry.utils.mergeObject(this.constructor.defaultData, storedOptions, {
            insertKeys: true,
            insertValues: true,
            overwrite: true,
            inplace: false
        });
    }

    get id(): string {
        return this._data.id;
    }

    get name(): string {
        return this._data.name;
    }

    /**
     * An actionClass can be preconfigured with its Activity within the defaultData
     * or modules can register Actions on BeaversProximityAction to extend an existing Activity.
     */
    public getActionClasses(): { [classId: string]: bpa.ActionClass } {
        return {...this._data.actionClasses, ...game[NAMESPACE].BeaversProximityAction.getActionClasses(this.id)}
    }

    /**
     * On Scenes GMs can register additional Actions for this Activity on this scene
     * They are persisted with activityStore.
     * @param actionData
     */
    public async addAction(actionData: bpa.ActionStoreData): Promise<void> {
        if (actionData.priority)
            this._data.actions[actionData.priority] = this._data.actions[actionData.priority] || [];
        this._data.actions[actionData.priority].push(actionData);
        return this._parent.activityStore.addAction(this.id, actionData);
    }

    /**
     * bpa can detect if this activity is available on hitArea
     * it will be true if any action is available to this request.
     */
    public isAvailable(actorId: string, hitArea: bpa.HitArea): boolean {
        for (const priority of PriorityTypeOrder) {
            for (const actionData of this._data.actions[priority]) {
                if (this._isActionAvailable(actionData, actorId, hitArea)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * bpa can execute an activity which will execute on all actions
     * actions are executed in priority order
     * if an action executed with success it will stop execution for all lower priority ordered executions.
     */
    public async execute(actorId: string, hitArea:bpa.HitArea) {
        if (!this.isAvailable(actorId, hitArea)) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noAvailableActionsFound"));
        }
        const actor = await fromUuid(actorId) as Actor;
        if (!actor) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noActorOnToken"));
        }
        //TODO throw this back to caller client.
        const testResult = await new TestHandler(this._data.testOptions, actor).test();
        if (testResult !== null) {
            const result: bpa.ActivityResult = {
                testResult: testResult,
                hitArea: hitArea,
                actorId: actorId
            }
            this._executeActions(result);
            this._data.results.push(result)
            this._parent.activityStore.addResult(this.id,result)
        }
    }


    /**
     * executes all actions on activity in priority order
     * will stop at a priority if any action of that priority returned success
     * @param testResult
     * @private
     */
    private async _executeActions(activityResult: bpa.ActivityResult) {
        let stopExecution = false;
        for (const priority of PriorityTypeOrder) {
            if (!stopExecution) {
                for (const actionData of this._data.actions[priority]) {
                    const action = this._getAction(actionData);
                    stopExecution = await action.execute(activityResult)
                }
            }
        }
    }

    /**
     * Activities can load a global configuration value either from scene or settings
     * @param configId
     */
    public getConfigValue(configId: string): any {
        //TODO load from scene or settings;
        return this._data.configurations.value
    }

    /**
     * Action from actionData
     * @param actionData
     * @private
     */
    private _getAction(actionData: bpa.ActionData): Action {
        const clazz = this.getActionClasses()[actionData.classId];
        return new clazz(this, actionData);
    }

    private _isActionAvailable(actionData: bpa.ActionData, actorId: string, hitArea: bpa.HitArea): boolean {
        const activityResults = this._data.results;
        const type = actionData.available.type;
        let result = (type === "always") || (type === "once" && activityResults.length === 0)
            || (type === "perActor" && activityResults.filter(a => actorId === a.actorId).length === 0)
        if(result) {
            return true;
        }
        for (const gridId of hitArea.gridIds) {
            result = (type === "perGrid" && activityResults.filter(a => a.hitArea.gridIds.includes(gridId)).length === 0)
                || (type === "each" && activityResults.filter(a =>(actorId === a.actorId && a.hitArea.gridIds.includes(gridId))).length === 0)
            if(result){
                return true;
            }
        }
        for (const wallId of hitArea.wallIds) {
            result = (type === "perWall"  && activityResults.filter(a => a.hitArea.wallIds.includes(wallId)).length === 0)
                || (type === "each" && activityResults.filter(a =>(actorId === a.actorId && a.hitArea.wallIds.includes(wallId))).length === 0)
            if(result){
                return true;
            }
        }
        return false;
    }


}