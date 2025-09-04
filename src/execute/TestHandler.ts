export class TestHandler{
    beaversTests:BeaversTests
    _testResults: TestResults

    getTestsResult(){
      return this._testResults;
    }

    constructor(beaversTests:BeaversTests,testResults?:TestResults){
        this.beaversTests = beaversTests;
        if(!testResults){
          this._testResults = {success:0,fail:0,maxHits:1,maxFails:1};
        }else{
          this._testResults = testResults;
        }
        this._testResults.maxHits=TestHandler.getMaxHits(beaversTests);
        this._testResults.maxFails=beaversTests.fails;
    }

    static getMaxHits(beaversTests:BeaversTests):number{
        let max = 0;
        Object.values(beaversTests.ands).forEach((and)=>{
            max += and.hits;
        });
        return max;
    }

    getCurrentTestAnd():BeaversTestAnd{
        let iterate = 0;
        for(const and of Object.values(this.beaversTests.ands)){
            iterate += and.hits;
            if(this._testResults.success<iterate){
                return and;
            }
        }
        throw Error("no Additional Tests found");
    }
    nextTest():string{
        try {
            const currentTest = this.getCurrentTestAnd();
            if(Object.keys(currentTest.ors).length == 1){
                const serializedTest = Object.values(currentTest.ors)[0];
                return this.getTest(serializedTest).render();
            }
            return "process";
        }catch(e){
            return "process"
        }
    }

    hasAdditionalTests():boolean{
        if(TestHandler.getMaxHits(this.beaversTests)<=this._testResults.success){
            return false
        }
        try{
            this.getCurrentTestAnd();
        }catch(e){
            console.warn(e.message);
            return false;
        }
        return true;
    }

    async test(initiatorData:InitiatorData):Promise<TestResults>{
      if(this.hasAdditionalTests()) {
        const testOr = await this.selectTestChoice();
        const test = this.getTest(testOr);
        var result: TestResult = await test.action(initiatorData);
        const testAnd = this.getCurrentTestAnd();
        var success = Math.min(result.success, testAnd.hits);
        this._testResults.success += success;
        this._testResults.fail += result.fail;
      }
      return this._testResults;
    }

    async selectTestChoice():Promise<SerializedTest<any>>{
        const choices = {};
        const testAnd = this.getCurrentTestAnd();
        //fix name for tool uuid !
        for(const [id,or] of  Object.entries(testAnd.ors)){
            choices[id] = {text:this.getTest(or).render()}
        }
        const choice = parseInt(await beaversSystemInterface.uiDialogSelect({choices:choices}));
        return testAnd.ors[choice];
    }

    getTest(serializedTest: SerializedTest<any>):Test<any>{
        return beaversSystemInterface.testClasses[serializedTest.type].create(serializedTest.data)
    }

}