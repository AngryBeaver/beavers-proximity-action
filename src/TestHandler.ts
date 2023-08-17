
export class TestHandler{
    testOptions:TestOptions
    actor:Actor

    constructor(testOptions:TestOptions,actor:Actor){
        this.testOptions = testOptions;
        this.actor=actor;
    }

    async test():Promise<ActivityResult|null>{
        const test = await this.selectTestChoice(this.testOptions);
        let result:ActivityResult|null = null;
        if(test.type === "ability") {
            result = await this._testAbility(test);
        }else if(test.type === "skill") {
            result = await this._testSkill(test);
        }else if(test.type === "choices") {
            result = await this._testChoices(test);
        }else if(test.type === "hit") {
            result = {type:test.type,choice:test.name};
        }
        return result;
    }

    async _testAbility(test:Test):Promise<ActivityResult|null>{
        let roll = await beaversSystemInterface.actorRollAbility(this.actor, test.name);
        if( roll != null){
            return null
        }
        return {value:roll.total,type:test.type};
    }

    async _testSkill(test:Test):Promise<ActivityResult|null>{
        let roll = await beaversSystemInterface.actorRollSkill(this.actor, test.name);
        if( roll == null){
            return null;
        }
        return {value:roll.total,type:test.type};
    }

    async _testChoices(test:Test):Promise<ActivityResult|null>{
        const choice = await beaversSystemInterface.uiDialogSelect(test.choices);
        if(choice == null){
            return null;
        }
        return {choice:choice,type:test.type};
    }

    async selectTestChoice(testOptions:TestOptions):Promise<Test>{
        const choices = {};
        for(const [id,test] of Object.entries(testOptions)){
            if(test.type === "skill"){
                beaversSystemInterface.configSkills.forEach(skill=>{
                    if(skill.id === test.id){
                        choices[id] = {text:skill.label};
                        return;
                    }
                });
            }
            if(test.type === "ability"){
                beaversSystemInterface.configAbilities.forEach(ability=>{
                    if(ability.id === test.id){
                        choices[id] = {text:ability.label};
                        return;
                    }
                });
            }
            if(test.type === "hit"){
                choices[id] = {text:test.id};
            }
            if(test.type === "choices"){
                choices[id] = {text:test.id};
            }
        }
        const choice = parseInt(await beaversSystemInterface.uiDialogSelect({choices:choices}));
        return testOptions[choice];
    }

}