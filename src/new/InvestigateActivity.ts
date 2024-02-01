import {NAMESPACE} from "../Settings.js";
import {TileAction} from "./TileAction.js";
import {Initiator} from "./Initiator.js";
/* class decorator */
function staticImplements<T>() {
    return <U extends T>(constructor: U) => {constructor};
}
@staticImplements<Activity>()
export class InvestigateActivity extends TileAction {
    constructor(entityId: string, initiator: Initiator){
        super(entityId, initiator);
    }

    run(testResult: TestResult): Promise<void> {
        let msg = "";
        this.configs.forEach(c=>msg+=c.data.secretInfo);
        ui.notifications?.info?.(msg);
        return Promise.resolve(undefined);
    }

    static get template():ActivityTemplate {
        return {
            id:`${NAMESPACE}.${this.name}`,
            name: game["i18n"].localize("beaversProximityAction.action.investigate.name"),
            desc: game["i18n"].localize("beaversProximityAction.action.investigate.desc"),
            config:{
                "secretInfo":{
                    type:"area",
                    label: game["i18n"].localize("beaversProximityAction.action.investigate.secretInfo.label"),
                    defaultValue: game["i18n"].localize("beaversProximityAction.action.investigate.secretInfo.defaultValue"),
                    note: game["i18n"].localize("beaversProximityAction.action.investigate.secretInfo.note"),
                }
            },
            allowSubOptions:false,
            fallback:(initiator:Initiator)=>{
                game[NAMESPACE].userOutput.msg("You did not find anything usefully");
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
                    label: game["i18n"].localize("beaversProximityAction.action.investigate.test.label"),
                    note: game["i18n"].localize("beaversProximityAction.action.investigate.test.note"),
                }
            }
        }
    }

}

