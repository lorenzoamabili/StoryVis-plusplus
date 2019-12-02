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
    get mainAnnotation(): string;
    set mainAnnotation(annotation: string);
    get id(): string;
    get node(): ProvenanceNode | null;
    get nodeId(): string | null;
    set node(value: ProvenanceNode | null);
    get name(): string;
    set name(value: string);
    get duration(): number;
    set duration(value: number);
    get transitionTime(): number;
    set transitionTime(value: number);
    addAnnotation(annotation: SlideAnnotation): void;
    removeAnnotation(annotation: SlideAnnotation): void;
    get annotations(): SlideAnnotation[];
    on(type: string, handler: Handler): void;
    off(type: string, handler: Handler): void;
    get xPosition(): number;
    set xPosition(value: number);
    get metadata(): any;
}
/** The following two functions are used to serialize and deserialize a ProvenanceSlide */
export declare function restoreSlide(serialized: SerializedProvenanceSlide, graph: ProvenanceGraph): ProvenanceSlide;
export declare function serializeSlide(slide: IProvenanceSlide): SerializedProvenanceSlide;
