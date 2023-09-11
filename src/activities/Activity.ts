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
    _hooks: {
        [id: string]: number,
    } = {};

    constructor(parent: BPAEngine, sceneId: string) {
        if (new.target === Activity) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this._parent = parent;
        this._sceneId = sceneId;
        // @ts-ignore
        const storedOptions = this._parent.activityStore.get(this.constructor.defaultData.id) || {};
        // @ts-ignore
        const settingsData = game[NAMESPACE].Settings.getActivitySetting(this.constructor.defaultData.id);
        // @ts-ignore
        //settingsData overwrite existing defaultData;
        this._data = {...this.constructor.defaultData, settingsData};
        //storedOptions extend existing actions and overwrite existing results
        this._data.results = storedOptions.results;
        for (const priority of PriorityTypeOrder) {
            this._data.actions[priority].push(...storedOptions.actions[priority]);
        }
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
    public async addAction(actionStoreData: bpa.ActionStoreData): Promise<void> {
        if (actionStoreData.priority)
            this._data.actions[actionStoreData.priority] = this._data.actions[actionStoreData.priority] || [];
        this._data.actions[actionStoreData.priority].push(actionStoreData);
        return this._parent.activityStore.addAction(this.id, actionStoreData);
    }

    /**
     * bpa can detect if this activity is available on hitArea
     * it will be true if any action is available to this request.
     */
    public isAvailable(actorId: string, hitArea: bpa.HitArea): boolean {
        for (const priority of PriorityTypeOrder) {
            for (const actionStoreData of this._data.actions[priority]) {
                const action = this._getAction(actionStoreData)
                if (this._isActionAvailable(action, actorId, hitArea)) {
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
    public async execute(actorId: string, hitArea: bpa.HitArea) {
        if (!this.isAvailable(actorId, hitArea)) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noAvailableActionsFound"));
        }
        const actor = await fromUuid(actorId) as Actor;
        if (!actor) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noActorOnToken"));
        }
        //TODO throw this back to caller client.
        const testResult = await new TestHandler(this._data.test.options, actor).test();
        if (testResult !== null) {
            this._executeActions(testResult,hitArea,actorId);
            //store global proximityHitArea not individual ActionHitAreas
            const result: bpa.ActivityResult = {
                testResult: testResult,
                hitArea: hitArea,
                actorId: actorId
            }
            this._data.results.push(result)
            this._parent.activityStore.addResult(this.id, result)
        }
    }


    /**
     * executes all actions on activity in priority order
     * will stop at a priority if any action of that priority returned success
     * @param testResult
     * @private
     */
    private async _executeActions(testResult:bpa.TestResult, hitArea:bpa.HitArea,actorId:string) {
        let stopExecution = false;
        for (const priority of PriorityTypeOrder) {
            if (!stopExecution) {
                for (const actionData of this._data.actions[priority]) {
                    const action = this._getAction(actionData);
                    const result: bpa.ActivityResult = {
                        testResult: testResult,
                        hitArea: action.filterHitArea(hitArea),
                        actorId: actorId
                    }
                    stopExecution = await action.execute(result)
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
    //TODO maybe not instanciate everytime ?
    private _getAction(actionStoreData: bpa.ActionStoreData): Action {
        const clazz = this.getActionClasses()[actionStoreData.classId];
        //initialize with the storedData
        return new clazz(this, actionStoreData);
    }

    // TODO move to Action but actionResults are here;
    private _isActionAvailable(action: Action, actorId: string, hitArea: bpa.HitArea): boolean {
        const actionHitArea = action.filterHitArea(hitArea);
        if(this._isHitAreaEmpty(actionHitArea)){
            return false;
        }
        const activityResults = this._data.results;
        const type = action._data.available.type;
        let result = (type === "always") || (type === "once" && activityResults.length === 0)
            || (type === "perActor" && activityResults.filter(a => actorId === a.actorId).length === 0)
        if (result) {
            return true;
        }
        for (const gridId of hitArea.gridIds) {
            result = (type === "perGrid" && activityResults.filter(a => a.hitArea.gridIds.includes(gridId)).length === 0)
                || (type === "each" && activityResults.filter(a => (actorId === a.actorId && a.hitArea.gridIds.includes(gridId))).length === 0)
            if (result) {
                return true;
            }
        }
        for (const wallId of hitArea.wallIds) {
            result = (type === "perWall" && activityResults.filter(a => a.hitArea.wallIds.includes(wallId)).length === 0)
                || (type === "each" && activityResults.filter(a => (actorId === a.actorId && a.hitArea.wallIds.includes(wallId))).length === 0)
            if (result) {
                return true;
            }
        }
        return false;
    }

    //TODO MOVE SOMEWHERE HITAREA class ?
    private _isHitAreaEmpty(hitArea: bpa.HitArea): boolean {
        for (const gridId of hitArea.gridIds) {
            return false;
        }
        for (const wallId of hitArea.wallIds) {
            return false;
        }
        return true;
    }

    /**
     * destruct needs to be called whenever another instance is generated to reduce amount of Hooks.
     * bpa engine is currently calling this.
     */
    public destruct(): void {
        for (const [id, value] of Object.entries(this._hooks)) {
            Hooks.off(id, value);
        }
    }

}