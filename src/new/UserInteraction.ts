import {BeaversProximityAction} from "./BeaversProximityAction.js";
import {NAMESPACE} from "../Settings.js";

export class UserInteraction {

    beaversProximityAction: BeaversProximityAction

    constructor(beaversProximityAction: BeaversProximityAction) {
        this.beaversProximityAction = beaversProximityAction;
    }

    public async request() {

        const initiatorData = UserInteraction.currentUserInitiator(game["user"].id);
        //TODO load distance and type from Client? World? Settings;
        const proximityRequest: ProximityRequest = {
            initiator: initiatorData,
            distance: 5,
            type: "cone"
        }
        const proximityResponse:ProximityResponse = (game as Game)[NAMESPACE].BeaversProximityAction.scanProximity(proximityRequest);

        const input = {
            choices: {"": {text: game["i18n"].localize("beaversProximityAction.userInteraction.noActivity")}},
            defaultValue: undefined,
            label: "",
            note: "",
            type: "selection"
        }
        for (const activity of Object.values(proximityResponse.activities)) {
            input.choices[activity.activityId] = {text: activity.name}
        }
        const activityId =  await (game as Game)[NAMESPACE].DisplayProxy.input(input as InputField, initiatorData);
        const activityHit = proximityResponse.activities.find(a=>a.activityId===activityId);
        if(!activityHit){
            return;
        }
        //TODO scene might have changed between actions
        const activityRequest: ActivityRequest = {
            activityHit: activityHit, initiatorData: initiatorData

        }
        await this.beaversProximityAction.testActivity(activityRequest);
    }

    public static currentUserInitiator(userId):InitiatorData{
        const user = (game as Game).users?.get(userId);
        const initiatorData:InitiatorData = {
            sceneId : canvas?.scene?.id || "",
            userId: userId,
            actorId: user?.character?.id || "",
            tokenId: "",
        };
        if(initiatorData.actorId === ""){
            const token = canvas?.tokens?.controlled?.[0];
            initiatorData.tokenId = token?.id || "";
            initiatorData.actorId = token?.actor?.id || "";
        }else{
            initiatorData.tokenId = canvas?.tokens?.ownedTokens.find(t=>t.actor?.id)?.id || "";
        }
        return initiatorData;
    }

}