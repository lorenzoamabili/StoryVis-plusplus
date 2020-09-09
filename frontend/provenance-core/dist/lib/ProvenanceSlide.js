"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeSlide = exports.restoreSlide = exports.ProvenanceSlide = void 0;
var utils_1 = require("./utils");
var SlideAnnotation_1 = require("./SlideAnnotation");
var mitt_1 = require("./mitt");
var ProvenanceSlide = /** @class */ (function () {
    function ProvenanceSlide(name, duration, nodeCreationOrder, transitionTime, annotations, node) {
        if (annotations === void 0) { annotations = []; }
        if (node === void 0) { node = null; }
        this._metadata = {};
        this._id = utils_1.generateUUID();
        this._name = name;
        this._duration = duration;
        this._nodeCreationOrder = nodeCreationOrder;
        this._annotations = annotations;
        this._node = node;
        this._transitionTime = transitionTime;
        this._mitt = mitt_1.default();
        this._xPosition = 0;
        this._mainAnnotation = "";
    }
    Object.defineProperty(ProvenanceSlide.prototype, "mainAnnotation", {
        get: function () {
            return this._mainAnnotation;
        },
        set: function (annotation) {
            this._mainAnnotation = annotation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlide.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlide.prototype, "node", {
        get: function () {
            return this._node;
        },
        set: function (value) {
            this._node = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlide.prototype, "nodeId", {
        get: function () {
            if (this._node != null) {
                return this._node.id;
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlide.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlide.prototype, "nodeCreationOrder", {
        get: function () {
            return this._nodeCreationOrder;
        },
        set: function (value) {
            this._nodeCreationOrder = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlide.prototype, "duration", {
        get: function () {
            return this._duration;
        },
        set: function (value) {
            this._duration = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlide.prototype, "transitionTime", {
        get: function () {
            return this._transitionTime;
        },
        set: function (value) {
            this._transitionTime = value;
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceSlide.prototype.addAnnotation = function (annotation) {
        this._annotations.push(annotation);
        this._mitt.emit('addAnnotation', annotation);
    };
    ProvenanceSlide.prototype.removeAnnotation = function (annotation) {
        var index = this._annotations.indexOf(annotation);
        this._annotations.splice(index, 1);
        this._mitt.emit('removeAnnotation', annotation);
    };
    Object.defineProperty(ProvenanceSlide.prototype, "annotations", {
        get: function () {
            return this._annotations;
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceSlide.prototype.on = function (type, handler) {
        this._mitt.on(type, handler);
    };
    ProvenanceSlide.prototype.off = function (type, handler) {
        this._mitt.off(type, handler);
    };
    Object.defineProperty(ProvenanceSlide.prototype, "xPosition", {
        get: function () {
            return this._xPosition;
        },
        set: function (value) {
            this._xPosition = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlide.prototype, "metadata", {
        get: function () {
            return this._metadata;
        },
        enumerable: false,
        configurable: true
    });
    return ProvenanceSlide;
}());
exports.ProvenanceSlide = ProvenanceSlide;
/** The following two functions are used to serialize and deserialize a ProvenanceSlide */
function restoreSlide(serialized, graph) {
    var annotations = [];
    serialized.annotations.forEach(function (annotation) {
        annotations.push(SlideAnnotation_1.restoreAnnotation(annotation));
    });
    var slide = new ProvenanceSlide(serialized.name, serialized.duration, serialized.nodeCreationOrder, serialized.transitionTime, annotations);
    if (serialized.node != null) {
        var node = graph.nodes[serialized.node];
        slide.node = node;
    }
    return slide;
}
exports.restoreSlide = restoreSlide;
function serializeSlide(slide) {
    var annotations = [];
    slide.annotations.forEach(function (annotation) {
        annotations.push(SlideAnnotation_1.serializeAnnotation(annotation));
    });
    var nodeId;
    if (slide.node != null) {
        nodeId = slide.node.id;
    }
    else {
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
    };
}
exports.serializeSlide = serializeSlide;
//# sourceMappingURL=ProvenanceSlide.js.map