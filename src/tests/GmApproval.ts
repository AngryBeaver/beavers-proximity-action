import { NAMESPACE } from "../Settings.js";
export class GmApproval implements TestClass<"question"> {
  type = "GmApproval";

  create(data: Record<"question", any>) {
    const result = new GmApprovalCustomized();
    result.data = data;
    result.parent = this;
    return result;
  }

  readonly informationField: InfoField = {
    name: "type",
    type: "info",
    label: (game as ReadyGame).i18n.localize("beaversSystemInterface.tests.gmApproval.info.label"),
    note: (game as ReadyGame).i18n.localize("beaversSystemInterface.tests.gmApproval.info.note"),
  };

  readonly customizationFields: Record<"question", InputField> = {
    question: {
      name: "question",
      label: (game as ReadyGame).i18n.localize("beaversSystemInterface.tests.gmApproval.question.label"),
      note: (game as ReadyGame).i18n.localize("beaversSystemInterface.tests.gmApproval.question.note"),
      defaultValue: (game as ReadyGame).i18n.localize("beaversSystemInterface.tests.gmApproval.question.default"),
      type: "text",
    },
  };

  readonly renderTypes: Record<"question", TestRenderType> = {
    question: "setup",
  };
}

class GmApprovalCustomized implements Test<"question"> {
  parent: GmApproval;
  data: Partial<Record<"question", any>>;

  public action = async (initiatorData: InitiatorData): Promise<TestResult> => {
    const socket = (game as ReadyGame)[NAMESPACE].socket;
    const question = String(this.data?.question ?? "Approve this action?");

    // @ts-ignore
    const gms = game.users?.filter((u:User) => u.isGM && u.active) ?? [];
    if (!socket || gms.length === 0) {
      ui.notifications?.warn?.(`[${NAMESPACE}] No GM available to approve: "${question}"`);
      return { success: 0, fail: 1 };
    }

    const request: GmApprovalRequest = {
      id: crypto.randomUUID(),
      moduleId: NAMESPACE,
      question,
      initiator: initiatorData,
      created: Date.now(),
    };

    try {
      const approved: boolean = await socket.executeAsUser(
        SOCKET_HANDLER.GM_SHOW_REQUEST,
        gms[0].id,
        request,
      );
      return approved ? { success: 1, fail: 0 } : { success: 0, fail: 1 };
    } catch (err) {
      console.error(`${NAMESPACE} | GM approval failed`, err);
      return { success: 0, fail: 1 };
    }
  };

  public render = (): string => {
    return String("Ask GM for approval");
  };
}

export const SOCKET_HANDLER = {
  GM_SHOW_REQUEST: "gmApproval:showRequest",
  GM_RESOLVE_REQUEST: "gmApproval:resolveRequest",
} as const;

