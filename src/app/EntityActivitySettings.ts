import {NAMESPACE} from "../Settings.js";
import { addTab } from "./Tabs.js";
import { TestSettings } from "./TestSettings.js";

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
  testSettings: TestSettings;

  constructor(document:any, entityActivityId:string, config?:any){
    super(config);
    this.document = document;
    this.entityActivityId = entityActivityId;
    // @ts-ignore
    this.config = foundry.utils.getProperty(this.document|| {}, `flags.${NAMESPACE}`)
      ?.activities[this.entityActivityId];
    this.activity = (game as ReadyGame)[NAMESPACE].BeaversProximityApp.getActivity(this.config.activityId);
    this.config.activityData = this.activity.mergeData(this.config.activityData);
    this.testSettings = new TestSettings(this,this.config.activityData.beaversTests,
      async (beaversTests:BeaversTests|undefined)=>{
        let path = `flags.${NAMESPACE}.activities.${this.entityActivityId}.activityData.-=beaversTests`;
        this.config.activityData.beaversTests = beaversTests;
        if(beaversTests != undefined){
          path = `flags.${NAMESPACE}.activities.${this.entityActivityId}.activityData.beaversTests`;
        }
        await this.document.update({ [path]: beaversTests });
        // @ts-ignore
        await this.render(true);
        }
    );

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
    app.testSettings.onChange(app.config.activityData.beaversTests)
    void app.update();
  }


    async update(){
      const path = `flags.${NAMESPACE}.activities.${this.entityActivityId}`;
      this.document = await this.document.update({ [path]: this.config });
      // @ts-ignore
      await this.render(true);
    }


  _onRender(context, options) {
    this.testSettings.onRender(context, options)
  }



}