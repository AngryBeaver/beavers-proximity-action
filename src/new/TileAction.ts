import {NAMESPACE} from "../Settings.js";
import {Action} from "./Action.js";
import {Initiator} from "./Initiator.js";

export abstract class TileAction extends Action{

    entity: Tile | undefined;
    initiator: Initiator;
    configs: EntityConfig[]

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
        this.configs = Object.values(TileAction.getConfigs(this.entity).activities).filter(a=>a.activityId === id);
    }

    static getEntity(entityId: string): Tile | undefined{
        return canvas?.["tiles"]?.get(entityId) || undefined;
    }

    static getConfigs(entity: Tile):EntityConfigs{
        return getProperty(entity.document || {}, `flags.${NAMESPACE}`) || {activities: {}};
    }
}