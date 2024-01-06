export class BeaversButton extends HTMLElement {

    icon: string;
    name: string;

    constructor() {
        super();
        this.icon = this.getAttribute("icon") || "";
        this.name = this.getAttribute("name") || ""
        this.render();
    }

    render(){
        const button =`<button name="{{this.name}}" type="button" style="display:flex;padding:0px;line-height:25px;border-radius:5px;">
        <span style="width:25px; background-color: rgba(0,0,0,0.1)">
            <i class="fas fa-${this.icon}"></i>
        </span>`;
        $(this).html(button);
    }
}