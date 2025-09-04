import {NAMESPACE} from "../Settings.js";
import { addTab } from "./Tabs.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
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


export class EntityActivitySettings extends HandlebarsApplicationMixin(ApplicationV2) {
  document: any;
  entityActivityId: string;
  activity: ActivityClass;
  config: EntityConfig;

  constructor(document:any, entityActivityId:string, config?:any){
    super(config);
    this.document = document;
    this.entityActivityId = entityActivityId;
    // @ts-ignore
    this.config = foundry.utils.getProperty(this.document|| {}, `flags.${NAMESPACE}`)
      ?.activities[this.entityActivityId];
    this.activity = (game as ReadyGame)[NAMESPACE].BeaversProximityApp.getActivity(this.config.activityId);
    this.config.activityData = this.activity.mergeData(this.config.activityData);
  }

  _trash =  {
    beaversTests: {
      ands: {},
      ors: {}
    }
  };

  static DEFAULT_OPTIONS = {
    tag: "form",
    form: {
      handler: EntityActivitySettings.myFormHandler,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    position:{width: 600 }
  }

  get title(){
    return this.config.name;
  }
  static PARTS = {
    form: {
      scrollable:[],
      template: "modules/beavers-proximity-action/templates/entity-activity-settings.hbs",
      classes: ["standard-form", "scrollable"]
    }
  }

  async _preparePartContext(partId, context) {
    context.editable = true;
    context.activityData = this.config.activityData;
    context.inputs = this.activity.template.inputs;
    return context;
  }

  static myFormHandler(event, form, formData) {
    const app = this as unknown as EntityActivitySettings;
    for(const [key, value] of Object.entries(formData.object)){
      // @ts-ignore
      foundry.utils.setProperty(app.config, key, value);
    }

    void app.update();
  }


    async update(){
      const path = `flags.${NAMESPACE}.activities.${this.entityActivityId}`;

      if(this.config.activityData?.beaversTests?.ands) {
        const stored = this.config.activityData?.beaversTests?.ands;
        const ands = { ...JSON.parse(JSON.stringify(this.config.activityData.beaversTests.ands)), ...this._trash.beaversTests.ands }
        Object.keys(ands).forEach(key => {
          if (this._trash.beaversTests.ors[key] !== undefined) {
            ands[key].ors = { ...ands[key].ors, ...this._trash.beaversTests.ors[key] }
          }
        })
        this.config.activityData.beaversTests.ands = ands;
        this.document = await this.document.update({ [path]: this.config });
        this.config.activityData.beaversTests.ands = stored;
      } else {
        if(this.config.activityData && this.config.activityData.beaversTests == undefined){
          this.config.activityData["-=beaversTests"] = null;
        }
        this.document = await this.document.update({ [path]: this.config });
        if(this.config.activityData) {
          for (const k of Object.keys(this.config.activityData)) {
            if (k.startsWith("-=beaversTests")) delete (this.config.activityData as any)[k];
          }
        }

      }
      // @ts-ignore
      await this.render(true);
    }


  _onRender(context, options) {
    //@ts-ignore
    const element = this.element;
    element.querySelectorAll(".tests-add").forEach(i=>i.addEventListener("click",
      this.addTestAnd.bind(this)
    ));
    element.querySelectorAll(".test-or .test-delete").forEach(i=>i.addEventListener("click",(e)=>{
      const and = $(e.currentTarget).data("and");
      const or = $(e.currentTarget).data("or");
      this.removeTestOr(and,or);
    }));
    element.querySelectorAll(".test-or .test-add").forEach(i=>i.addEventListener("click",(e)=>{
      const and = $(e.currentTarget).data("and");
      this.addTestOr(and);
    }));

    element.querySelectorAll(".beavers-test-selection select").forEach(i=>i.addEventListener("change", async (e) => {
      const name = e.target.name;
      const { ands: and, ors: or } = name.split(".").reduce((result, item, index, array) =>
        (item === "ands" || item === "ors") ? { ...result, [item]: array[index + 1] } : result, {});
      const type = $(e.target).val() as string;
      this.changeSelection(and, or, type);
    }));
  }


  changeSelection(and:string, or:string, type:string){
    if (this.config.activityData?.beaversTests?.ands[and]?.ors[or]) {
      this.config.activityData.beaversTests.ands[and].ors[or].type = type;
      this.config.activityData.beaversTests.ands[and].ors[or].data = {};
      void this.update();
    }
  }

  addTestAnd() {
    if (this.config.activityData?.beaversTests == undefined) {
      this.config.activityData = {beaversTests:tests}
    }else {
      const sorted = Object.keys(this.config.activityData.beaversTests.ands).sort();
      // @ts-ignore
      const nextId = sorted[sorted.length - 1] - 1 + 2;
      this.config.activityData.beaversTests.ands[nextId] = testAnd;
    }
    void this.update();
  }

  addTestOr(and) {
    if (this.config.activityData?.beaversTests?.ands[and] != undefined) {
      const sorted = Object.keys(this.config.activityData.beaversTests?.ands[and].ors).sort();
      // @ts-ignore
      const nextId = sorted[sorted.length - 1] - 1 + 2;
      this.config.activityData.beaversTests.ands[and].ors[nextId] = {type:"IncrementStep",data:{}}
    }
    void this.update();
  }

  removeTestOr(and, or) {
    if (this.config.activityData?.beaversTests?.ands[and]?.ors[or] != undefined) {
      if (Object.keys(this.config.activityData.beaversTests.ands[and]?.ors).length <= 1) {
        if (Object.keys(this.config.activityData.beaversTests.ands).length <= 1) {
          this.config.activityData.beaversTests = undefined;
        } else {
          delete this.config.activityData.beaversTests.ands[and];
          this._trash.beaversTests.ands["-=" + and] = null;
        }
      } else {
        delete this.config.activityData.beaversTests.ands[and].ors[or];
        if (this._trash.beaversTests.ors[and] == undefined) {
          this._trash.beaversTests.ors[and] = {};
        }
        this._trash.beaversTests.ors[and]["-=" + or] = null;
      }
    }
    void this.update();
  }

}