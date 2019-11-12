import { Handler, ISlideAnnotation, SerializedSlideAnnotation } from './api';
export declare type AnnotationData = any;
export declare class SlideAnnotation implements ISlideAnnotation {
    private readonly _id;
    private _data;
    private _mitt;
    constructor(data: any);
    readonly id: string;
    data: AnnotationData | null;
    on(type: string, handler: Handler): void;
    off(type: string, handler: Handler): void;
}
/** The following two functions are used to serialize and deserialize a SlideAnnotation */
export declare function restoreAnnotation(serialized: SerializedSlideAnnotation): SlideAnnotation;
export declare function serializeAnnotation(annotation: ISlideAnnotation): SerializedSlideAnnotation;
