export class BeaversFormField extends HTMLElement {

    label: string;
    type: string;
    name: string;
    placeHolder: string;
    value: string;
    disabled: boolean;
    content: string;

    constructor() {
        super();
        this.label = this.getAttribute("label") || "";
        this.type = this.getAttribute("type") || "";
        this.disabled = this.hasAttribute("disabled");
        this.name = this.getAttribute("name") || "";
        this.placeHolder = this.getAttribute("placeHolder") || "";
        this.value = this.getAttribute("value") || "";
        this.content = this.innerHTML;

        this.render();
    }


    render() {

    }
}

