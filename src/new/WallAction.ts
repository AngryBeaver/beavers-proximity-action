import {NAMESPACE} from "../Settings.js";
import {Action} from "./Action.js";
import {Initiator} from "./Initiator.js";

export abstract class WallAction extends Action{

    entity: Wall | undefined;
    initiator: Initiator;
    configs: EntityConfig[]

    protected constructor(entityId: string, initiator: Initiator){
        super();
        this.initiator = initiator;
        if(initiator.sceneId !== canvas?.scene?.id){
            console.warn(`${NAMESPACE} | "initiator is not on the same scene`);
        }
        this.entity = WallAction.getEntity(entityId);
        if(!this.entity) {
            throw new Error(`${NAMESPACE} | "Entity ${entityId} not found on scene`);
        }
        // @ts-ignore
        const id = this.constructor.template.id;
        this.configs = Object.values(WallAction.getConfigs(this.entity).activities).filter(a=>a.activityId === id);
    }

    static getEntity(entityId: string): Wall | undefined{
        return canvas?.walls?.get(entityId) || undefined;
    }

    static getConfigs(entity: Wall):EntityConfigs{
        return getProperty(entity || {}, `flags.${NAMESPACE}`) || {};
    }
}