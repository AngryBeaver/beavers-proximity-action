import { NAMESPACE } from "../Settings.js";
import { executeActivityGM } from "./ActivityExecution.js";
import { TestHandler } from "./TestHandler.js";
export const SOCKET_SCAN = "scan";
export const SOCKET_EXECUTE_ACTIVITY = "executeActivity";


export const DefaultDialogOutput: ActivityOutput = {
  async msg(msg, type = "info", _initiator) {
    ui.notifications?.[type === "error" ? "error" : type === "warn" ? "warn" : "info"]?.(msg);
  },
  async choose(options, prompt, _initiator) {
    // Adapt this to your UI system; reusing beaversSystemInterface if preferred
    const choices = Object.fromEntries(Object.entries(options).map(([k, v]) => [k, { text: v.label }]));
    const sel = await (beaversSystemInterface as any).uiDialogSelect({ choices });
    return sel ?? null;
  },
};

export async function requestScanOnGM(initiatorData: InitiatorData, output: ActivityOutput = DefaultDialogOutput) {
  const socket = (game as Game)[NAMESPACE].socket;
  if (!socket) throw new Error("Socket not ready");
  const resp = (await socket.executeAsGM(SOCKET_SCAN, initiatorData)) as ProximityResponse | null;
  if (!resp) {
    await output.msg("No GM available or scan failed", "warn", initiatorData);
    return null;
  }
  return resp;
}
export async function chooseAndRunActivity(resp: ProximityResponse, output: ActivityOutput = DefaultDialogOutput) {
  if (!resp?.activities?.length) {
    await output.msg("Nothing found nearby.", "info", resp?.initiator);
    return;
  }

  const options: { [k: string]: { label: string; note?: string } } = {};
  resp.activities.forEach((a, idx) => {
    const key = String(idx);
    const label = `${a.name} (${a.entityIds.length})`;
    options[key] = { label };
  });

  const chosen = await output.choose(options, "Choose an activity", resp.initiator);
  if (chosen == null) return;

  const idx = Number(chosen);
  const hit = resp.activities[idx];
  if (!hit) return;

  const payload = {
    activityId: hit.activityId,
    entityIds: hit.entityIds,
    initiatorData: resp.initiator,
  };

  const socket = (game as Game)[NAMESPACE].socket;
  const res = await socket.executeAsGM(SOCKET_EXECUTE_ACTIVITY, payload);
  if (!res?.ok) {
    await output.msg(`Failed to execute: ${res?.error ?? "Unknown error"}`, "error", resp.initiator);
  }
}

export async function executeActivityClient(args: ActivityPayload, output?: ActivityTestOutput | ActivityOutput) {
  const { activityId, entityIds, initiatorData } = args;
  const bpa = (game as Game)[NAMESPACE].BeaversProximityApp;
  const activityClass = bpa.getActivity(activityId) as ActivityClass;
  if (!activityClass) throw new Error(`Activity not found: ${activityId}`);

  const out = (output ?? getDefaultOutput()) as ActivityTestOutput | ActivityOutput;

  async function showNextTest(infoHtml: string, current: TestsResult): Promise<boolean> {
    const testOut = out as ActivityTestOutput;
    if (testOut.nextTest) return await testOut.nextTest(infoHtml, current, initiatorData);
    const progress = `(hits: ${current.hits}/${current.maxHits}, fails: ${current.fails}/${current.maxFails})`;
    await out.msg(`${progress}\n${infoHtml}`, "info", initiatorData);
    const chosen = await out.choose(
      {
        continue: { label: (game as ReadyGame).i18n?.localize?.("CONTINUE") ?? "Continue" },
        cancel: { label: (game as ReadyGame).i18n?.localize?.("Cancel") ?? "Cancel" },
      },
      (game as ReadyGame).i18n?.localize?.("beaversProximityAction.tests.next") ?? "Next Test",
      initiatorData
    );
    return chosen === "continue";
  }

  async function showProgress(current: TestsResult) {
    const testOut = out as ActivityTestOutput;
    if (testOut.progress) return await testOut.progress(current, initiatorData);
    return out.msg(`Progress: hits ${current.hits}/${current.maxHits}, fails ${current.fails}/${current.maxFails}`, "info", initiatorData);
  }

  for (const entityId of entityIds) {
    const instance = new (activityClass as any)(entityId, initiatorData as any) as ActivityInstance;
    const merged = (activityClass as any).mergeData(instance.configs) as ActivityData; // see Part 2

    if (merged.beaversTests) {
      const handler = new TestHandler(merged.beaversTests);

      while (handler.hasAdditionalTests()) {
        const previewHtml = handler.nextTest(); // optional helper in TestHandler
        const current = handler.getTestsResult();
        const proceed = await showNextTest(previewHtml, current);
        if (!proceed) {
          await out.msg((game as ReadyGame).i18n?.localize?.("beaversProximityAction.tests.cancelled") ?? "Cancelled", "warn", initiatorData);
          return;
        }

        await handler.test(initiatorData);
        const updated = handler.getTestsResult();
        await showProgress(updated);
        if (updated.fails > updated.maxFails) break;
      }

      const final = handler.getTestsResult();
      if (final.fails > final.maxFails || final.hits < final.maxHits) {
        await out.msg((game as ReadyGame).i18n?.localize?.("beaversProximityAction.tests.failed") ?? "Tests failed.", "warn", initiatorData);
        return;
      }
    }

    await (instance as any).run();
  }
}

function getDefaultOutput(): ActivityOutput {
  return {
    async msg(msg, type = "info") {
      if (type === "error") ui.notifications?.error?.(msg);
      else if (type === "warn") ui.notifications?.warn?.(msg);
      else ui.notifications?.info?.(msg);
    },
    async choose(options, prompt) {
      return new Promise((resolve) => {
        const buttons = Object.fromEntries(Object.entries(options).map(([k, v]) => [
          k,
          { label: v.label, callback: () => resolve(k) },
        ]));
        const d = new Dialog({ title: prompt, content: "", buttons, default: Object.keys(buttons)[0], close: () => resolve(null) });
        d.render(true);
      });
    },
  };
}

export function registerGMExecuteActivitySocketHandler() {
  (game as Game)[NAMESPACE].socket.register(SOCKET_EXECUTE_ACTIVITY, async (payload:ActivityPayload) => {
    if (!(game as ReadyGame).user?.isGM) return { ok: false, error: "Not GM" };
    const { activityId, entityIds, initiatorData } = payload;
    try {
      await executeActivityGM({ activityId, entityIds, initiatorData });
      return { ok: true };
    } catch (e) {
      console.error(`[${NAMESPACE}] executeActivityGM failed`, e);
      return { ok: false, error: String(e?.message ?? e) };
    }
  });
}
export function registerGMScanSocketHandlers() {
  (game as Game)[NAMESPACE].socket.register(SOCKET_SCAN, (initiatorData) => {
    if (!(game as ReadyGame).user?.isGM) return null; // only GMs perform authoritative scans
    const bpa = (game as Game)[NAMESPACE].BeaversProximityApp;
    return bpa.scan(initiatorData);
  });
}