import {NAMESPACE} from "./Settings.js"
import { TileActivity } from "./activities/TileActivity.js";
import { WallActivity } from "./activities/WallActivity.js";
import { RegionActivity } from "./activities/RegionActivity.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

//TODO reset to default Data
//when defaultData in activities changes between versions this will not get updated as it has stored the previeous data.
export function createActivitySettings(activityClass: ActivityClass) {

    return class ActivitySettings extends HandlebarsApplicationMixin(ApplicationV2) {

      activityData = activityClass.worldData;

      get title(){
        return activityClass.template.name;
      }

      static DEFAULT_OPTIONS = {
        tag: "form",
        form: {
          handler: ActivitySettings.myFormHandler,
          submitOnChange: true,
          closeOnSubmit: false,
        },
        position:{width: 660 }
      }

      static PARTS = {
        form: {
          scrollable:[],
          template: "modules/beavers-proximity-action/templates/activity-setting.hbs",
          classes: ["standard-form", "scrollable"]
        }
      }

      async _preparePartContext(partId, context) {
        context.editable = true;
        context.activityData = this.activityData;
        context.inputs = activityClass.template.inputs;
        context.template =  activityClass.template
        context.type = activityClass.type;
        context.localizeData =  {hash: activityClass.template}
        return context;
      }

      static myFormHandler(event, form, formData) {
        const app = this as unknown as ActivitySettings;
        for(const [key, value] of Object.entries(formData.object)){
          // @ts-ignore
          foundry.utils.setProperty(this.activityData, key, value);
        }
        void app.update();
      }

      async update(){
        await (game as Game)[NAMESPACE].Settings.set("activityClass-" + activityClass.id, this.activityData);
        // @ts-ignore
        await this.render(true);
      }

      _onRender(context, options) {
        //@ts-ignore
        const element = this.element;
        element.querySelectorAll(".enabled-add").forEach(i => i.addEventListener("click",()=> {
          this.addEnableAttribute();
        }));
        element.querySelectorAll(".enabled-delete").forEach(i => i.addEventListener("click",(e) => {
            const index = $(e.currentTarget).data("index");
            this.removeEnabledAttribute(index)
        }));
      }

      addEnableAttribute(){
        if(this.activityData.enabled){
          this.activityData.enabled.push({attribute:"", value:""})
        }
        void this.update();
      }
      removeEnabledAttribute(index:number){
        if(this.activityData.enabled?.[index]){
          this.activityData.enabled.splice(index,1);
        }
        void this.update();
      }

    }
}