import {NAMESPACE} from "../Settings.js"

//TODO reset to default Data
//when defaultData in activities changes between versions this will not get updated as it has stored the previeous data.
export function createActivitySettings(activity: Activity) {

    return class ActivitySettings extends FormApplication {

        data: ActivityData

        static get defaultOptions(): any {
            const title = activity.template.name;
            return mergeObject(super.defaultOptions, {
                title: title,
                template: `modules/${NAMESPACE}/templates/activity-setting.hbs`,
                id: "activity-setting",
                width: 500,
                height: 600,
                closeOnSubmit: true,
                submitOnClose: true,
                resizable: true,
                classes: ["beavers-proximity-actions", "activity-setting"]
            })
        }

        async getData(options): Promise<any> {
            this.data = (game as Game)[NAMESPACE].Settings.getActivityData(activity.id);
            return {
                skills: beaversSystemInterface.configSkills,
                abilities: beaversSystemInterface.configCanRollAbility ? beaversSystemInterface.configAbilities : [],
                canRollAbility: beaversSystemInterface.configCanRollAbility,
                data: this.data,
                localizeData: {hash: activity.defaultData}
            }
        }

        async close(options?) {
            super.close(options);
            // @ts-ignore
            SettingsConfig.reloadConfirm({world: true});
        }

        async _updateObject(event, formData) {
            for (const [key, value] of Object.entries(formData)) {
                beaversSystemInterface.objectAttributeSet(this.data, key, value);
            }
            this._updateData();
        }

        async _updateData() {
            await game[NAMESPACE].Settings.set("activity-" + activity.id, this.data);
            this.render();
        }


        activateListeners(html) {
            super.activateListeners(html);
            html.find("select[name=test.type]").on("change", (e) => {
                const selection = $(e.currentTarget).val();
                if(selection === "none"){
                    this.data.test = {
                        type: "none"
                    }
                }
                if(selection === "skill" || selection === "ability"){
                    this.data.test = {
                        type: selection,
                        inputField: {
                            label: "",
                            type: "number",
                            defaultValue: 8
                        },
                    };
                }
                if(selection === "input"){
                    this.data.test = {
                        type: selection,
                        inputField: {
                            label: "",
                            type: "text",
                            defaultValue: ""
                        },
                    };
                }
                if (selection === "gm") {
                    this.data.test = {
                        type: "gm",
                        inputField: {
                            label: "",
                            type: "boolean",
                            defaultValue: true
                        },
                    };
                }
                this._updateData();
            });
            html.find("select[name=test.inputField.type]").on("change", (e) => {
                const selection = $(e.currentTarget).val();
                if(this.data.test.type === "input") {
                    if(selection === "text" || selection === "area" || selection === "number" || selection === "boolean"){
                        this.data.test.inputField = {
                            label: "",
                            note: "",
                            type: selection
                        }
                    }
                    if(selection === "selection"){
                        this.data.test.inputField = {
                            choices: {},
                            label: "",
                            note: "",
                            type: selection
                        }
                    }
                }
                this._updateData();
            });
            html.find("button[name=addChoice]").on("click", (e) => {
                const keyName = $(e.currentTartet).parent("div.form-group").find("input")[0].value;
                if(this.data.test.type === "input" && this.data.test.inputField.type === "selection") {
                    this.data.test.inputField.choices = this.data.test.inputField.choices || {};
                    this.data.test.inputField.choices[keyName] = {text: keyName, img: ""}
                }
                this._updateData();
            });
            html.find("button[name=deleteChoice]").on("click", (e) => {
                const key = $(e.currentTarget).parent("div.form-group").data("key");
                if(this.data.test.type === "input" && this.data.test.inputField.type === "selection") {
                    delete this.data.test.inputField.choices[key]
                }
                this._updateData();
            });
        }


    }
}