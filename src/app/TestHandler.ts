
import {bpa} from "../types.js";
import {NAMESPACE} from "../Settings.js";
import {SOCKET_TEST_PROMPT} from "../main.js";

export class TestHandler {

    static async test(activityTest: bpa.ActivityTest, actor: Actor, options:any={}): Promise<bpa.TestResult | null> {
        const test = await this.selectTestChoice(activityTest.options,options);
        let result: bpa.TestResult | null = null;
        if (test.type === "ability") {
            result = await this._testAbility(actor,test);
        } else if (test.type === "skill") {
            result = await this._testSkill(actor,test);
        } else if (test.type === "choices") {
            result = await this._testChoices(test,options);
        } else if (test.type === "hit") {
            result = {testId: test.id, text: test.id, isSuccess:true};
        } else if (test.type === "input") {
            result = await this._testInput(test);
        } else if (test.type === "prompt") {
            result = await game[NAMESPACE].socket.executeAsGM(SOCKET_TEST_PROMPT,test,actor.name+": "+activityTest.name);
        }
        return result;
    }

    /**
     * should be executed on gm client
     * @param test
     */
    public static async testPrompt(test:bpa.Test,label:string): Promise<bpa.TestResult | null>{
        const prompt = await this.uiDialogPrompt(test.promptDialog || {label:label})
        if (prompt == null) {
            return null;
        }
        return {isSuccess: prompt, testId: test.id};
    }

    private static async _testAbility(actor:Actor, test: bpa.Test): Promise<bpa.TestResult | null> {
        let roll = await beaversSystemInterface.actorRollAbility(actor, test.name);
        if (roll == null) {
            return null
        }
        return {number: roll.total, testId: test.id};
    }

    private static async _testSkill(actor:Actor,test: bpa.Test): Promise<bpa.TestResult | null> {
        let roll = await beaversSystemInterface.actorRollSkill(actor, test.name);
        if (roll == null) {
            return null;
        }
        return {number: roll.total, testId: test.id};
    }

    private static async _testChoices(test: bpa.Test,options): Promise<bpa.TestResult | null> {
        let choice: string | null = null;
        if(options.bpaui){
            choice = await options.bpaui.select(test.choices);
        }else{
            choice = await beaversSystemInterface.uiDialogSelect({choices: test.choices});
        }
        if (choice == null) {
            return null;
        }
        return {text: choice, testId: test.id};
    }

    private static async _testInput(test: bpa.Test): Promise<bpa.TestResult | null> {
        const input = await this.uiDialogInput(test.inputDialog || {type:"text",label:""})
        if (input == null) {
            return null;
        }
        if(test.inputDialog?.type === "number"){
            return {number:Number.fromString(input),testId:test.id}
        }
        return {text: input, testId: test.id};
    }


    private static async uiDialogPrompt({title = "", label = ""}: bpa.PromptDialog): Promise<boolean | null> {
        return new Promise((resolve, reject) => {
            const dialog = Dialog.confirm({
                title: title,
                content: label,
                yes: ()=>resolve(true),
                no: ()=>resolve(false)
            });
        });
    }

    static async uiDialogInput({title = "", type = "text", label = ""}: bpa.InputDialog): Promise<string | null> {
        const form = '<form><label>' + label + '<input name="input-1" type="' + type + '/></label></form>';
        return new Promise((resolve, reject) => {
            const dialog = new Dialog({
                title: title,
                content: form,
                buttons: {
                    submit: {
                        label: "ok", callback: (html) => {
                            resolve(html[0].querySelector('input').value);
                        }
                    },
                },
                close: () => {
                    resolve(null)
                }
            });
            dialog.render(true);
        });
    }


    static async selectTestChoice(testOptions: bpa.TestOptions,options:any): Promise<bpa.Test> {
        const choices = {};
        for (const [id, test] of Object.entries(testOptions)) {
            choices[id] = {text: test.id};
        }
        let choice = "";
        if(options.ui){
            choice = await options.ui.select({choices:choices});
        }else{
            choice = await beaversSystemInterface.uiDialogSelect({choices: choices});
        }
        return testOptions[choice];
    }

}