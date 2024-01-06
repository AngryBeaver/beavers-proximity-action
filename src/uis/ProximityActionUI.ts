import {NAMESPACE} from "../Settings.js";
import {UserInteraction} from "../new/UserInteraction.js";

//TODO rework work with DisplayProxy !
export class ProximityActionUI implements UIModule {
    name = "beavers-proximity-action"

    async process(userId: string, userInput: UserInput) {
        const initiatorData = UserInteraction.currentUserInitiator(userId);
        //TODO load distance and type from Client? World? Settings;
        if(initiatorData.tokenId) {
            const proximityRequest: ProximityRequest = {
                distance: 5,
                type: "cone",
                initiator: initiatorData
            }
            const proximityResponse = game[NAMESPACE].BeaversProximityAction.scanProximity(proximityRequest);
            const choices = {
                "": {text: game["i18n"].localize("beaversProximityAction.userInteraction.noActivity")}
            };
            for (const activity of proximityResponse.activities) {
                choices[activity.id] = {text: activity.name}
            }
            //TODO rework work with DisplayProxy !
            const activityId = await userInput.select({choices: choices});
            const activityHit = proximityResponse.activities.find(a=>a.id===activityId);
            if (!activityHit) {
                return;
            }
            const activityRequest: ActivityRequest = {
                activityHit: activityHit,
                initiatorData:initiatorData
            }
            await game[NAMESPACE].BeaversProximityAction.testActivity(activityRequest);
        }
    }

}