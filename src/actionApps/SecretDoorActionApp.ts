
import {BaseAction} from "../BaseAction.js";
import {NAMESPACE} from "../Settings.js";

/**secret door action app
 * when this actionApp is registered it should be settings enabled
 * when settings enabled it is enabled per scene
 * when scene enabled it registers a searchSecretDoor activity.
 * when scene enabled it registers a searchSecretDoor action.
 * ** the Action should define onActivate checking wall for being a secret door and checking result vs a dc or hit value
 * when session enabled secret doors gets a new ui tab
 * * you can set a dc individually on each door for each activity roll possibility or one for all.
 * * advanced you might set actions that happen on a dc default make door visible.
 * global configuration:
 * * the searchSecretDoor activity can be configured system dependent (dnd5e -> perception)
 * * * it needs to define what activity types are available skill,ability,hit
 * * you can configure a default dc
 * *

 **/
const ID = NAMESPACE + ".secret-door"

type SecretDoorActionType = "default" | "fallback";

export class SecretDoorActionApp implements ActionApp {

    get id():string {
        return ID;
    }

    isEnabled(): boolean {
        //TODO make it configurable setting.
        return true;
    }

    /**
     * is called once when enabled and will register an activity and an action.
     * when scene enabled it registers a searchSecretDoor activity.
     * when scene enabled it registers a searchSecretDoor action.
     * @param sceneId
     */
    public async enableOnScene(actionGrid:ActionGrid) {
        const activity = await this.getActivity();
        const defaultAction = await this.getAction("default");
        const fallbackAction = await this.getAction("fallback");
        actionGrid.registerActivity(activity);
        actionGrid.registerAction(defaultAction);
        actionGrid.registerAction(fallbackAction);
    }

    /**
     * gets the activity configuration
     */
    async getActivity():Promise<Activity> {
        const activity: Activity = {
            id: ID,
            name: game["i18n"].localize("beaversProximityAction.secretDoor.activity.name"),
            mapIcon: "",
            testOptions: {
                "prompt" : {
                    id: "prompt",
                    name: "prompt",
                    type: "prompt",
                    promptDialog:{
                        title:game["i18n"].localize("beaversProximityAction.secretDoor.activity.prompt.title"),
                        label:game["i18n"].localize("beaversProximityAction.secretDoor.activity.prompt.label")
                    }
                }
            },
        }
        //TODO load configured TestOptions
        return activity;
    }

    async getAction(type:SecretDoorActionType): Promise<Action>{
        const actionData = SecretDoorActions.get(type);
        //TODO load actionData overwrite settings e.g. available.type
        return new BaseAction(actionData);
    }

}

class SecretDoorActions {

    static defaultData:ActionStoreData = {
        id: ID,
        activityId: ID,
        location:{
            type:"wall",
            gridIds:[],
            wallFilter:[["door","2"]],
            isGlobal:false
        },
        available:{
            type:"once",
        },
        priority: "normal"
    }

    static fallbackData:ActionStoreData = {
        id: ID,
        activityId: ID,
        location:{
            type:"wall",
            gridIds:[],
            wallFilter:[],
            isGlobal:true
        },
        available:{
            type:"once",
        },
        priority: "fallback"
    }

    static get(type:SecretDoorActionType):ActionData{
        if(type==="fallback"){
            return {onActivate:this.fallbackAction,...this.fallbackData}
        }else if(type==="default"){
            return {onActivate:this.defaultAction,...this.defaultData}
        }else{
            throw Error(game["i18n"].localize(NAMESPACE+".secretDoor.error.actionTypeNotFound"));
        }
    }



    static async defaultAction(result:ActivityResultData){
        for(const wallId of result.wallIds) {
            const wall = canvas?.scene?.walls.get(wallId);
            if (wall) {
                const dcs = wall.getFlag(ID, "dcs");
                if (result.isSuccess || (result.number && dcs?.[result.testId] >= result.number)) {
                    await wall.update({door: 1});
                }else{
                    await this.fallbackAction(result);
                }
            }
        }
    }

    static async fallbackAction (result:ActivityResultData){
        ui.notifications?.info(game["i18n"].localize(NAMESPACE+".secretDoor.fallbackMessage"));
    }

}
