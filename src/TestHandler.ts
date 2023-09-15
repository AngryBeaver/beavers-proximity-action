
import {bpa} from "./types.js";

export class TestHandler {

    //Todo sendrequest to player
    //Todo allow gm requests e.g. for prompts.
    static async test(testOptions: bpa.TestOptions, actor: Actor): Promise<bpa.TestResult | null> {
        const test = await this.selectTestChoice(testOptions);
        let result: bpa.TestResult | null = null;
        if (test.type === "ability") {
            result = await this._testAbility(actor,test);
        } else if (test.type === "skill") {
            result = await this._testSkill(actor,test);
        } else if (test.type === "choices") {
            result = await this._testChoices(test);
        } else if (test.type === "hit") {
            result = {testId: test.id, text: test.id, isSuccess:true};
        } else if (test.type === "input") {
            result = await this._testInput(test);
        } else if (test.type === "prompt") {
            result = await this._testPrompt(test);
        }
        return result;
    }

    static async _testAbility(actor:Actor, test: bpa.Test): Promise<bpa.TestResult | null> {
        let roll = await beaversSystemInterface.actorRollAbility(actor, test.id);
        if (roll != null) {
            return null
        }
        return {number: roll.total, testId: test.id};
    }

    static async _testSkill(actor:Actor,test: bpa.Test): Promise<bpa.TestResult | null> {
        let roll = await beaversSystemInterface.actorRollSkill(actor, test.id);
        if (roll == null) {
            return null;
        }
        return {number: roll.total, testId: test.id};
    }

    static async _testChoices(test: bpa.Test): Promise<bpa.TestResult | null> {
        const choice = await beaversSystemInterface.uiDialogSelect(test.choices);
        if (choice == null) {
            return null;
        }
        return {text: choice, testId: test.id};
    }

    static async _testInput(test: bpa.Test): Promise<bpa.TestResult | null> {
        const input = await this.uiDialogInput(test.inputDialog || {})
        if (input == null) {
            return null;
        }
        if(test.inputDialog?.type === "number"){
            return {number:Number.fromString(input),testId:test.id}
        }
        return {text: input, testId: test.id};
    }

    static async _testPrompt(test:bpa.Test): Promise<bpa.TestResult | null>{
        const prompt = await this.uiDialogPrompt(test.promptDialog || {})
        if (prompt == null) {
            return null;
        }
        return {isSuccess: prompt, testId: test.id};
    }


    static async uiDialogPrompt({title = "", label = ""}: bpa.PromptDialog): Promise<boolean | null> {
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


    static async selectTestChoice(testOptions: bpa.TestOptions): Promise<bpa.Test> {
        const choices = {};
        for (const [id, test] of Object.entries(testOptions)) {
            if (test.type === "skill") {
                beaversSystemInterface.configSkills.forEach(skill => {
                    if (skill.id === test.id) {
                        choices[id] = {text: skill.label};
                        return;
                    }
                });
            }else if (test.type === "ability") {
                beaversSystemInterface.configAbilities.forEach(ability => {
                    if (ability.id === test.id) {
                        choices[id] = {text: ability.label};
                        return;
                    }
                });
            }else{
                choices[id] = {text: test.id};
            }
        }
        const choice = await beaversSystemInterface.uiDialogSelect({choices: choices});
        return testOptions[choice];
    }

}