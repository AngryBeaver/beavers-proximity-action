import { NAMESPACE } from "../Settings.js";
import { executeActivityGM } from "./ActivityExecution.js";
import { TestHandler } from "./TestHandler.js";
import { TinyProximityUI } from "../app/TinyProximityUI.js";
export const SOCKET_SCAN = "scan";
export const SOCKET_EXECUTE_ACTIVITY = "executeActivity";

export function getDefaultInitiator():InitiatorData{
  const user = (game as ReadyGame).user;
  const initiatorData:InitiatorData = {
    sceneId : canvas?.scene?.id || "",
    userId: user?.id,
    actorId: user?.character?.id || "",
    tokenId: "",
  };
  if(initiatorData.actorId === ""){
    const token = canvas?.tokens?.controlled?.[0];
    initiatorData.tokenId = token?.id || "";
    initiatorData.actorId = token?.actor?.id || "";
  }else{
    initiatorData.tokenId = canvas?.tokens?.ownedTokens.find(t=>t.actor?.id === initiatorData.actorId)?.id || "";
  }
  return initiatorData;
}

export async function runProximityChain(initiatorData: InitiatorData = getDefaultInitiator(), output: ActivityOutput = new TinyProximityUI()) {
  const resp = await requestScanOnGM(initiatorData, output);
  if (!resp) return;
  await chooseAndRunActivity(resp, output);
}

export async function chooseAndRunActivity(resp: ProximityResponse, output: ActivityOutput = getDefaultOutput()) {
  if (!resp?.activities?.length) {
    await output.clear();
    await output.msg("Nothing found nearby.", "info");
    return;
  }

  const options: { [k: string]: { label: string; note?: string } } = {};
  resp.activities.forEach((a, idx) => {
    const key = String(idx);
    const label = `${a.name}`;
    options[key] = { label };
  });
  await output.clear();
  const chosen = await output.choose(options, "Choose an activity");
  if (chosen == null) return;

  const idx = Number(chosen);
  const hit = resp.activities[idx];
  if (!hit) return;

  await executeActivityClient(
    { activityId: hit.activityId, entityIds: hit.entityIds, initiatorData: resp.initiator },
    output
  );
}

export async function executeActivityClient(args: {activityId:string, entityIds:string[], initiatorData:InitiatorData }, output: ActivityOutput) {
  const { activityId, entityIds, initiatorData } = args;
  const bpa = (game as Game)[NAMESPACE].BeaversProximityApp;
  const activityClass = bpa.getActivity(activityId) as ActivityClass;
  if (!activityClass) throw new Error(`Activity not found: ${activityId}`);

  const out = (output ?? getDefaultOutput()) as ActivityOutput;

  async function progressTest(infoHtml: string, current: TestResults): Promise<boolean> {
    const testOut = out as ActivityTestOutput;
    if (testOut.nextTest) return await testOut.nextTest(infoHtml, current, initiatorData);
    await out.clear();
    if(current.success !== 0 && current.fail !== 0) {
      const progress = `(success: ${current.success}/${current.maxHits}, fail: ${current.success}/${current.maxFails})`;
      await out.msg(`${progress}`, "info");
    }
    const chosen = await out.akk(infoHtml);
    return chosen || false;
  }

  async function showProgress(current: TestResults) {
    const testOut = out as ActivityTestOutput;
    if (testOut.progress) return await testOut.progress(current, initiatorData);
    await out.clear();
    return out.msg(`Progress: success ${current.success}/${current.maxHits}, fail ${current.fail}/${current.maxFails}`, "info");
  }

  for (const entityId of entityIds) {
    const instance = new (activityClass as any)(entityId) as ActivityInstance;
    const merged = instance.data;

    let testResults: TestResults = { success: 0, fail: 0, maxHits: 0, maxFails: 0 } as TestResults;
    if (merged.beaversTests) {
      const handler = new TestHandler(merged.beaversTests);
      while (handler.hasAdditionalTests()) {
        const previewHtml = handler.nextTest();
        const current = handler.getTestsResult();
        const proceed = await progressTest(previewHtml, current);
        if (!proceed) {
          await out.clear();
          await out.msg((game as ReadyGame).i18n?.localize?.("beaversProximityAction.tests.cancelled") ?? "Cancelled", "warn");
          return;
        }
        await out.clear();
        await out.msg("waiting for test", "info");
        await handler.test(initiatorData);
        const updated = handler.getTestsResult();
        await showProgress(updated);
        if (updated.fail > 0 && updated.fail >= updated.maxFails) break;
      }
      testResults = handler.getTestsResult();
      if (testResults.fail > 0 && testResults.fail >= testResults.maxFails || testResults.success < testResults.maxHits) {
        await out.clear();
        await out.msg((game as ReadyGame).i18n?.localize?.("beaversProximityAction.tests.failed") ?? "Tests failed.", "warn");
        return;
      }
    }
    void executeActivityonGM({activityId, entityId, testResults, initiatorData},out);
  }
}


function getDefaultOutput(): ActivityOutput {
  return {
    async clear(){
    },
    async akk(label: string){
      return new Promise((resolve) => {
        const buttons = {"x":{label:label, callback:()=>resolve(true)}};
        const d = new Dialog({ title: label, content: "",buttons, default:"x", close: () => resolve(null) });
        d.render(true);
      });
    },
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

export async function requestScanOnGM(initiatorData: InitiatorData = getDefaultInitiator(), output: ActivityOutput = getDefaultOutput()) {
  const socket = (game as Game)[NAMESPACE].socket;
  if (!socket) throw new Error("Socket not ready");
  const resp = (await socket.executeAsGM(SOCKET_SCAN, initiatorData)) as ProximityResponse | null;
  if (!resp) {
    await output.clear();
    await output.msg("No GM available or scan failed", "warn");
    return null;
  }
  return resp;
}

export async function executeActivityonGM(payload: ActivityPayload,output: ActivityOutput = getDefaultOutput()):Promise<string | null>{
  const socket = (game as Game)[NAMESPACE].socket;
  if (!socket) throw new Error("Socket not ready");
  await output.clear();
  const string = (await socket.executeAsGM(SOCKET_EXECUTE_ACTIVITY, payload)) as string | null;
  if (!string) {
    await output.msg("No GM available or scan failed", "warn");
    return null;
  }
  await output.msg(string);
  return string;
}
export function registerGMExecuteActivitySocketHandler() {
  (game as Game)[NAMESPACE].socket.register(SOCKET_EXECUTE_ACTIVITY, async (payload:ActivityPayload) => {
    if (!(game as ReadyGame).user?.isGM) return null;
    const { activityId, entityId, initiatorData, testResults } = payload;
    return await executeActivityGM({ activityId, entityId, initiatorData, testResults });
  });
}
export function registerGMScanSocketHandlers() {
  (game as Game)[NAMESPACE].socket.register(SOCKET_SCAN, (initiatorData) => {
    if (!(game as ReadyGame).user?.isGM) return null; // only GMs perform authoritative scans
    const bpa = (game as Game)[NAMESPACE].BeaversProximityApp;
    return bpa.scan(initiatorData);
  });
}