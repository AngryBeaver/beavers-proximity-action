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
    _hookRegistry:
        {
            hookId:string,
            method:any
        }[] = [];
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
        this._data = {...this.constructor.defaultData, ...settingsData};
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
    public async test(actorId: string, hitArea: bpa.HitArea, options: any):Promise<bpa.TestResult|null> {
        if (!this.isAvailable(actorId, hitArea)) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noAvailableActionsFound"));
        }
        const actor = await fromUuid(actorId) as Actor;
        if (!actor) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noActorOnToken"));
        }
        return await TestHandler.test(this._data.test, actor,options);
    }

    /**
     * this should always be executed on gm client via BPAEngine
     * executes all actions on activity in priority order
     * will stop at a priority if any action of that priority returned success
     */
    public async executeActions(activityResult:bpa.ActivityResult) {
        let stopExecution = false;
        for (const priority of PriorityTypeOrder) {
            if (!stopExecution) {
                for (const actionData of this._data.actions[priority]) {
                    const action = this._getAction(actionData);
                    const activityResultWithFilteredHitArea: bpa.ActivityResult = {
                        testResult: activityResult.testResult,
                        hitArea: action.filterHitArea(activityResult.hitArea),
                        actorId: activityResult.actorId
                    }
                    stopExecution = await action.execute(activityResultWithFilteredHitArea)
                }
            }
        }
    }

    /**
     * Activities use this to display configuration Settings on the object
     */
    protected _getConfigurations(): bpa.TestConfigurations {
        const result: bpa.TestConfigurations = {}
        for (const [id, test] of Object.entries(this._data.test.options)) {
            if (test.type === "skill") {
                const skill = beaversSystemInterface.configSkills.find(s => s.id === test.name);
                if (skill) {
                    result[id] = {
                        inputData: {
                            label: skill.label,
                            type: "number"
                        },
                        defaultValue: test.defaultValue || 20
                    }
                }
            }
            if (test.type === "ability") {
                const ability = beaversSystemInterface.configAbilities.find(a => a.id === test.name);
                if (ability) {
                    result[id] = {
                        inputData: {
                            label: ability.label,
                            type: "number"
                        },
                        defaultValue: test.defaultValue || 20
                    }
                }
            }
            if (test.type === "input" && test.inputDialog) {
                result[id] = {
                    inputData: {
                        label: "UserInput",
                        type: test.inputDialog.type
                    },
                    defaultValue: test.defaultValue || "password"
                }
            }
            if (test.type === "choices" && test.choices) {
                result[id] = {
                    inputData: {
                        label: "Dropdown",
                        type: "text",
                    },
                    defaultValue: test.defaultValue || ""
                }
            }
        }
        return result;
    }

    /**
     * Actions can validate tests
     */
    public validateTest(testResult:bpa.TestResult,storedValue?:any){
        const test = this._data.test.options[testResult.testId];
        let value = storedValue || test.defaultValue;
        if(!test){
            throw new Error("testId not available");
        }
        if(test.type === "skill" || test.type === "ability"){
            value = value || 20;
            return testResult.number && testResult.number >= value;
        }
        if(test.type === "input"){
            if(testResult.number){
                value = value || 42;
                return testResult.number == value;
            }
            value = value || "password";
            return testResult.text == value;
        }
        if(test.type === "prompt" || test.type === "hit"){
            return testResult.isSuccess;
        }
        throw new Error(test.type + "is not yet implemented");
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
     * disableHooks needs to be called whenever another instance is generated and whenever
     * a scene this activity is on gets activated
     */
    public disableHooks(): void {
        for (const [id, value] of Object.entries(this._hooks)) {
            Hooks.off(id, value);
        }
        this._hooks = {};
    }

    /**
     * enableHooks needs to be called whenever a scene this activity is on gets activated
     */
    public enableHooks(): void {
        for (const data of this._hookRegistry) {
            this._hooks[data.hookId] = Hooks.on(data.hookId,data.method)
        }
    }

}