import {ActivityStore} from "./ActivityStore.js";
import {Activity} from "./Activity.js";
import {bpa} from "../bpaTypes.js";
import {NAMESPACE} from "../Settings.js";
import {SOCKET_EXECUTE_ACTIVITY} from "../main.js";
import {HitArea} from "../new/HitArea.js";

export class BPAEngine {
    public readonly _scene:Scene;
    public readonly activityStore: ActivityStore;
    private _activities: {
        [activityId:string]:Activity
    } = {};

    constructor(scene: Scene) {
        this.activityStore = new ActivityStore(scene);
        this._scene = scene;
    }

    /**
     * bpa can enable activities
     * settings can enable activities
     * scene config can enable activities
     */
    public addActivity(activityClass: bpa.ActivityClass) {
        if(this._activities[activityClass.defaultData.id]){
            this._activities[activityClass.defaultData.id].disableHooks();
        }
        this._activities[activityClass.defaultData.id] = new activityClass(this,this._scene.uuid);
        if(this._scene.uuid === game[NAMESPACE].BeaversProximityAction.currentSceneId){
            this.enableHooks();
        }
    }

    /**
     * users can get Activities around a token
     * tokens have a center and a rotation
     */
    public getProximityActivities(request: bpa.ProximityRequest): bpa.ProximityResult {
        const hitArea: HitArea = HitArea.from(request);
        const actorId = request.token.actor?.uuid;
        if(!actorId){
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noActorOnToken"));
        }
        game[NAMESPACE].ActivityLayer.drawActivity(hitArea.polygon,actorId, request.color);
        const result: bpa.ProximityResult = {
            origin: request.token.center,
            actorId: actorId,
            activities: [],
            hitArea: hitArea.serialize()
        }
        for (const activity of Object.values(this._activities)) {
            if (activity.isAvailable(actorId, hitArea)) {
                result.activities.push({
                    id: activity.id,
                    name: activity.name,
                })
            }
        }
        return result;
    }

    /**
     * users can execute an activity within proximity range.
     */
    public async testActivity(request: bpa.ActivityRequest, options?: any) {
        const activity: Activity = this._activities[request.activityId];
        const testResult: bpa.TestResult|null = await activity.test(request.actorId, request.hitArea, options);
        if(testResult!= null){
            const activityResult: bpa.ActivityResult = {
                testResult: testResult,
                hitArea: request.hitArea,
                actorId: request.actorId
            }
            await game[NAMESPACE].socket.executeAsGM(SOCKET_EXECUTE_ACTIVITY,this._scene.uuid,request.activityId,activityResult);
        }
    }
    /**
     * this should always be executed on gm client
     * @param testResult
     * @param hitArea
     * @param actorId
     */
    public async executeActivity(activityId:string,activityResult:bpa.ActivityResult){
        const activity: Activity = this._activities[activityId];
        await activity.executeActions(activityResult);
        //store global proximityHitArea not individual ActionHitAreas
        //todo update all clients activity data
        await this.activityStore.addResult(activityId, activityResult);
    }

    /**
     * this is called with every scene change so only hooks of actual scene are active
     */
    public disableHooks(){
        for(const activity of Object.values(this._activities)){
            activity.disableHooks();
        }
    }

    /**
     * this is called with every scene change so only hooks of actual scene are active
     */
    public enableHooks(){
        for(const activity of Object.values(this._activities)){
            activity.enableHooks();
        }
    }


}