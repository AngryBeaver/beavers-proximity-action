import { SOCKET_HANDLER } from "../tests/GmApproval.js";
import { NAMESPACE } from "../Settings.js";

type RequestState = "pending" | "approved" | "denied";

interface StoredRequest {
  data: GmApprovalRequest;
  state: RequestState;
}

const updateHook = `${NAMESPACE}.gmApproval.updated`;

export class GmApprovalStore {
  private static _instance: GmApprovalStore;
  static get instance() {
    return (this._instance ??= new GmApprovalStore());
  }

  private requests = new Map<string, StoredRequest>();

  upsert(req: GmApprovalRequest) {
    const prev = this.requests.get(req.id);
    const next: StoredRequest = prev ?? { data: req, state: "pending" };
    next.data = req;
    this.requests.set(req.id, next);
    Hooks.call(`${NAMESPACE}.gmApproval.updated`);
  }

  resolve(id: string, approved: boolean) {
    const item = this.requests.get(id);
    if (!item) return;
    if (item.state !== "pending") return;
    item.state = approved ? "approved" : "denied";
    Hooks.call(`${NAMESPACE}.gmApproval.updated`);
  }

  list() {
    return Array.from(this.requests.values());
  }

  get(id: string) {
    return this.requests.get(id);
  }
}

export class GmInbox extends foundry.applications.api.ApplicationV2 {
  static PARTS = {
    content: {
      template: `modules/${NAMESPACE}/templates/gm-inbox.hbs`,
    },
  };

  static get DEFAULT_OPTIONS(): any {
    // @ts-ignore
    return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      id: `${NAMESPACE}-gm-inbox`,
      tag: "section",
      classes: ["bpa", "gm-inbox"],
      window: {
        title: "GM Inbox",
        resizable: true,
      },
      position: {
        width: 420,
      },
      actions: {
        approve: function (this: GmInbox, event: PointerEvent, target: HTMLElement) {
          const id = target.dataset.id;
          if (!id) return;
          this.resolve(id, true);
        },
        deny: function (this: GmInbox, event: PointerEvent, target: HTMLElement) {
          const id = target.dataset.id;
          if (!id) return;
          this.resolve(id, false);
        },
      },
    });
  }
  protected override _onClose(){
    const rerender = () => this.render();
    Hooks.off(updateHook, rerender);
  }

  // Subscribe to the rerender Hook after the first render; auto-unsubscribe on close
  protected override async _onFirstRender(_ctx: unknown, _opts: unknown): Promise<void> {
    const rerender = () => this.render();
    Hooks.on(updateHook, rerender);
  }

  protected override async _prepareContext(_options?: object): Promise<any> {
    const items = GmApprovalStore.instance.list().map((it) => {
      const user = (game as ReadyGame).users?.get(it.data.initiator.userId);
      const who = user ? user.roleLabel : it.data.initiator.userId;
      return {
        id: it.data.id,
        question: it.data.question,
        who,
        when: new Date(it.data.created).toLocaleString(),
        state: it.state,
      };
    });
    return { items };
  }

  private resolve(id: string, approved: boolean) {
    GmApprovalStore.instance.resolve(id, approved);
    this.render();
  }

  static getOrCreate(): GmInbox {
    const mod = (game as Game)[NAMESPACE] || (((game as any)[NAMESPACE] = {}) as any);
    if (!mod.GmInbox) mod.GmInbox = new GmInbox({});
    return mod.GmInbox as GmInbox;
  }
}


// Socket handler registration
export function registerGMInboxSocketHandlers() {
  const socket = (game as Game)[NAMESPACE].socket;
  socket.register(SOCKET_HANDLER.GM_SHOW_REQUEST, async (req: GmApprovalRequest) => {
    if (!(game as ReadyGame).user?.isGM) return false;
    GmApprovalStore.instance.upsert(req);
    await ensureInboxOpen();
    return await waitUntilResolved(req.id);
  });

  async function  ensureInboxOpen() {
    await GmInbox.getOrCreate().render();
  }

  function waitUntilResolved(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const tick = () => {
        const item = GmApprovalStore.instance.get(id);
        if (item && item.state !== "pending") {
          Hooks.off(`${NAMESPACE}.gmApproval.updated`, tick);
          resolve(item.state === "approved");
          return;
        }
      };
      Hooks.on(`${NAMESPACE}.gmApproval.updated`, tick);
      tick();
    });
  }
}