import {bpa} from "../bpaTypes.js";
import {BeaversProximityAction} from "./BeaversProximityAction.js";

export class UserInteraction {

    beaversProximityAction: BeaversProximityAction

    constructor(beaversProximityAction: BeaversProximityAction) {
        this.beaversProximityAction = beaversProximityAction;
    }

    public async request() {

        const token = UserInteraction.currentToken(game["user"].id);
        //TODO load distance and type from Client? World? Settings;
        const proximityRequest: bpa.ProximityRequest = {
            distance: 5,
            token: token,
            type: "cone",
            color: game["user"].color
        }
        const result = this.beaversProximityAction.getBPAEngine().getProximityActivities(proximityRequest);
        const choices = {
            "": {text:game["i18n"].localize("beaversProximityAction.userInteraction.noActivity")}
        };
        for (const activity of Object.values(result.activities)) {
            choices[activity.id] = {text: activity.name}
        }
        const activityId = await beaversSystemInterface.uiDialogSelect({choices:choices});
        if(activityId===undefined || activityId === ""){
            return;
        }
        //TODO scene might have changed between actions
        const activityRequest: bpa.ActivityRequest = {
            activityId: activityId,
            actorId: result.actorId,
            hitArea: result.hitArea,
        }
        await this.beaversProximityAction.getBPAEngine().testActivity(activityRequest);
    }

    public static currentToken(userId:string): Token {
        let token = this._getUserCharacterToken(userId);
        if (!token) {
            token = this._getControlledToken();
        }
        if (!token) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noActorFound"))
        }
        return token;
    }

    private static _getTokenLayer(): TokenLayer {
        if (!(canvas instanceof Canvas)) {
            throw new Error("canvas not ready");
        }
        const tokenLayer = canvas.tokens;
        if (!(tokenLayer instanceof TokenLayer)) {
            throw new Error("No Tokenlayer found");
        }
        return tokenLayer;
    }


    private static _getUserCharacterToken(userId:string): Token | null {
        const tokenLayer = this._getTokenLayer();
        let actorId = game["users"].get(userId).character?.uuid;
        for (const t of tokenLayer.ownedTokens) {
            if (t.actor?.uuid === actorId) {
                return t;
            }
        }
        return null;
    }

    private static _getControlledToken(): Token | null {
        for (const t of canvas?.tokens?.controlled || []) {
            if (t.actor) {
                return t;
            }
        }
        return null;
    }

}