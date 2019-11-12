import { IProvenanceSlide, ProvenanceNode, Handler, SerializedProvenanceSlide } from './api';
import { ProvenanceGraph } from './ProvenanceGraph';
import { SlideAnnotation } from './SlideAnnotation';
export declare class ProvenanceSlide implements IProvenanceSlide {
    private _id;
    private _node;
    private _name;
    private _duration;
    private _transitionTime;
    private _annotations;
    private _mitt;
    private _xPosition;
    private _metadata;
    private _mainAnnotation;
    constructor(name: string, duration: number, transitionTime: number, annotations?: SlideAnnotation[], node?: ProvenanceNode | null);
    mainAnnotation: string;
    readonly id: string;
    node: ProvenanceNode | null;
    readonly nodeId: string | null;
    name: string;
    duration: number;
    transitionTime: number;
    addAnnotation(annotation: SlideAnnotation): void;
    removeAnnotation(annotation: SlideAnnotation): void;
    readonly annotations: SlideAnnotation[];
    on(type: string, handler: Handler): void;
    off(type: string, handler: Handler): void;
    xPosition: number;
    readonly metadata: any;
}
/** The following two functions are used to serialize and deserialize a ProvenanceSlide */
export declare function restoreSlide(serialized: SerializedProvenanceSlide, graph: ProvenanceGraph): ProvenanceSlide;
export declare function serializeSlide(slide: IProvenanceSlide): SerializedProvenanceSlide;
