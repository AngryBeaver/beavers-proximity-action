import {NAMESPACE} from "../Settings.js";
import {Action} from "./Action";

export abstract class TileAction extends Action{

    entity: TileDocument | undefined;
    initiator: Initiator;
    config: any

    protected constructor(entityId: string, initiator: Initiator){
        super();
        this.initiator = initiator;
        if(initiator.sceneId !== canvas?.scene?.id){
            console.warn(`${NAMESPACE} | "initiator is not on the same scene`);
        }
        this.entity = canvas?.scene?.tiles.get(entityId) || undefined;
        if(this.entity) {
            this.config = getProperty(this.entity, `flags.${NAMESPACE}`);
        }else{
            throw new Error(`${NAMESPACE} | "Entity ${entityId} not found on scene`);
        }
    }


}