import {NAMESPACE} from "../Settings.js";
import {Action} from "./Action.js";
import {Initiator} from "./Initiator.js";

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
        //TODO fix me one Tile can have multiple configurations
        this.config = TileAction.getConfigs(this.entity).activities[id] || {}
    }

    static getEntity(entityId: string): Tile | undefined{
        return canvas?.["tiles"]?.get(entityId) || undefined;
    }

    static getConfigs(entity: Tile):ActivityConfigs{
        return getProperty(entity.document || {}, `flags.${NAMESPACE}`) || {activities: {}};
    }
}