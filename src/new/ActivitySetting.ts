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
                width: 700,
                height: 600,
                submitOnChange: true,
                closeOnSubmit: false,
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
                activity: activity.template,
                localizeData: {hash: activity.template}
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
            html.find('select[name="test.type"]').on("change", (e) => {
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
                        },
                        acceptedResponse:8
                    };
                }
                if(selection === "input"){
                    this.data.test = {
                        type: selection,
                        inputField: {
                            label: "",
                            type: "text",
                        },
                        acceptedResponse:""
                    };
                }
                if (selection === "gm") {
                    this.data.test = {
                        type: "gm",
                        inputField: {
                            label: "",
                            type: "boolean",
                        },
                    };
                }
                this._updateData();
            });
            html.find('select[name="test.inputField.type"]').on("change", (e) => {
                const type = $(e.currentTarget).val();
                if(this.data.test.type === "input") {
                    if(type === "text" || type === "area" || type === "number" || type === "boolean"){
                        this.data.test.inputField = {
                            label: "",
                            note: "",
                            type: type
                        }
                    }
                    if(type === "selection"){
                        this.data.test.inputField = {
                            choices: {},
                            label: "",
                            note: "",
                            type: type
                        }
                    }
                }
                this._updateData();
            });
            html.find('button[name="addChoice"]').on("click", (e) => {
                const keyName = $(e.currentTarget).parents("div.form-group").find("input").val() as string;
                if(keyName && this.data.test.type === "input" && this.data.test.inputField.type === "selection") {
                    this.data.test.inputField.choices = this.data.test.inputField.choices || {};
                    this.data.test.inputField.choices[keyName] = {text: keyName, img: ""}
                }
                this._updateData();
            });
            html.find('button[name="removeChoice"]').on("click", (e) => {
                const key = $(e.currentTarget).parents("div.form-group").data("key");
                if(this.data.test.type === "input" && this.data.test.inputField.type === "selection") {
                    delete this.data.test.inputField.choices[key]
                }
                this._updateData();
            });
        }


    }
}