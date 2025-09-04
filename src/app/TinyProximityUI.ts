import { NAMESPACE } from "../Settings.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;


export class TinyProximityUI extends HandlebarsApplicationMixin(ApplicationV2) implements ActivityOutput {

  data:{
    msg:string,
    inputs?: InputField[]
  }
  private _deferred?: Deferred<any>;


  constructor(){
    super();
    this.data = {
      msg:""
    }
  }

  static PARTS = {
    content: {
      template: `modules/${NAMESPACE}/templates/tiny-proximity-ui.hbs`,
    },
  };

  static get DEFAULT_OPTIONS(): any {
    // @ts-ignore
    return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      id: `${NAMESPACE}-proximity-ui`,
      tag: "section",
      classes: ["bpa", "proximity-ui"],
      window: {
        title: "Proximity UI",
        resizable: true,
      },
      position: {
        width: 420,
      },
      actions: {
      },
    });
  }

  async _preparePartContext(partId, context) {
    context.data = this.data;
    return context;
  }

  _onRender(context, options) {
    //@ts-ignore
    const element = this.element;
    element.querySelectorAll("select").forEach(i => i.addEventListener("change",
      (e)=>{
      const value = $(e.target).val() as string;
      this.fulfillRequest(value);
      }
    ));
    element.querySelectorAll("button").forEach(i => i.addEventListener("click",
      (e)=>{
        this.fulfillRequest(true);
      }
    ));
  }

  _onClose(){
    this.failRequest(null);
  }
  async clear(){
    this.data.msg = "";
    this.data.inputs = [];
  }
  async msg(msg, type = "none") {
    if(this.data.msg != ""){
      this.data.msg += "</br>";
    }
    if(type === "warn"){
      this.data.msg += `<div style="box-shadow:0 0 0 1px #c9ba9b inset, 0 0 0 0 transparent;background-color: #fffaf3;
      color: #573a08;padding:10px;border-radius:5px;margin:2px;">${msg}</div>`
    }
    if(type === "info"){
      this.data.msg += `<div style="box-shadow:0 0 0 1px #9bb9c9 inset, 0 0 0 0 transparent;background-color: #ddeffa;
      color: #083357;padding:10px;border-radius:5px;margin:2px;">${msg}</div>`
    }
    if(type === "erro"){
      this.data.msg += `<div style="box-shadow:0 0 0 1px #c99b9b inset, 0 0 0 0 transparent;background-color: #fadddd;
      color: #570808;padding:10px;border-radius:5px;margin:2px;">${msg}</div>`
    }
    if(type === "none"){
      this.data.msg += msg;
    }
    //@ts-ignore
    this.render(true);
  }
  async choose(options, prompt:string) {
    this.data.inputs = [{
      type: "selection",
      label: prompt,
      name: "",
      //@ts-ignore
      choices: Object.fromEntries(Object.entries(options).map(([k, v]) => [k, { text: v.label }])),
    }]
    //@ts-ignore
    await this.render(true)
    return await this.waitForRequest<string|null>();
  }

  async akk(label:string) {
    this.data.inputs = [{
      type: "button",
      label: "",
      name: "",
      content: label
    }];
    //@ts-ignore
    await this.render(true);
    return await this.waitForRequest<boolean|null>();
  }

  waitForRequest<T = unknown>(): Promise<T> {
    if (this._deferred && !this._deferred.settled) {
      return this._deferred.promise as Promise<T>;
    }
    let resolve!: (v: T) => void;
    let reject!: (e?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = (v) => { this._deferred!.settled = true; res(v); };
      reject  = (e) => { this._deferred!.settled = true; rej(e); };
    });
    this._deferred = { promise, resolve, reject, settled: false };
    return promise;
  }

  fulfillRequest<T = unknown>(value: T): void {
    this._deferred?.resolve(value);
    this._deferred = undefined; // cleanup
  }

  failRequest(error?: unknown): void {
    this._deferred?.resolve(error ?? null);
    this._deferred = undefined; // cleanup
  }

}