import {NAMESPACE} from "../Settings.js";
import {SOCKET_TEST_PROMPT} from "../main";
import {StandardDisplayModule} from "./StandardDisplayModule.js";

/**
 * holds displayModules that will choose how interaction with users are rendered.
 */
export class DisplayProxy implements DisplayModule{

    constructor(){
        this.register(new StandardDisplayModule(), 10000);
    }

    //here we make use of the fact that integer keys are ordered !
    displayModules: {
        [order:number]: Partial<DisplayModule>
    } = [];

    register(displayModule:Partial<DisplayModule>, priority:number=1000){
        while(displayModule[priority]){
            priority++;
        }
        this.displayModules[priority] = displayModule;
    }

    async test(test: Test, initiator: Initiator ): Promise<TestResult | null> {
        let result: TestResult | null = null;
        if (test.type === "ability") {
            result = await this.testAbility(initiator,test);
        } else if (test.type === "skill") {
            result = await this.testSkill(initiator,test);
        } else if (test.type === "hit") {
            result = {type:"boolean", value:true};
        } else if (test.type === "input") {
            result = this.asTestResult(await this.input(test.inputField,initiator.data),test);
        } else if (test.type === "prompt") { //gmPrompt
            const r = await game[NAMESPACE].socket.executeAsGM(SOCKET_TEST_PROMPT,test.inputField,initiator.data);
            result = this.asTestResult(r,test);
        }
        return result;
    }

    public async prompt(inputField: InputField, initiatorData: InitiatorData): Promise<boolean | null>{
        let result:boolean|null = null;
        for(const displayModule of Object.values(this.displayModules)){
            if(displayModule.prompt){
                result =  await displayModule.prompt(inputField,initiatorData);
                break;
            }
        }
        return result;
    }

    public async testAbility(initiator:Initiator, test: Test): Promise<TestResult | null> {

        let roll = await beaversSystemInterface.actorRollAbility(initiator.actor, test.name);
        if (roll == null) {
            return null
        }
        return {type:"number",value: roll.total};
    }

    public async testSkill(initiator:Initiator, test: Test): Promise<TestResult | null> {
        let roll = await beaversSystemInterface.actorRollSkill(initiator.actor, test.name);
        if (roll == null) {
            return null
        }
        return {type:"number",value: roll.total};
    }

    public async input(inputField: InputField, initiatorData: InitiatorData): Promise<TestResult | null> {
        let result:any|null = null;
        for(const displayModule of Object.values(this.displayModules)){
            if(displayModule.input){
                result =  await displayModule.input(inputField,initiatorData);
                break;
            }
        }
        return result;
    }

    public async msg(msg: string, type: MsgType, initiatorData: InitiatorData): Promise<void> {
        for(const displayModule of Object.values(this.displayModules)){
            if(displayModule.msg){
                await displayModule.msg(msg,type,initiatorData);
                break;
            }
        }
        return Promise.reject();
    }

    private asTestResult(result:any,test: Test):TestResult | null{
        if(result === null) return null;
        return {type: test.inputField.type, value:result};
    }

}