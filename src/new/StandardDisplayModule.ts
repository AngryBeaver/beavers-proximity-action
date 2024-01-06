export class StandardDisplayModule implements DisplayModule {

    public async msg(msg:string,type:MsgType,initiatorData:InitiatorData){
        const localizedMsg = game["i18n"].localize("msg");
        ui.notifications?.[type](localizedMsg);
    }

    public async prompt(inputField:InputField,initiatorData:InitiatorData): Promise<boolean | null> {
        return new Promise((resolve, reject) => {
            Dialog.confirm({
                title: inputField.label,
                content: inputField.note,
                yes: ()=>resolve(true),
                no: ()=>resolve(false)
            });
        });
    }

    public async input(inputField:InputField,initiatorData:InitiatorData): Promise<any | null> {
        if(inputField.type === "selection"){
            return this.choices(inputField);
        }
        if(inputField.type === "boolean"){
            return this.prompt(inputField,initiatorData);
        }
        const content = await renderTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs', {
            ...inputField
        });

        const form = `<form>${content}</form>`;
        return new Promise((resolve, reject) => {
            const dialog = new Dialog({
                title: inputField.label,
                content: form,
                buttons: {
                    submit: {
                        label: "ok", callback: (html) => {
                            resolve(html[0].querySelector('input').value);
                        }
                    },
                },
                close: () => {
                    resolve(null)
                }
            });
            dialog.render(true);
        });
    }

    private async choices(inputField:SelectionField): Promise<string | null>{
        return beaversSystemInterface.uiDialogSelect({choices: inputField.choices})
    }

}