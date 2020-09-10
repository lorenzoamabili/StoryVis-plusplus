import "./easymde.css";
import "./style.css";
import { SlideAnnotation } from "@visualstorytelling/provenance-core";
export interface Options {
    initialValue: string;
    editable: boolean;
    container: HTMLElement;
}
export declare const defaultOptions: {
    initialValue: string;
    editable: boolean;
    container: HTMLElement;
};
export declare type PositionedString = {
    x: number;
    y: number;
    value: string;
};
export declare class AnnotationDisplay {
    private _rootElement;
    private _options;
    private _mde;
    private _annotation;
    private _editable;
    setPosition(): void;
    constructor(annotation: SlideAnnotation, options?: Partial<Options>);
    remove(): void;
    editable: boolean;
    readonly rootElement: HTMLElement;
}
