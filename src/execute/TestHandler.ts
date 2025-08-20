export class TestHandler{
    beaversTests:BeaversTests
    _testsResult: TestsResult

    getTestsResult(){
      return this._testsResult;
    }

    constructor(beaversTests:BeaversTests,testsResult?:TestsResult){
        this.beaversTests = beaversTests;
        if(!testsResult){
          this._testsResult = {hits:0,fails:0,maxHits:1,maxFails:1};
        }else{
          this._testsResult = testsResult;
        }
        this._testsResult.maxHits=TestHandler.getMaxHits(beaversTests);
        this._testsResult.maxFails=beaversTests.fails;
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
            if(this._testsResult.hits<iterate){
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
        if(TestHandler.getMaxHits(this.beaversTests)<=this._testsResult.hits){
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

    async test(initiatorData:InitiatorData):Promise<TestsResult>{
      if(this.hasAdditionalTests()) {
        const testOr = await this.selectTestChoice();
        const test = this.getTest(testOr);
        var result: TestResult = await test.action(initiatorData);
        const testAnd = this.getCurrentTestAnd();
        var hits = Math.min(result.success, testAnd.hits);
        this._testsResult.hits += hits;
        this._testsResult.fails += result.fail;
      }
      return this._testsResult;
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