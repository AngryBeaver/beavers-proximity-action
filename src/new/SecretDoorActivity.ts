/* class decorator */
import {WallAction} from "./WallAction.js";
import {NAMESPACE} from "../Settings.js";
import {Initiator} from "./Initiator.js";

function staticImplements<T>() {
    return <U extends T>(constructor: U) => {constructor};
}
@staticImplements<Activity>()
export class SecretDoorActivity extends WallAction {

    constructor(entityId: string, initiator: Initiator){
        super(entityId, initiator);
    }

    async run(testResult: TestResult): Promise<void> {
        this.entity
        //TODO
        //where to test if it was successfull
        //how to enable fallback everywhere ?
        //how to enable only when it is enabled here
    }

    static get template():ActivityTemplate {
        return {
            id:`${NAMESPACE}.${this.name}`,
            name: game["i18n"].localize("beaversProximityAction.action.secretDoor.name"),
            desc: game["i18n"].localize("beaversProximityAction.action.secretDoor.desc"),
            config:{},
            allowSubOptions:false,
            fallback:(initiator:Initiator)=>{
                //TODO use DISPLAY PROXY
                ui.notifications?.info(game["i18n"].localize("beaversProximityAction.action.secretDoor.fallbackMessage"));
            }
        };
    }

    static get defaultData(): ActivityData{
        return {
            enabled: [],
            test: {
                type: "gm",
                inputField: {
                    type: "boolean",
                    label: game["i18n"].localize("beaversProximityAction.action.secretDoor.test.label"),
                    note: game["i18n"].localize("beaversProximityAction.action.secretDoor.test.note"),
                }
            }
        }
    }

}