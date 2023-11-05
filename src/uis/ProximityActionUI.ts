import {bpa} from "../bpaTypes.js";
import {NAMESPACE} from "../Settings.js";

export class ProximityActionUI implements UIModule {
    name = "beavers-proximity-action"

    async process(userId: string, userInput: UserInput) {
        const actorId = (game as Game).users?.get(userId)?.character?.id;
        const token = (canvas as Canvas).tokens?.ownedTokens.find(t => t.actor?.id === actorId);
        //TODO load distance and type from Client? World? Settings;
        if(token) {
            const proximityRequest: bpa.ProximityRequest = {
                distance: 5,
                token: token,
                type: "cone"
            }
            const result = game[NAMESPACE].BeaversProximityAction.getBPAEngine().getProximityActivities(proximityRequest);
            const choices = {
                "": {text: game["i18n"].localize("beaversProximityAction.userInteraction.noActivity")}
            };
            for (const activity of result.activities) {
                choices[activity.id] = {text: activity.name}
            }
            const activityId = await userInput.select({choices: choices});
            if (activityId === undefined || activityId === "") {
                return;
            }
            //TODO scene might have changed between actions
            const activityRequest: bpa.ActivityRequest = {
                activityId: activityId,
                actorId: result.actorId,
                hitArea: result.hitArea,
            }
            await game[NAMESPACE].BeaversProximityAction.getBPAEngine().testActivity(activityRequest,{ui:userInput});
        }
    }

}