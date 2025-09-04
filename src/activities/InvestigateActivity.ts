import {NAMESPACE} from "../Settings.js";
import { GmApproval } from "../tests/GmApproval.js";
import { RegionActivity } from "./RegionActivity.js";

export class InvestigateActivity extends RegionActivity {
    constructor(entityId: string){
        super(entityId);
    }
    run(initiator: InitiatorI, testResult:TestResults): Promise<string> {
        let msg = "Your investigation revealed:</br>"+this.data.data.secretInfo;
        return Promise.resolve(msg);
    }

    static get template():ActivityTemplate {
      beaversSystemInterface.testClasses
      return {
            id:`${NAMESPACE}.${this.name}`,
            name: (game as ReadyGame)["i18n"].localize("beaversProximityAction.action.investigate.name"),
            desc: (game as ReadyGame)["i18n"].localize("beaversProximityAction.action.investigate.desc"),
            inputs:{
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
            enabled:[{attribute:"test", value:true}],
            data:{},
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

