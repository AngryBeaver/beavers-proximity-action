import {NAMESPACE} from "./Settings.js";
import {bpa} from "./types.js";

export class ActivitySettings {

    static build(activityClass:bpa.ActivityClass) {
        return class ActivitySetting extends FormApplication {

            data:bpa.ActivitySettings

            static get defaultOptions(): any {
                const title = activityClass.defaultData.name;
                return mergeObject(super.defaultOptions, {
                    title: title,
                    template: `modules/${NAMESPACE}/templates/activity-setting.hbs`,
                    id: "activity-setting",
                    width: 500,
                    height: 600,
                    closeOnSubmit: true,
                    submitOnClose:true,
                    resizable: true,
                    classes: ["beavers-proximity-actions", "activity-setting"]
                })

            }

            async getData(options):Promise<any>{
                //TODO merge with defaultData
                this.data = game[NAMESPACE].Settings.getActivitySetting(activityClass.defaultData.id);
                return {
                    skills: beaversSystemInterface.configSkills,
                    abilities: beaversSystemInterface.configCanRollAbility?beaversSystemInterface.configAbilities:[],
                    canRollAbility: beaversSystemInterface.configCanRollAbility,
                    data: this.data,
                    localizeData: {hash:activityClass.defaultData}
                }
            }

            async _updateObject(event, formData) {
                this.data = formData;
                this._updateData();
            }
            async _updateData(){
                game[NAMESPACE].Settings.set("activity-"+activityClass.defaultData.id, this.data);
                this.render();
            }


            activateListeners(html) {
                super.activateListeners(html);
                html.find("add-test-option").on("click",(e)=>{
                    const parent = $(e.currentTarget).parent();
                    const id = parent.find("input").val() as string;
                    const type = parent.find("select").val() as bpa.TestType;
                    this.data.test.options = this.data.test.options || {};
                    this.data.test.options[id] = {
                        id:id,
                        type:type,
                    }
                    this._updateData();
                });

            }


        }
    }
}