import { IProvenanceSlidedeck, IProvenanceGraphTraverser, IProvenanceGraph, Application, Handler, IProvenanceSlide, IScreenShotProvider, SerializedSlidedeck } from './api';
import { ProvenanceGraph } from './ProvenanceGraph';
export declare class ProvenanceSlidedeck implements IProvenanceSlidedeck {
    private _application;
    private _graph;
    private _mitt;
    private _slides;
    private _traverser;
    private _selectedSlide;
    private _screenShotProvider;
    private _autoScreenShot;
    private _captainPlaceholder;
    constructor(application: Application, traverser: IProvenanceGraphTraverser);
    readonly application: Application;
    addSlide(slide?: IProvenanceSlide, index?: number): IProvenanceSlide;
    removeSlideAtIndex(index: number): void;
    removeSlide(slide: IProvenanceSlide): void;
    selectedSlide: IProvenanceSlide | null;
    moveSlide(indexFrom: number, indexTo: number): void;
    startTime(slide: IProvenanceSlide): number;
    slideAtTime(time: number): IProvenanceSlide | null;
    readonly slides: IProvenanceSlide[];
    next(): void;
    previous(): void;
    readonly graph: IProvenanceGraph;
    screenShotProvider: IScreenShotProvider | null;
    autoScreenShot: boolean;
    on(type: string, handler: Handler): void;
    off(type: string, handler: Handler): void;
    serializeSelf(): SerializedSlidedeck;
    restoreSelf(serializedSlides: SerializedSlidedeck, traverser: IProvenanceGraphTraverser, graph: ProvenanceGraph, app: Application): IProvenanceSlidedeck;
}
/** The following two functions are used to serialize and deserialize a ProvenanceSlideDeck */
export declare function restoreSlideDeck(serializedSlides: SerializedSlidedeck, traverser: IProvenanceGraphTraverser, graph: ProvenanceGraph, app: Application): IProvenanceSlidedeck;
export declare function serializeSlideDeck(slideDeck: ProvenanceSlidedeck): SerializedSlidedeck;
