import { SlideAnnotation, IProvenanceSlide } from "@visualstorytelling/provenance-core";
export declare class AnnotationDisplayContainer {
    private _annotationDisplayMap;
    private readonly _rootElement;
    constructor();
    add(annotation: SlideAnnotation, editMode?: boolean): void;
    remove(annotation: SlideAnnotation): void;
    clear(): void;
    loadForSlide(slide: IProvenanceSlide): void;
}
