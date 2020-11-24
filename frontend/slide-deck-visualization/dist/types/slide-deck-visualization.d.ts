import "./style.css";
import { IProvenanceSlide, IProvenanceSlidedeck } from "@visualstorytelling/provenance-core";
export declare class SlideDeckVisualization {
    private _slideDeck;
    private _root;
    private _slideTable;
    private _tableHeight;
    private _tableWidth;
    private _minimumSlideDuration;
    private _barWidthTimeMultiplier;
    private _barPadding;
    private _resizebarwidth;
    private _previousSlideX;
    private _lineX1;
    private _placeholderWidth;
    private _placeholderX;
    private _placeholderHeight;
    private _toolbarX;
    private _toolbarY;
    private _toolbarPadding;
    private _draggedSlideReAdjustmentFactor;
    private _originPosition;
    private _currentTime;
    private _currentlyPlaying;
    private _timelineShift;
    private _timeIndexedSlides;
    private _gridTimeStep;
    private _gridSnap;
    private _playingID;
    _slidesInDeck: number;
    constructor(slideDeck: IProvenanceSlidedeck, elm: HTMLDivElement);
    onDelete: (slide: IProvenanceSlide) => void;
    private onSelect;
    private selectSlide;
    onAdd: (node?: import("@visualstorytelling/provenance-core").RootNode | import("@visualstorytelling/provenance-core").StateNode | undefined) => void;
    private onClone;
    private moveDragStarted;
    private moveDragged;
    private moveDragended;
    private transitionTimeDragged;
    private transitionTimeSubject;
    private durationDragged;
    private durationSubject;
    private getSnappedTime;
    private barTransitionTimeWidth;
    private barDurationWidth;
    private barTotalWidth;
    private previousSlidesWidth;
    private updateTimeIndices;
    private rescaleTimeline;
    private onBackward;
    private onForward;
    private playTimeline;
    private onPlay;
    private onPause;
    private startPlaying;
    private stopPlaying;
    private seekStarted;
    private seekDragged;
    private resizeTable;
    /**
     * Displays the annotation text on the screen. The annotaion text is displayed in lines, each of them with a predetermined max width
     * @param annotation: The annotation text
     */
    private displayAnnotationText;
    /**
     * Add a new annotation to the currently selected slide, and then display it.
     */
    private addAnnotation;
    private fixDrawingPriorities;
    private drawSeekBar;
    private adjustSlideAddObjectPosition;
    update(): void;
    setDeck(deck: IProvenanceSlidedeck): void;
    getDeck(): IProvenanceSlidedeck;
}
