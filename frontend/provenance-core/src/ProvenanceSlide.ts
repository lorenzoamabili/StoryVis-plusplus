import { IProvenanceSlide, ProvenanceNode, Handler, SerializedProvenanceSlide, SerializedSlideAnnotation} from './api';
import {ProvenanceGraph} from './ProvenanceGraph';
import { generateUUID } from './utils';
import { SlideAnnotation, serializeAnnotation, restoreAnnotation} from './SlideAnnotation';
import mitt from './mitt';

export class ProvenanceSlide implements IProvenanceSlide {
  private _id: string;
  private _node: ProvenanceNode | null;
  private _name: string;
  private _nodeCreationOrder: number;
  private _duration: number;
  private _transitionTime: number;
  private _annotations: SlideAnnotation[];
  private _mitt: any;
  private _xPosition: number;
  private _metadata: any = {};
  private _mainAnnotation: string;

  constructor(
    name: string,
    duration: number,
    nodeCreationOrder: number,
    transitionTime: number,
    annotations: SlideAnnotation[] = [],
    node: ProvenanceNode | null = null
  ) {
    this._id = generateUUID();
    this._name = name;
    this._duration = duration;
    this._nodeCreationOrder = nodeCreationOrder;
    this._annotations = annotations;
    this._node = node;
    this._transitionTime = transitionTime;
    this._mitt = mitt();
    this._xPosition = 0;
    this._mainAnnotation = "";
  }


  public get mainAnnotation(): string {
      return this._mainAnnotation;
    }
  
    public set mainAnnotation(annotation: string){
      this._mainAnnotation = annotation;
    }

  public get id(): string {
    return this._id;
  }

  public get node(): ProvenanceNode | null {
    return this._node;
  }

  public get nodeId(): string | null{
    if(this._node != null){
      return this._node.id;
    }
    return null;
  }

  public set node(value: ProvenanceNode | null) {
    this._node = value;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get nodeCreationOrder(): number {
    return this._nodeCreationOrder;
  }

  public set nodeCreationOrder(value: number) {
    this._nodeCreationOrder = value;
  }

  public get duration(): number {
    return this._duration;
  }

  public set duration(value: number) {
    this._duration = value;
  }

  public get transitionTime(): number {
    return this._transitionTime;
  }

  public set transitionTime(value: number) {
    this._transitionTime = value;
  }

  public addAnnotation(annotation: SlideAnnotation) {
    this._annotations.push(annotation);
    this._mitt.emit('addAnnotation', annotation);
  }

  public removeAnnotation(annotation: SlideAnnotation) {
    const index = this._annotations.indexOf(annotation);
    this._annotations.splice(index, 1);
    this._mitt.emit('removeAnnotation', annotation);
  }

  public get annotations() {
    return this._annotations;
  }

  public on(type: string, handler: Handler) {
    this._mitt.on(type, handler);
  }

  public off(type: string, handler: Handler) {
    this._mitt.off(type, handler);
  }

  public get xPosition(): number {
    return this._xPosition;
  }

  public set xPosition(value: number) {
    this._xPosition = value;
  }
  public get metadata() {
    return this._metadata;
  }
  
}
/** The following two functions are used to serialize and deserialize a ProvenanceSlide */

export function restoreSlide(serialized: SerializedProvenanceSlide, graph: ProvenanceGraph) : ProvenanceSlide{
  let annotations: SlideAnnotation[] = [];
  serialized.annotations.forEach(annotation => {
    annotations.push(restoreAnnotation(annotation));
  });
  let slide = new ProvenanceSlide(serialized.name, serialized.duration, serialized.nodeCreationOrder, serialized.transitionTime, annotations);
  if(serialized.node != null){
    const node = graph.nodes[serialized.node];
    slide.node = node;
  }
  return slide;
}

export function serializeSlide(slide: IProvenanceSlide) : SerializedProvenanceSlide{
  let annotations: SerializedSlideAnnotation[] = [];
  slide.annotations.forEach(annotation => {
    annotations.push(serializeAnnotation(annotation));
  });
  let nodeId: string | null;
  if(slide.node != null){
    nodeId = slide.node.id;
  } else {
    nodeId = null;
  }
  return {
    node: nodeId,
    name: slide.name, 
    nodeCreationOrder: slide.nodeCreationOrder,
    transitionTime: slide.transitionTime,
    duration: slide.duration,
    annotations: annotations,
    mainAnnotation: ""
  }
}