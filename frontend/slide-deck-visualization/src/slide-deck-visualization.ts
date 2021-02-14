import * as d3 from "d3";

import "./style.css";

import {
    IProvenanceSlide,
    IProvenanceSlidedeck,
    ProvenanceNode,
    ProvenanceSlide,
    StateNode
} from "@visualstorytelling/provenance-core";


function firstArgThis(f: (...args: any[]) => any) {
    return function (this: any, ...args: any[]) {
        return f(this, ...args);
    };
}

var nodeCreationOrders: number[] = [];
var slideCreationOrder = 0;

type IndexedSlide = { slide: IProvenanceSlide; startTime: number };

export class SlideDeckVisualization {
    private _slideDeck: IProvenanceSlidedeck;
    private _root: d3.Selection<HTMLDivElement, undefined, null, undefined>;
    private _slideTable: d3.Selection<SVGElement, undefined, null, undefined>;
    private _tableHeight = 100;
    private _tableWidth = 1800;
    private _minimumSlideDuration = 100;
    private _barWidthTimeMultiplier = 0.02;
    private _barPadding = 5;
    private _resizebarwidth = 5;
    private _previousSlideX = 0;
    private _lineX1 = 50;
    private _placeholderWidth = 60;
    private _placeholderX = 0;
    private _placeholderHeight = 60;
    private _toolbarX = 10;
    private _toolbarY = 35;
    private _toolbarPadding = 20;
    private _shiftedPosition = 0;
    private calculatedWidth = 0;
    // Upon dragging a slide, no matter where you click on it, the beginning of the slide jumps to the mouse position.
    // This next variable is calculated to adjust for that error, it is a workaround but it works
    private _draggedSlideReAdjustmentFactor = 0;

    private _originPosition = 55;
    private _currentTime = 0;
    private _currentlyPlaying = false;
    private _timelineShift = 0;
    private _timeIndexedSlides: IndexedSlide[] = [];
    // private _currentlyPlayingSlide: IProvenanceSlide | null = null;
    private _gridTimeStep = 1000;
    private _gridSnap = false;
    private _playingID: any = -1;
    // private _annotationContainer = new AnnotationDisplayContainer();
    public _slidesInDeck: number = 0;

    constructor(slideDeck: IProvenanceSlidedeck, elm: HTMLDivElement) {
        this._tableWidth = this._originPosition + this._placeholderWidth;
        window.addEventListener("resize", this.resizeTable);
        this._slideDeck = slideDeck;
        this._root = d3.select(elm);
        // (window as any).slideDeck = this;


        const playerPlaceholder = this._root
            .append('div')
            .attr('id', 'playerPlaceholder')
            .on("mouseover", () => {
                d3.select('#playerPlaceholder').style("cursor", "pointer");
            });

        playerPlaceholder
            .append('i')
            .attr('class', 'fa fa-backward')
            .on('click', this.onBackward);

        playerPlaceholder
            .append('i')
            .attr('class', 'fa fa-play')
            .attr('id', 'playBtn')
            .on('click', this.onPlay);

        playerPlaceholder
            .append('i')
            .attr('class', 'fa fa-pause')
            .attr('id', 'pauseBtn')
            .attr('style', 'display: none')
            .on('click', this.onPause);

        playerPlaceholder
            .append('i')
            .attr('class', 'fa fa-forward')
            .on('click', this.onForward);


        this._slideTable = this._root
            .append<SVGElement>("svg")
            .attr("class", "slide__table")
            .attr("height", this._tableHeight)
            .attr("width", this._tableWidth);

        this._slideTable
            .append("rect")
            .attr('id', 'seekDragger')
            .attr("class", "seek-dragger")
            .attr("fill", "transparent")
            .attr("x", this._originPosition)
            .attr("y", this._originPosition)
            .attr("height", 12)
            .attr("width", 12)
            .on("mouseover", () => {
                d3.select('#seekDragger').style("cursor", "grab");
            })
            .on("mousedown", () => {
                d3.select('#seekDragger').style("cursor", "grabbing");
            })
            .call(
                (d3.drag() as any)
                    .on("start", firstArgThis(this.seekStarted))
                    .on("drag", firstArgThis(this.seekDragged))
            );

        this._slideTable
            .append("rect")
            .attr("class", "slides_placeholder")
            .attr("x", this._lineX1 + this._barPadding)
            .attr("y", 0)
            .attr("width", this._placeholderWidth)
            .attr("height", this._placeholderHeight);

        this._slideTable
            .append("svg:foreignObject")
            .attr("class", "slide_add")
            .attr("x", this._placeholderX + 18)
            .attr("cursor", "pointer")
            .attr("width", 30)
            .attr("height", 30)
            .append("xhtml:body")
            .on("click", this.onAdd)
            .html('<i class="fa fa-file-text-o"></i>');


        this._slideTable
            .append("circle")
            .attr("class", "currentTime")
            .attr("fill", "red")
            .attr("r", 4)
            .attr("cx", this._originPosition)
            .attr("cy", 65)
            .on("mouseover", () => {
                d3.select('#seekDragger').style("cursor", "grab");
            })
            .on("mousedown", () => {
                d3.select('#seekDragger').style("cursor", "grabbing");
            });

        this._slideTable
            .append("line")
            .attr("class", "vertical-line-seek")
            .attr("x1", this._originPosition)
            .attr("y1", 65)
            .attr("x2", this._originPosition)
            .attr("y2", 0)
            .attr("z-index", 11)
            .attr("stroke", "red")
            .attr("stroke-width", 2);


        d3.select("#slideDeck")
            .append("textarea")
            .attr('id', 'textArea')
            .attr('placeholder', 'Type here to add an annotation')
            .attr("rows", 4);

        d3.select("#slideDeck")
            .append("input")
            .attr('id', 'createStoryFromDerivationNodes')
            .attr("type", "button")
            .attr("value", "  o  ")
            .on("click", this.createStoryFromDerivationNodes);


        d3.select("#slideDeck")
            .append("input")
            .attr("id", "transitionTimeButton")
            .attr("type", "button")
            .attr("value", " =|= ")
            .on("click", () => {
                this.calculatedWidth = this.calculatedWidth + 100;
                d3.selectAll('.slide').each((d: any) => d.transitionTime = this.calculatedWidth);
                this.update();
            });

        d3.select("#slideDeck")
            .append("input")
            .attr('id', 'shrink')
            .attr("type", "button")
            .attr("value", "  -  ")
            .on("click", this.stretch);


        d3.select("#slideDeck")
            .append("input")
            .attr('id', 'stretch')
            .attr("type", "button")
            .attr("value", "  +  ")
            .on("click", this.shrink);

        d3.select("#slideDeck")
            .append("input")
            .attr('id', 'slideLeft')
            .attr("type", "button")
            .attr("value", "  <  ")
            .on("click", this.slideSliceRight);

        d3.select("#slideDeck")
            .append("input")
            .attr('id', 'slideRight')
            .attr("type", "button")
            .attr("value", "  >  ")
            .on("click", this.slideSliceLeft);

        d3.select("#slideDeck")
            .append("input")
            .attr('id', 'addButton')
            .attr("type", "button")
            .attr("value", "Annotate")
            .on("click", this.addAnnotation);

        slideDeck.on("slideAdded", () => this.update());
        slideDeck.on("slideRemoved", () => this.update());
        slideDeck.on("slidesMoved", () => this.update());
        slideDeck.on("slideSelected", () => this.update());

        this.update();
    }
    public onDelete = (slide?: IProvenanceSlide, node?: ProvenanceNode) => {
        (this._slideDeck.graph.current as StateNode).metadata.bookmarked = false;
        if (slide) {
            this._slideDeck.removeSlide(slide);
        } else if (node) {
            this._slideDeck.slides.filter(slide => slide.node === node);
            this._slideDeck.removeSlide(this._slideDeck.slides[0]);
        }
        this._slidesInDeck -= 1;
    }

    private onSelect = (slide: IProvenanceSlide) => {
        this.selectSlide(slide);
    }

    private selectSlide = (slide: IProvenanceSlide | null) => {
        if (slide === null) {
            return;
        }
        let originalSlideTransitionTime = slide.transitionTime;
        let artificialTransitionTime = 0;

        if (this._currentlyPlaying) {
            artificialTransitionTime =
                slide.transitionTime -
                (this._currentTime - this._slideDeck.startTime(slide));
        } else {
            artificialTransitionTime = 250;
        }

        slide.transitionTime =
            artificialTransitionTime >= 0 ? artificialTransitionTime : 0;
        this._slideDeck.selectedSlide = slide;
        slide.transitionTime = originalSlideTransitionTime;

        this.displayAnnotationText(this._slideDeck.selectedSlide.mainAnnotation);
        this.update();
    }

    public onAdd = (node?: ProvenanceNode) => {
        let slideDeck = this._slideDeck;
        let nodeSlide = node;
        if (node == undefined) {
            nodeSlide = slideDeck.graph.current;
            nodeSlide.metadata.story = true;
        } else {
            nodeSlide = node;
        }
        const slide = new ProvenanceSlide(nodeSlide.label, 5000, 0, 0, [], nodeSlide);
        slide.nodeCreationOrder = nodeSlide.metadata.creationOrder;
        slideDeck.addSlide(slide, slideDeck.slides.length);
        slideCreationOrder = slideCreationOrder + 1;
        nodeSlide.metadata.slideCreationOrder = slideCreationOrder;
        (slideDeck.graph.current as StateNode).metadata.bookmarked = true;
        this.selectSlide(slide);
        this._slidesInDeck += 1;
    }

    private onClone = (slide: IProvenanceSlide) => {
        let slideDeck = this._slideDeck;
        const cloneSlide = new ProvenanceSlide(slide.name, 5000, 0, 0, [], slide.node);
        cloneSlide.mainAnnotation = slide.mainAnnotation;
        slideDeck.addSlide(cloneSlide, slideDeck.selectedSlide ? slideDeck.slides.indexOf(slideDeck.selectedSlide) + 1 : slideDeck.slides.length);
    }

    private moveDragStarted(draggedObject: any) {
        d3.select<any, any>(this).raise().classed("active", true);
    }

    private moveDragged = (that: any, draggedObject: any) => {
        d3.select<any, any>(that).attr("transform", (slide: IProvenanceSlide) => {
            const originalX = this.previousSlidesWidth(slide) - this._timelineShift;
            const draggedX = (d3 as any).event.x;
            const myIndex = this._slideDeck.slides.indexOf(slide);

            if (draggedX < originalX && myIndex > 0) {
                // check upwards
                const previousSlide = this._slideDeck.slides[myIndex - 1];
                let previousSlideCenterY = this.previousSlidesWidth(previousSlide) - this._timelineShift + this.barTotalWidth(previousSlide) / 2;

                if (draggedX < previousSlideCenterY) {
                    this._slideDeck.moveSlide(myIndex, myIndex - 1);
                }
            } else if (draggedX > originalX && myIndex < this._slideDeck.slides.length - 1) {
                // check downwards
                const nextSlide = this._slideDeck.slides[myIndex + 1];
                let nextSlideCenterY = this.previousSlidesWidth(nextSlide) - this._timelineShift + this.barTotalWidth(nextSlide) / 2;

                if (draggedX > nextSlideCenterY) {
                    this._slideDeck.moveSlide(myIndex, myIndex + 1);
                }
            }

            if (this._draggedSlideReAdjustmentFactor === 0) {
                this._draggedSlideReAdjustmentFactor = draggedX - slide.xPosition;
            }
            let slidePosition = (d3 as any).event.x - this._draggedSlideReAdjustmentFactor - this._timelineShift;
            return "translate(" + slidePosition + ", 0)";
        }
        );
    }

    private moveDragended = (that: any, draggedObject: any) => {
        d3.select<any, any>(that)
            .classed("active", false)
            .attr("transform", (slide: IProvenanceSlide) => {
                return (
                    "translate(" +
                    (this.previousSlidesWidth(slide) +
                        50 +
                        this._resizebarwidth -
                        this._timelineShift) +
                    ", 0)"
                );
            });
        this._draggedSlideReAdjustmentFactor = 0;
        if (draggedObject.className === "vertical-line-seek") {
            this._currentTime = draggedObject.x1;
        }
    }

    private transitionTimeDragged = (slide: IProvenanceSlide) => {
        let transitionTime =
            Math.max((d3 as any).event.x, 0) / this._barWidthTimeMultiplier;
        slide.transitionTime = this.getSnappedTime(slide, transitionTime, 0);
        this.update();
    }

    private transitionTimeSubject = (slide: IProvenanceSlide) => {
        return { x: this.barTransitionTimeWidth(slide) };
    }

    private durationDragged = (that: any, slide: IProvenanceSlide) => {
        let duration = Math.max(
            Math.max((d3 as any).event.x, 0) / this._barWidthTimeMultiplier,
            this._minimumSlideDuration
        );
        slide.duration = this.getSnappedTime(slide, duration, 1);
        this.update();
    }

    private durationSubject = (that: any, slide: IProvenanceSlide) => {
        return { x: this.barDurationWidth(slide) };
    }

    private getSnappedTime = (
        slide: IProvenanceSlide,
        time: number,
        isDuration: number
    ) => {
        if (this._gridSnap) {
            let currentTime =
                this._slideDeck.startTime(slide) +
                slide.transitionTime * isDuration +
                time;
            let remainder = currentTime % this._gridTimeStep;
            if (remainder > this._gridTimeStep / 2) {
                return time + this._gridTimeStep - remainder;
            } else {
                return time - remainder;
            }
        }
        return time;
    }

    private barTransitionTimeWidth(slide: IProvenanceSlide) {
        this.calculatedWidth =
            this._barWidthTimeMultiplier * slide.transitionTime;
        return Math.max(this.calculatedWidth, 0);
    }

    private barDurationWidth(slide: IProvenanceSlide) {
        let calculatedWidth = this._barWidthTimeMultiplier * slide.duration;
        return Math.max(
            calculatedWidth,
            this._minimumSlideDuration * this._barWidthTimeMultiplier
        );
    }

    private barTotalWidth(slide: IProvenanceSlide) {
        let calculatedWidth =
            this.barTransitionTimeWidth(slide) + this.barDurationWidth(slide);
        return calculatedWidth;
    }

    private previousSlidesWidth(slide: IProvenanceSlide) {
        let myIndex = this._slideDeck.slides.indexOf(slide);
        let calculatedWidth = 0;

        for (let i = 0; i < myIndex; i++) {
            calculatedWidth += this.barTotalWidth(this._slideDeck.slides[i]);
        }

        return calculatedWidth;
    }

    private updateTimeIndices(slideDeck: IProvenanceSlidedeck) {
        this._timeIndexedSlides = [];
        let timeIndex = 0;
        slideDeck.slides.forEach((slide: any) => {
            this._timeIndexedSlides.push({
                slide: slide,
                startTime: timeIndex
            });
            timeIndex += slide.transitionTime + slide.duration;
        });
    }

    private rescaleTimeline = () => {
        let wheelDirectionY = (d3 as any).event.deltaY < 0 ? "up" : "down";
        let wheelDirectionX = (d3 as any).event.deltaX < 0 ? "up" : "down";
        if ((d3 as any).event.shiftKey) {
            if (wheelDirectionX === "down") {
                this.shrink();
            } else {
                this.stretch();
            }
            this.update();
        } else {
            if (wheelDirectionY === "down") {
                this.slideSliceLeft();
            } else {
                this.slideSliceRight();
            }
        }
    }

    private shrink = () => {
        let correctedShiftAmount = (d3 as any).event.x - (this._originPosition - this._timelineShift);
        let scalingFactor = 0.2;
        if (this._placeholderX > this._tableWidth / 5) {
            this._barWidthTimeMultiplier *= 1 - scalingFactor;
            this._timelineShift -= correctedShiftAmount * scalingFactor;
        }
        this.update();
    }

    private stretch = () => {
        let correctedShiftAmount = (d3 as any).event.x - (this._originPosition - this._timelineShift);
        let scalingFactor = 0.2;
        this._barWidthTimeMultiplier < 0.1 ? this._barWidthTimeMultiplier *= 1 + scalingFactor : this._barWidthTimeMultiplier;
        if (!(this._placeholderX - this._timelineShift < (d3 as any).event.x)) {
            this._timelineShift < this._placeholderX ? this._timelineShift += correctedShiftAmount * scalingFactor : this._timelineShift;
        }
        this.update();
    }

    private slideSliceRight = () => {
        let shiftAmount = 75;
        this._timelineShift -= shiftAmount;
        this.update();
    }

    private slideSliceLeft = () => {
        let shiftAmount = 75;
        this._timelineShift < this._placeholderX ? this._timelineShift += shiftAmount : this._timelineShift;
        this.update();
    }

    private onBackward = () => {
        if (!this._currentlyPlaying) {
            for (let i = this._timeIndexedSlides.length - 1; i >= 0; i--) {
                if (this._currentTime > this._timeIndexedSlides[i].startTime) {
                    this._currentTime = this._timeIndexedSlides[i].startTime;
                    this.selectSlide(this._slideDeck.slideAtTime(this._currentTime));
                    this.update();
                    break;
                }
            }
        }
    }

    private onForward = () => {
        if (!this._currentlyPlaying) {
            for (let timedSlide of this._timeIndexedSlides) {
                if (this._currentTime < timedSlide.startTime) {
                    this._currentTime = timedSlide.startTime;
                    this.selectSlide(this._slideDeck.slideAtTime(this._currentTime));
                    this.update();
                    break;
                }
            }
        }
    }

    private playTimeline() {
        let intervalStepMS = 25;
        this._playingID = setInterval(() => {
            if (!this._currentlyPlaying) {
                clearInterval(this._playingID);
            } else {
                this._currentTime += intervalStepMS;
                let currentSlide = this._slideDeck.slideAtTime(this._currentTime);
                if (currentSlide !== this._slideDeck.selectedSlide) {
                    this.selectSlide(currentSlide);
                }
            }
            this.update();
        }, intervalStepMS);
    }

    private onPlay = () => {
        if (!this._currentlyPlaying && this._slidesInDeck !== 0) {
            this.startPlaying();
        }
    }

    private onPause = () => {
        if (this._currentlyPlaying) {
            d3.select('#pauseBtn').attr('style', 'display: none');
            d3.select('#playBtn').attr('style', 'display: block');
            this.stopPlaying();
        }
    }

    private startPlaying = () => {
        if (this._shiftedPosition !== this._placeholderX + this._originPosition) {
            d3.select('#pauseBtn').attr('style', 'display: block');
            d3.select('#playBtn').attr('style', 'display: none');
            this._currentlyPlaying = true;
            this.playTimeline();
        }
    }

    private stopPlaying = () => {
        this._currentlyPlaying = false;
        clearInterval(this._playingID);
        this._playingID = -1;
    }


    private seekStarted = (that: any) => {
        if (this._currentlyPlaying) {
            this.stopPlaying();
        }
        this._currentTime = ((d3 as any).event.x - this._originPosition + this._timelineShift) / this._barWidthTimeMultiplier;
        this.update();
    }

    private seekDragged = (that: any) => {
        d3.select('#pauseBtn').attr('style', 'display: none');
        d3.select('#playBtn').attr('style', 'display: block');
        this.stopPlaying();
        this._currentTime = ((d3 as any).event.x + this._timelineShift - this._originPosition) / this._barWidthTimeMultiplier;
        this.update();
    }

    private resizeTable() {
        this._tableWidth = this._tableWidth / 2;
        d3.select(".slide__table").attr("width", this._tableWidth);
    }

    /**
     * Displays the annotation text on the screen. The annotaion text is displayed in lines, each of them with a predetermined max width
     * @param annotation: The annotation text
     */
    private displayAnnotationText = (annotation: string) => {
        d3.selectAll("text.annotation").remove();

        let textArea = document.getElementById("textArea") as HTMLTextAreaElement;
        textArea.value = "";
        textArea.value = annotation;

        this.update();
    }

    /**
     * Add a new annotation to the currently selected slide, and then display it.
     */
    private addAnnotation = () => {
        if (this._slideDeck.selectedSlide === null) {
            alert("There is no slide currently selected!");
            return;
        }
        let textArea = document.getElementById("textArea") as HTMLTextAreaElement;
        let newAnnotation = textArea.value;
        if (newAnnotation !== null) {
            this._slideDeck.selectedSlide.mainAnnotation = newAnnotation;
        }
        else {
            this._slideDeck.selectedSlide.mainAnnotation = "";
        }
        this.displayAnnotationText(this._slideDeck.selectedSlide.mainAnnotation);
    }



    private fixDrawingPriorities = () => {
        this._slideTable.select("rect.seek-dragger").attr("width", this._placeholderX).raise();
    }

    private drawSeekBar = () => {
        const timeWidth = this._currentTime * this._barWidthTimeMultiplier;

        if (timeWidth >= this._placeholderX) {
            this.stopPlaying();
            this._currentTime = this._placeholderX / this._barWidthTimeMultiplier;
        }

        if (this._currentTime < 0) {
            this._currentTime = 0;
        }

        this._shiftedPosition = this._originPosition + timeWidth - this._timelineShift;
        this._shiftedPosition = this._shiftedPosition < this._originPosition ? this._originPosition : this._shiftedPosition;
        this._shiftedPosition = this._shiftedPosition > this._placeholderX + this._originPosition ? this._placeholderX + this._originPosition : this._shiftedPosition;
        this._currentlyPlaying = this._shiftedPosition === this._placeholderX + this._originPosition ? false : this._currentlyPlaying;

        this._slideTable
            .select("circle.currentTime")
            .attr("id", "currentTimeCircle")
            .attr("cx", this._shiftedPosition + 3)
            .raise();
        this._slideTable
            .select("line.vertical-line-seek")
            .attr("x1", this._shiftedPosition + 3)
            .attr("y1", 65)
            .attr("x2", this._shiftedPosition + 3)
            .attr("y2", 0)
            .raise();
    }// to do: display time on seek bar

    private adjustSlideAddObjectPosition = () => {
        this._slideTable
            .select("foreignObject.slide_add")
            .attr("x", this._placeholderX + 105 - this._timelineShift)
            .attr("y", 15);
    }

    public update() {
        this.updateTimeIndices(this._slideDeck);

        if (this._timelineShift < 0) {
            this._timelineShift = 0;
        }
        const allExistingNodes = this._slideTable
            .selectAll<SVGGElement, IProvenanceSlide>("g.slide")
            .data(this._slideDeck.slides, (d: any) => d.id);

        const newNodes = allExistingNodes
            .enter()
            .append("g")
            .attr("class", "slide");

        newNodes
            .on("click", this.onSelect)
            .call((d3.drag() as any)
                .clickDistance([2, 2])
                // .on("start", this.moveDragStarted)
                .on("drag", firstArgThis(this.moveDragged))
                .on("end", firstArgThis(this.moveDragended))
            );


        newNodes
            .append("rect")
            .attr("class", "slides_rect")
            .attr("height", 60) /* removed width = this._barWidth - 2 * this._barPadding */
            .attr("cursor", "move");

        newNodes
            .append("rect")
            .attr("class", "slides_transitionTime_rect")
            .attr("x", this._resizebarwidth)
            .attr("y", 0)
            .attr("height", 60);

        newNodes
            .append("svg")
            .attr("class", "text-viewport")
            .attr("height", 60)
            .append("text") // appended previous slides_text
            .attr("class", "slides_text")
            .attr("y", this._resizebarwidth + 2 * this._barPadding)
            .attr("font-size", 13)
            .attr("dy", ".35em");


        newNodes
            .append("svg:foreignObject")
            .attr("class", "slides_delete_icon")
            .attr("cursor", "pointer")
            .attr("width", 15)
            .attr("height", 15)
            .append("xhtml:body")
            .on("click", (d: any) => this.onDelete(d))
            .html('<i class="fa fa-trash-o"></i>');

        newNodes
            .append("svg:foreignObject")
            .attr("class", "slides_clone_icon")
            .attr("cursor", "pointer")
            .attr("width", 15)
            .attr("height", 15)
            .append("xhtml:body")
            .on("click", this.onClone)
            .html('<i class="fa fa-copy"></i>');


        const textPosition = this._resizebarwidth + 4 * this._barPadding + 68;

        newNodes
            .append("text") // removed slides_delaytext
            .attr("class", "slides_transitionTimetext")
            .attr("y", textPosition)
            .attr("font-size", 16)
            .attr("dy", "-.65em");


        const placeholder = this._slideTable.select("rect.slides_placeholder");

        newNodes
            .append("text")
            .attr("class", "slides_durationtext")
            .attr("y", textPosition)
            .attr("font-size", 16)
            .attr("dy", "-.65em");


        newNodes
            .append("rect")
            .attr("class", "slides_duration_resize")
            .attr("x", 0)
            .attr("width", this._resizebarwidth)
            .attr("height", 60)
            .attr("cursor", "col-resize")
            .call((d3.drag() as any)
                .subject(firstArgThis(this.durationSubject))
                .on("drag", firstArgThis(this.durationDragged))
            );

        newNodes
            .append("rect")
            .attr("class", "slides_transitionTime_resize")
            .attr("y", 0)
            .attr("width", this._resizebarwidth)
            .attr("height", 60)
            .attr("cursor", "ew-resize")
            .call((d3.drag() as any)
                .subject(firstArgThis(this.transitionTimeSubject))
                .on("drag", firstArgThis(this.transitionTimeDragged))
            );

        d3.select(".slide__table").on("wheel", this.rescaleTimeline);


        // Update all nodes

        const allNodes = newNodes
            .merge(allExistingNodes as any)
            .attr("transform", (slide: IProvenanceSlide) => {
                this._previousSlideX = this.previousSlidesWidth(slide);
                slide.xPosition = 50 + this._resizebarwidth + this.previousSlidesWidth(slide);
                slide.mainAnnotation = slide.mainAnnotation;
                return ("translate(" + (slide.xPosition - this._timelineShift) + ", 0 )");
            });

        allNodes
            .select("rect.slides_transitionTime_resize")
            .attr("x", (slide: IProvenanceSlide) => {
                return (this.barTransitionTimeWidth(slide) + this._resizebarwidth);
            });

        allNodes
            .select("rect.slides_rect")
            .attr("fill", (slide: IProvenanceSlide, i: any) => {
                const color = "linen";
                if (slide.node) {
                    slide.node.metadata.bgColor = color;
                }
                return color;
            })
            .attr("selected", (slide: IProvenanceSlide) => {
                return this._slideDeck.selectedSlide === slide;
            })
            .attr("x", (slide: IProvenanceSlide) => {
                return this.barTransitionTimeWidth(slide) + 5;
            })
            .attr("width", (slide: IProvenanceSlide) => {
                this._placeholderX = this._previousSlideX + this.barDurationWidth(slide) + this.barTransitionTimeWidth(slide);
                return this.barDurationWidth(slide) - 3;
            });

        allNodes
            .select("rect.slides_transitionTime_rect")
            .attr("width", (slide: IProvenanceSlide) => {
                return this.barTransitionTimeWidth(slide);
            });

        allNodes
            .select("svg.text-viewport")
            .attr("x", (slide: IProvenanceSlide) => {
                return this.barTransitionTimeWidth(slide) + 5;
            })
            .attr("width", (slide: IProvenanceSlide) => {
                return this.barDurationWidth(slide) - 5;
            });

        // toolbar = allNodes.select("g.slide_toolbar");

        allNodes
            .select("foreignObject.slides_delete_icon")
            .attr("y", (slide: IProvenanceSlide) => {
                return this._toolbarY;
            })
            .attr("x", (slide: IProvenanceSlide) => {
                return this._toolbarX + this.barTransitionTimeWidth(slide) + 2;
            });

        allNodes
            .select("foreignObject.slides_clone_icon")
            .attr("y", (slide: IProvenanceSlide) => {
                return this._toolbarY;
            })
            .attr("x", (slide: IProvenanceSlide) => {
                return this._toolbarX + this._toolbarPadding + this.barTransitionTimeWidth(slide) + 2;
            });

        allNodes
            .select("text.slides_text")
            .attr("x", (slide: IProvenanceSlide) => {
                return this._barPadding * 2 - 2;
            })
            .text((slide: IProvenanceSlide) => {
                return slide.name;
            });

        allNodes
            .select("text.slides_transitionTimetext")
            .attr("x", (slide: IProvenanceSlide) => {
                return (this.barTransitionTimeWidth(slide) + this._barPadding * 2);
            })
            .text((slide: IProvenanceSlide) => {
                if (this.barTransitionTimeWidth(slide) > 35 || this._slideDeck.startTime(slide) === 0) {
                    return ((this._slideDeck.startTime(slide) + slide.transitionTime) / 1000).toFixed(2);
                } else {
                    return "";
                }
            });

        allNodes.select("circle.time").attr("cx", (slide: IProvenanceSlide) => {
            return this.barTotalWidth(slide) + this._resizebarwidth;
        });

        allNodes
            .select("circle.transitionTime_time")
            .attr("cx", (slide: IProvenanceSlide) => {
                return (this.barTransitionTimeWidth(slide) + this._resizebarwidth);
            });

        allNodes
            .select("rect.slides_duration_resize")
            .attr("x", (slide: IProvenanceSlide) => {
                return this.barTotalWidth(slide) - 2;
            });

        allNodes
            .select("text.slides_durationtext")
            .attr("x", (slide: IProvenanceSlide) => {
                return this.barTotalWidth(slide) + this._barPadding + 10;
            })
            .text((slide: IProvenanceSlide) => {
                const totalTime = (this._slideDeck.startTime(slide) + slide.duration + slide.transitionTime) / 1000;
                return (totalTime).toFixed(2);
            });

        placeholder.attr("x", this._placeholderX + 80 - this._timelineShift);

        this._tableWidth = this._originPosition + this._barPadding + this._placeholderX + 100;
        d3.select(".slide__table").attr("width", this._tableWidth);


        this.adjustSlideAddObjectPosition();

        this.drawSeekBar();

        this.fixDrawingPriorities();

        allExistingNodes.exit().remove();

        if (!this._currentlyPlaying) {
            d3.select('#pauseBtn').attr('style', 'display: none');
            d3.select('#playBtn').attr('style', 'display: block');
            this.stopPlaying();
        }
    }

    public createStoryFromDerivationNodes() {
        let nodes = (window as any).prov.graph.getNodes();
        var arrayNodes: any[] = [];

        for (const nodeId of Object.keys(nodes)) {
            let node = nodes[nodeId];
            arrayNodes.push(node);
        }
        arrayNodes.shift();

        for (const node of (arrayNodes as any).filter((node: any) => node.action.metadata.userIntent === ('derivation' || 'annotation'))) {
            node.metadata.story = true;
            (window as any).slideDeck.onAdd(node);
        }
        (window as any).tree._viz.update();
    }

    public setDeck(deck: IProvenanceSlidedeck) {
        this._slideDeck = deck;
    }

    public getDeck(): IProvenanceSlidedeck {
        return this._slideDeck;
    }
}