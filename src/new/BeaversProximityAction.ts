import {TileAction} from "./TileAction.js";
import {HitArea} from "./HitArea.js";
import {NAMESPACE} from "../Settings.js";
import {SOCKET_EXECUTE_ACTIVITY} from "../main.js";
import {Initiator} from "./Initiator.js";

export class BeaversProximityAction implements BeaversProximityActionI{

    game: Game;

    //dual store for better access
    private activities:{
        byId:{
            [id: string]: Activity
        }
        byType: {
            [type in  EntityType] : Activity[]
        }
    } = {byId:{},byType:{wall:[],tile:[]}}


    constructor(){
        if(game instanceof Game) {
            this.game = game;
        }else{
            throw Error("game not initialized");
        }
    }

    /**
     * Modules can add Actions by register additional ActionDefinitions
     * They are not stored and needs to be registered each time with a ready hook.
     */
    public addActivity(activity: Activity){
        if(activity.prototype instanceof TileAction){
            this.activities.byType.tile.push(activity);
        }else{
            return;
        }
        this.activities.byId[activity.id] = activity;
        this.game[NAMESPACE].Settings.addActivity(activity);
    }

    public getActivities(type: EntityType):Activity[] {
        return this.activities.byType[type];
    }

    public getActivity(activityId: string):Activity{
        return this.activities.byId[activityId];
    }

    /**
     * users can scan proximity area around a token
     * tokens have a center and a rotation
     */
    public scanProximity(request: ProximityRequest): ProximityResponse {
        const initiator = new Initiator(request.initiator);
        const hitArea: HitArea = HitArea.from(initiator.token,request);
        this.game[NAMESPACE].ActivityLayer.drawActivity(hitArea.polygon,initiator.actorId, initiator.user.color);
        const result: ProximityResponse = {
            initiator: request.initiator,
            origin: initiator.token.center,
            activities: [],
        }
        const activityIds:{[id:string]:ActivityHit} = {}
        hitArea.tileIds.forEach(entityId=>{
            const entity = TileAction.getEntity(entityId);
            if(entity){
                const configs = TileAction.getConfigs(entity);
                //each tile configured activity;
                Object.values(configs.activities).forEach(config=> {
                    const activityId = config.activityId;
                    const activity = this.getActivity(config.activityId);
                    if (activity) {
                        activityIds[activityId] = activityIds[activityId] || {activityId: activityId, name: activity.template.name,type:"tile", entityIds: []};
                        activityIds[activityId].entityIds.push(entityId)
                    }
                });
                //each activity default configured tile
                this.getActivities("tile").forEach(activity=>{
                    if(activity.data.enabled.find(filter=>getProperty(entity,filter.attribute)===filter.value)){
                        activityIds[activity.id] = activityIds[activity.id] || {activityId: activity.id, name: activity.template.name,type:"tile", entityIds: []};
                        activityIds[activity.id].entityIds.push(entityId)
                    }
                });
            }
        });
        hitArea.wallIds.forEach(entityId=>{
            const entity = TileAction.getEntity(entityId);
            if(entity){
                const config = TileAction.getConfigs(entity);
                //each tile configured activity;
                Object.keys(config.activities).forEach(activityId=> {
                    const activity = this.getActivity(activityId);
                    if (activity) {
                        activityIds[activityId] = activityIds[activityId] || {activityId: activityId, name: activity.template.name,type:"wall", entityIds: []};
                        activityIds[activityId].entityIds.push(entityId)
                    }
                });
                //each activity default configured tile
                this.getActivities("tile").forEach(activity=>{
                    if(activity.data.enabled.find(filter=>getProperty(entity,filter.attribute)===filter.value)){
                        activityIds[activity.id] = activityIds[activity.id] || {activityId: activity.id, name: activity.template.name,type:"wall", entityIds: []};
                        activityIds[activity.id].entityIds.push(entityId)
                    }
                });
            }
        });
        result.activities.push(...Object.values(activityIds));
        return result;
    }

    /**
     * users can test an activity
     * TODO ask for SubOptions
     */
    public async testActivity(request: ActivityRequest) {
        const initiator = new Initiator(request.initiatorData);
        const activity: Activity = this.getActivity(request.activityHit.activityId);
        const testResult = await game[NAMESPACE].DisplayProxy.test(activity.data.test,initiator)
        if(testResult!= null){
            await game[NAMESPACE].socket.executeAsGM(SOCKET_EXECUTE_ACTIVITY,request,testResult);
        }
    }

    /**
     * socket gm can execute Actions
     */
    public async executeAction(request: ActivityRequest,testResult:TestResult){
        const initiator = new Initiator(request.initiatorData);
        const activity: Activity = this.getActivity(request.activityHit.activityId);
        const promises:Promise<any>[] = []
        for(const entityId of request.activityHit.entityIds) {
            const action = new activity(entityId, initiator);
            promises.push(action.run(testResult));
        }
        await Promise.all(promises);
    }

}