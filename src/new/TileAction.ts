import {NAMESPACE} from "../Settings.js";
import {Action} from "./Action.js";

export abstract class TileAction extends Action{

    entity: Tile | undefined;
    initiator: Initiator;
    config: any

    protected constructor(entityId: string, initiator: Initiator){
        super();
        this.initiator = initiator;
        if(initiator.sceneId !== canvas?.scene?.id){
            console.warn(`${NAMESPACE} | "initiator is not on the same scene`);
        }
        this.entity = TileAction.getEntity(entityId);
        if(!this.entity) {
            throw new Error(`${NAMESPACE} | "Entity ${entityId} not found on scene`);
        }
        // @ts-ignore
        const id = this.constructor.template.id;
        this.config = TileAction.getConfig(this.entity)[id] || {}
    }

    static getEntity(entityId: string): Tile | undefined{
        return canvas?.["tiles"]?.get(entityId) || undefined;
    }

    static getConfig(entity: Tile){
        return getProperty(entity || {}, `flags.${NAMESPACE}`) || {activities: {}};
    }
}