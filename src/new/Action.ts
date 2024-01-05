import {NAMESPACE} from "../Settings.js";

export abstract class Action implements ActionI {
    abstract entity: any;
    abstract config: any;
    abstract initiator: Initiator;

    static get data() {
        return (game as Game)[NAMESPACE].Settings.getActivityData(this.id);
    }

    static get id():string{
        return this.template.id;
    }

    abstract run()

    static get template():ActivityTemplate {
        return {
            id:this.name,
            name: this.name,
            desc: "",
            config:{},
            allowSubOptions:false,
            fallback:(initiator:Initiator)=>{

            }
        };
    }

    static get defaultData(): ActivityData {
        return {
            enabled: [],
            test: {
                type: "hit",
                name: this.name,
                inputField: {
                    label: this.name,
                    type: "boolean",
                    note: this.name
                }
            }
        }
    }
}