export class BeaversButton extends HTMLElement {

    icon: string;
    name: string;
    content: string;

    constructor() {
        super();
        this.icon = this.getAttribute("icon") || "";
        this.name = this.getAttribute("name") || "";
        this.content = this.innerHTML;
        this.render();
    }

    render(){
        let content = "";
        if(this.content.trim()){
            content = `<span style="flex:1;padding:0px 5px;">${this.content}</span>`;
        }
        const button =`<button name="${this.name}" type="button" style="display:flex;padding:0px;line-height:25px;border-radius:5px;margin:0px">
       
        <span style="width:25px; background-color: rgba(0,0,0,0.1)">
            <i class="fas fa-${this.icon}"></i>
        </span>${content}</button>`;
        $(this).html(button);
    }
}