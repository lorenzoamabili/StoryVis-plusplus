"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationDisplayContainer = void 0;
const annotation_display_1 = require("./annotation-display");
class AnnotationDisplayContainer {
    constructor() {
        this._annotationDisplayMap = new Map();
        this._rootElement = document.createElement("div");
        this._rootElement.id = "annotation-container";
        document.body.appendChild(this._rootElement);
    }
    add(annotation, editMode = false) {
        if (!this._annotationDisplayMap.has(annotation)) {
            const annotationDisplay = new annotation_display_1.AnnotationDisplay(annotation, {
                editable: editMode,
                container: this._rootElement
            });
            this._annotationDisplayMap.set(annotation, annotationDisplay);
        }
    }
    remove(annotation) {
        const annotationDisplay = this._annotationDisplayMap.get(annotation);
        if (annotationDisplay) {
            this._annotationDisplayMap.delete(annotation);
            annotationDisplay.remove();
        }
    }
    clear() {
        this._annotationDisplayMap.forEach(annotationDisplay => annotationDisplay.remove());
        this._annotationDisplayMap.clear();
    }
    loadForSlide(slide) {
        this.clear();
        slide.annotations.forEach(annotation => {
            if (annotation.data &&
                annotation.data.value &&
                annotation.data.x &&
                annotation.data.y) {
                this.add(annotation);
            }
        });
    }
}
exports.AnnotationDisplayContainer = AnnotationDisplayContainer;
//# sourceMappingURL=annotation-display-container.js.map