import {NAMESPACE} from "../Settings.js";
import { TileActivity } from "./TileActivity.js";
import { GmApproval } from "../tests/GmApproval.js";

export class InvestigateActivity extends TileActivity {
    constructor(entityId: string, initiator: InitiatorI){
        super(entityId, initiator);
    }

    run(): Promise<void> {
        let msg = "";
        this.configs.forEach(c=>msg+=c.data.secretInfo);
        ui.notifications?.info?.(msg);
        return Promise.resolve(undefined);
    }

    static get template():ActivityTemplate {
      beaversSystemInterface.testClasses
      return {
            id:`${NAMESPACE}.${this.name}`,
            name: (game as ReadyGame)["i18n"].localize("beaversProximityAction.action.investigate.name"),
            desc: (game as ReadyGame)["i18n"].localize("beaversProximityAction.action.investigate.desc"),
            config:{
                "secretInfo":{
                    name:"secretInfo",
                    type:"area",
                    label: (game as ReadyGame)["i18n"].localize("beaversProximityAction.action.investigate.secretInfo.label"),
                    defaultValue: (game as ReadyGame)["i18n"].localize("beaversProximityAction.action.investigate.secretInfo.defaultValue"),
                    note: (game as ReadyGame)["i18n"].localize("beaversProximityAction.action.investigate.secretInfo.note"),
                }
            },
            allowSubOptions:false,
            detection: {
              mode:"touch"
            }
        };
    }

    static get defaultData(): ActivityData{
        return {
            enabled: [],
            beaversTests: {
              fails: 0,
              ands: {
                0: {
                  hits: 1,
                  ors: {
                    0: {
                      type: GmApproval.name,
                      data: {
                        question: "Did you find anything usefully?",
                      }
                    }
                  }
                },
              }
            }
        }
    }

}

