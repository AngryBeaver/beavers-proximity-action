import {NAMESPACE} from "../Settings.js";
import {Initiator} from "./Initiator.js";

export abstract class Action implements ActionI {
    abstract entity: any;
    abstract configs: EntityConfig[];
    abstract initiator: Initiator;

    static get data() {
        return (game as Game)[NAMESPACE].Settings.getActivityData(this.id);
    }

    static get id():string{
        return this.template.id;
    }

    abstract run(testResult:TestResult):Promise<void>;

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
                type: "none",
            }
        }
    }

    validateTest(testResult: TestResult, storedValue?: any) {
        //TODO
        /**const test = this.config.test.

            const test = this._data.test.options[testResult.testId];
            let value = storedValue || test.defaultValue;
            if (!test) {
                throw new Error("testId not available");
            }
            if (test.type === "skill" || test.type === "ability") {
                value = value || 20;
                return testResult.number && testResult.number >= value;
            }
            if (test.type === "input") {
                if (testResult.number) {
                    value = value || 42;
                    return testResult.number == value;
                }
                value = value || "password";
                return testResult.text == value;
            }
            if (test.type === "prompt" || test.type === "hit") {
                return testResult.isSuccess;
            }
            throw new Error(test.type + "is not yet implemented");
        }
         **/
    }

}