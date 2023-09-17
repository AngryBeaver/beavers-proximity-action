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
                const blankSettings:bpa.ActivitySettings = {
                    enabled: false,
                    test: {options: {}}
                };
                const mergedData = foundry.utils.mergeObject(blankSettings,game[NAMESPACE].Settings.getActivitySetting(activityClass.defaultData.id),{
                    insertKeys: false,
                    insertValues: true,
                    overwrite: true,
                    inplace: false
                });
                this.data = mergedData;
                return {
                    skills: beaversSystemInterface.configSkills,
                    abilities: beaversSystemInterface.configCanRollAbility?beaversSystemInterface.configAbilities:[],
                    canRollAbility: beaversSystemInterface.configCanRollAbility,
                    data: this.data,
                    localizeData: {hash:activityClass.defaultData}
                }
            }

            async close(options?){
                super.close(options);
                // @ts-ignore
                SettingsConfig.reloadConfirm({world: true});
            }

            async _updateObject(event, formData) {
                for(const [key,value] of Object.entries(formData)){
                    beaversSystemInterface.objectAttributeSet(this.data,key,value);
                }
                this._updateData();
            }
            async _updateData(){
                await game[NAMESPACE].Settings.set("activity-"+activityClass.defaultData.id, this.data);
                this.render();
            }


            activateListeners(html) {
                super.activateListeners(html);
                html.find(".add-test-option").on("click",(e)=>{
                    const parent = $(e.currentTarget).parent();
                    let id = parent.find("input.add-id").val() as string;
                    if(!id || id === ""){
                       id = foundry.utils.randomID();
                    }
                    const type = parent.find("select").val() as bpa.TestType;
                    this.data.test.options = this.data.test.options || {};
                    this.data.test.options[id] = {
                        id:id,
                        type:type,
                    }
                    this._updateData();
                });
                html.find(".delete-test-option").on("click",(e)=>{
                    const testId = $(e.currentTarget).data("or");
                    delete this.data.test.options[testId];
                    this._updateData();
                });
            }


        }
    }
}