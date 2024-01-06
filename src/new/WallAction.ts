import {NAMESPACE} from "../Settings.js";
import {Action} from "./Action.js";

export abstract class WallAction extends Action{

    entity: Wall | undefined;
    initiator: Initiator;
    config: any

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
        this.config = WallAction.getConfig(this.entity)[id] || {}
    }

    static getEntity(entityId: string): Wall | undefined{
        return canvas?.walls?.get(entityId) || undefined;
    }

    static getConfig(entity: Wall){
        return getProperty(entity || {}, `flags.${NAMESPACE}`) || {};
    }
}