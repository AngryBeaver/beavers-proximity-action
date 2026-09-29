import { NAMESPACE } from "../Settings";

const defaultTest: SerializedTest<any> = {
  type: "",
  data: {},
}
const testAnd:BeaversTestAnd = {
  hits: 1,
  ors: {1:defaultTest},
}

const tests:BeaversTests = {
  fails: 1,
  ands: {1: testAnd}
}

export class TestSettings {

  private parent: any;
  private beaversTests:BeaversTests|undefined;
  private update:(beaversTests:BeaversTests|undefined)=>Promise<void>
  private _trash =  {
    beaversTests: {
      ands: {},
      ors: {}
    }
  };

  constructor(parent:any,beaversTests:BeaversTests|undefined,update:(beaversTests:BeaversTests|undefined)=>Promise<void>){
    this.parent = parent;
    this.beaversTests = beaversTests
    this.update = update;
  }

  public onChange(beaversTests: BeaversTests | undefined){
    this.beaversTests = beaversTests;
  }

  public onRender(context, options) {
    this.parent.element.querySelectorAll(".tests-add").forEach(i=>i.addEventListener("click",(e:Event) =>{
      this.addTestAnd();
    }));
    this.parent.element.querySelectorAll(".test-or .test-delete").forEach(i=>i.addEventListener("click",(e:Event)=>{
      const el = e.currentTarget as Element | null;
      const and = el?.getAttribute("data-and");
      const or = el?.getAttribute("data-or");
      this.removeTestOr(and,or);
    }));
    this.parent.element.querySelectorAll(".test-or .test-add").forEach(i=>i.addEventListener("click",(e:MouseEvent)=>{
      const el = e.currentTarget as Element | null;
      const and = el?.getAttribute("data-and");
      this.addTestOr(and);
    }));

    this.parent.element.querySelectorAll(".beavers-test-selection select").forEach(i=>i.addEventListener("change", async (e: Event) => {
      const select = e.currentTarget instanceof HTMLSelectElement ? e.currentTarget : null;
      if (!select) return;
      const name = select.name ?? "";
      const { ands: and, ors: or } = name
        .split(".")
        .reduce<{ ands?: string; ors?: string }>((acc, item, idx, arr) => {
          if (item === "ands" || item === "ors") acc[item] = arr[idx + 1];
          return acc;
        }, {});
      const type = select.value; // same as $(e.target).val()

      if (and && or) {
        this.changeSelection(and, or, type);
      }
    }));
  }

  changeSelection(and:string, or:string, type:string){
    if (this.beaversTests?.ands[and]?.ors[or]) {
      this.beaversTests.ands[and].ors[or].type = type;
      this.beaversTests.ands[and].ors[or].data = {};
      void this.preupdate();
    }
  }

  addTestAnd() {
    if (this.beaversTests == undefined) {
      this.beaversTests = tests
    }else {
      const sorted = Object.keys(this.beaversTests.ands).sort();
      // @ts-ignore
      const nextId = sorted[sorted.length - 1] - 1 + 2;
      this.beaversTests.ands[nextId] = testAnd;
    }
    void this.preupdate();
  }

  addTestOr(and) {
    if (this.beaversTests?.ands[and] != undefined) {
      const sorted = Object.keys(this.beaversTests?.ands[and].ors).sort();
      // @ts-ignore
      const nextId = sorted[sorted.length - 1] - 1 + 2;
      this.beaversTests.ands[and].ors[nextId] = {type:"IncrementStep",data:{}}
    }
    void this.preupdate();
  }

  removeTestOr(and, or) {
    if (this.beaversTests?.ands[and]?.ors[or] != undefined) {
      if (Object.keys(this.beaversTests.ands[and]?.ors).length <= 1) {
        if (Object.keys(this.beaversTests.ands).length <= 1) {
          this.beaversTests = undefined;
        } else {
          delete this.beaversTests.ands[and];
          this._trash.beaversTests.ands["-=" + and] = null;
        }
      } else {
        delete this.beaversTests.ands[and].ors[or];
        if (this._trash.beaversTests.ors[and] == undefined) {
          this._trash.beaversTests.ors[and] = {};
        }
        this._trash.beaversTests.ors[and]["-=" + or] = null;
      }
    }
    void this.preupdate();
  }

  async preupdate(){
    if(this.beaversTests?.ands) {
      const stored = this.beaversTests?.ands;
      const ands = { ...JSON.parse(JSON.stringify(this.beaversTests.ands)), ...this._trash.beaversTests.ands }
      Object.keys(ands).forEach(key => {
        if (this._trash.beaversTests.ors[key] !== undefined) {
          ands[key].ors = { ...ands[key].ors, ...this._trash.beaversTests.ors[key] }
        }
      })
      this.beaversTests.ands = ands;
      await this.update(this.beaversTests);
      this.beaversTests.ands = stored;
    } else {
      await this.update(this.beaversTests);
    }
  }

}