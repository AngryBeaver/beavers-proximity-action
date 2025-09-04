import { NAMESPACE } from "../Settings.js";
import { addTab } from "./Tabs.js";
import { EntityActivitySettings } from "./EntityActivitySettings.js";


export class EntitySettings<T extends EntityType> {
  app;
  configs: EntityConfigs;
  element;
  document;
  dump: {} = {};
  type: EntityType;

  constructor(app, html, entity, type: T) {
    this.app = app;
    this.element = $(html);
    this.app.setPosition({ width: 500 });
    this.type = type;
    this.init();
  }

  private getConfigs(): EntityConfigs {
    // @ts-ignore
    const configs = foundry.utils.getProperty(this.app.document
      || {}, `flags.${NAMESPACE}`) || { activities: {} };
    configs.activities = Object.fromEntries(
      Object.entries(configs.activities).filter(([, v]) => v != null), // drop null/undefined values
    );
    return configs;
  }


  public content(tabData: TabData) {
  }

  public addTab(){

  }

  private setTab() {
    var tabData: TabData = {
      id: "proximity",
      name: "Proximity",
      icon: "<i class=\"fas fa-street-view\"></i>",
      group: "sheet",
      content: "<div data-id=\"activity-content\"></div>",
      onClick: this.onActivateTab.bind(this),
    };
    this.content(tabData);
    addTab(this.element, tabData);
    this.app.changeTab(this.app.tabGroups[tabData.group], tabData.group, { force: true });
  }

  init() {
    this.configs = this.getConfigs();
    this.addTab();
    this.setTab();
    void this._removeUnregisteredStoredActivities();
    this._activateTab();
    this.render();
  }


  _activateTab() {
    if (this.app.activeTab !== undefined) {
      this.app._tabs[0].activate(this.app.activeTab);
    }
  }

  onActivateTab() {
    console.log("tab");
  }

  onAddActivity() {
    const bpa = (game as Game)[NAMESPACE].BeaversProximityApp;
    const all = bpa.getActivities(this.type) || [];
    // Filter out already added activities to avoid duplicates
    const existing = new Set(Object.values(this.configs.activities).map((c: any) => c.activityId));
    const available = all.filter(a => !existing.has(a.id));
    if (available.length === 0) {
      ui.notifications?.info?.("No available activities to add.");
      return;
    }
    const options = available.map(a => `<option value="${a.id}">${a.template.name}</option>`).join("");
    new foundry.applications.api.DialogV2({
      window: { title: "Create Proximity Activity" },
      content: `
        <div class="form-group" style="width:340px">
          <label>Name</label>
          <div class="form-fields">
            <input type="text" name="name" placeholder="ActivityName" value="" autofocus="">
          </div>
        </div>
        <div class="form-group">
          <label>Activity</label>
          <div class="form-fields">
            <select name="activityId">
              ${options}
            </select>
          </div>
        </div>
        `,
      buttons: [{
        icon: "fas fa-check",
        action: "activity",
        label: "Create Proximity Activity",
        default: true,
        callback: (event, button, dialog) => {
          const activityId = button.form.elements.activityId.value;
          const activityClass = (game as Game)[NAMESPACE].BeaversProximityApp.getActivity(activityId);
          const name = button.form.elements.name.value || activityClass.name;
          this.addActivityConfig(name, button.form.elements.activityId.value)
            .then(index => {
              new EntityActivitySettings(this.app.document, index)
                //@ts-ignore
                .render({ force: true });
            });
        },
      }],
    }).render({ force: true });
  }

  async _removeUnregisteredStoredActivities() {
    let hasChanged = false;
    Object.entries(this.configs.activities).forEach(([key, config]) => {
      const activityClass = (game as Game)[NAMESPACE].BeaversProximityApp.getActivity(config.activityId);
      if (!activityClass) {
        hasChanged = true;
        delete this.configs.activities[key];
        this.dump["-=" + key] = null;
      }
    });
    if (hasChanged) {
      await this.update();
    }
  }

  async addActivityConfig(name: string, activityId: string) {
    // @ts-ignore
    const id = foundry.utils.randomID();
    this.configs.activities[id] = {
      name: name,
      activityId: activityId,
      data: {},
      activityData: { enabled: [] },
    } as any;
    await this.update();
    return id;
  }

  removeActivityConfig(key: string) {
    delete this.configs.activities[key];
    this.dump["-=" + key] = null;
    void this.update();
  }

  resetActivity(key:string){
    this.configs.activities[key].activityData = {enabled:[], data: {}};
    void this.update();
  }

  async update() {
    var flags: any = {};
    flags[NAMESPACE] = JSON.parse(JSON.stringify(this.configs));
    Object.keys(this.dump).forEach(key => {
      flags[NAMESPACE].activities[key] = null;
    });
    this.dump = {};
    await this.app.document.update({ flags: flags });
    this.configs = this.getConfigs();
  }

  async render() {
    let content = "";
    content += await foundry.applications.handlebars.renderTemplate("modules/beavers-proximity-action/templates/entity-settings.hbs",
      { activities: this.configs.activities },
    );
    this.element.find(`div[data-id=activity-content]`).html(content);
    this.activateHandler();
  }

  activateHandler() {
    this.element.find(".activity-delete").on("click", async (e) => {
      const index = e.currentTarget.dataset.id;
      this.removeActivityConfig(index);
    });
    this.element.find(".activity-reset").on("click", async (e) => {
      const index = e.currentTarget.dataset.id as string;
      this.resetActivity(index);
    });
    this.element.find(".activity-edit").on("click", async (e) => {
      const index = e.currentTarget.dataset.id as string;
      // @ts-ignore
      void new EntityActivitySettings(this.app.document, index).render({ force: true });
    });
  }

}