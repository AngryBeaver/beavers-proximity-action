import {TileAction} from "./TileAction.js";
import {HitArea} from "./HitArea.js";
import {NAMESPACE} from "../Settings.js";
export class BeaversProximityAction implements BeaversProximityActionI{

    game: Game;

    private activities:{
        [type in  ActivityType]: {
            [id: string]: Activity
        }
    }={wall:{},tile:{}};

    constructor(){
        if(game instanceof Game) {
            this.game = game;
        }else{
            throw Error("game not initialized");
        }
    }

    /**
     * socket can execute Actions
     */
    public async executeAction(initiator: Initiator){

    }

    /**
     * Modules can add Actions by register additional ActionDefinitions
     * They are not stored and needs to be registered each time with a ready hook.
     */
    public addActivity(activity: Activity){
        if(activity.prototype instanceof TileAction){
            this.activities.tile[activity.id] = activity;
        }else{
            return;
        }
        this.game[NAMESPACE].Settings.addActivity(activity);
    }

    public getActivities(type: ActivityType){
        return this.activities[type];
    }

    public getActivity(type, actionId: string):Activity{
        return this.activities[type][actionId];
    }


    /**
     * users can get scan around a token
     * tokens have a center and a rotation
     */
    public scanProximity(request: ProximityRequest): ProximityResponse {
        const initiator = new Initiator(request.initiator);
        const hitArea: HitArea = HitArea.from(initiator.token,request);
        this.game[NAMESPACE].ActivityLayer.drawActivity(hitArea.polygon,initiator.actorId, initiator.user.color);
        const result: ProximityResponse = {
            initiator: request.initiator,
            origin: initiator.token.center,
            actions: [],
            hitArea: hitArea.serialize()
        }
        for (const activity of Object.values(this.activities)) {
            if (activity.isAvailable(actorId, hitArea)) {
                result.activities.push({
                    id: activity.id,
                    name: activity.name,
                })
            }
        }
        return result;
    }


}