import { select, event, selectAll, drag } from 'd3';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function generateUUID() {
    // Public Domain/MIT
    var d = new Date().getTime();
    /* istanbul ignore if */
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // tslint:disable-next-line:no-bitwise
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        // tslint:disable-next-line:no-bitwise
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}
/**
 * Generate a Unix timestamp in milliseconds
 *
 * @returns {number} in milliseconds
 */
function generateTimestamp() {
    // Removed, because performance.now() returns a floating point number, which is not compatible with the Date.getTime() integer
    // if (
    //   window.performance &&
    //   window.performance.now &&
    //   window.performance.timing &&
    //   window.performance.timing.navigationStart
    // ) {
    //   return window.performance.now();
    // }
    return new Date().getTime();
}
function isStateNode(node) {
    return 'parent' in node;
}

/** Mitt: Tiny (~200b) functional event emitter / pubsub.
 *  @name mitt
 *  @returns {Mitt}
 */
function mitt(all) {
    all = all || Object.create(null);
    return {
        /**
         * Register an event handler for the given type.
         *
         * @param  {String} type	Type of event to listen for
         * @param  {Function} handler Function to call in response to given event
         * @memberOf mitt
         */
        on: function (type, handler) {
            (all[type] || (all[type] = [])).push(handler);
        },
        /**
         * Remove an event handler for the given type.
         *
         * @param  {String} type	Type of event to unregister `handler` from
         * @param  {Function} handler Handler function to remove
         * @memberOf mitt
         */
        off: function (type, handler) {
            if (all[type]) {
                // tslint:disable-next-line:no-bitwise
                all[type].splice(all[type].indexOf(handler) >>> 0, 1);
            }
        },
        /**
         * Invoke all handlers for the given type.
         *
         * @param {String} type  The event type to invoke
         * @param {Any} [evt]  Any value (object is recommended and powerful), passed to each handler
         * @memberOf mitt
         */
        emit: function (type, evt) {
            (all[type] || []).slice().map(function (handler) {
                handler(evt);
            });
        }
    };
}

/**
 * Provenance Graph implementation
 *
 * @param version The version of the software to track the provenance of
 *
 */
var ProvenanceGraph = /** @class */ (function () {
    function ProvenanceGraph(application, userid, node) {
        if (userid === void 0) { userid = 'Unknown'; }
        this._nodes = {};
        this.graphID = 0;
        this.creationOrder = 0;
        this.id = generateUUID();
        this._mitt = mitt();
        this.application = application;
        this.graphID = this.graphID + 1;
        if (node) {
            this.root = node;
        }
        else {
            this.root = {
                id: generateUUID(),
                label: 'Root',
                metadata: {
                    createdBy: userid,
                    createdOn: generateTimestamp(),
                    creationOrder: this.creationOrder,
                    graphID: this.graphID
                },
                children: []
            };
        }
        this.addNode(this.root);
        this._current = this.root;
    }
    ProvenanceGraph.prototype.addNode = function (node) {
        if (this._nodes[node.id]) {
            throw new Error('Node already added');
        }
        this._nodes[node.id] = node;
        this._mitt.emit('nodeAdded', node);
        // if (node.artifacts) {
        //   this.artifacts.concat(node.artifacts);
        // }
    };
    ProvenanceGraph.prototype.getNode = function (id) {
        var result = this._nodes[id];
        if (!result) {
            throw new Error('Node id not found');
        }
        return this._nodes[id];
    };
    Object.defineProperty(ProvenanceGraph.prototype, "current", {
        get: function () {
            return this._current;
        },
        set: function (node) {
            if (!this._nodes[node.id]) {
                throw new Error('Node id not found');
            }
            this._current = node;
            this._mitt.emit('currentChanged', node);
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceGraph.prototype.getNodes = function () {
        return this._nodes;
    };
    ProvenanceGraph.prototype.setNodes = function (nodes) {
        this._nodes = nodes;
    };
    // getArtifacts(){
    // }
    ProvenanceGraph.prototype.emitNodeChangedEvent = function (node) {
        /* istanbul ignore if */
        if (!this._nodes[node.id]) {
            throw new Error('Node id not found');
        }
        this._mitt.emit('nodeChanged', node);
    };
    ProvenanceGraph.prototype.on = function (type, handler) {
        this._mitt.on(type, handler);
    };
    ProvenanceGraph.prototype.off = function (type, handler) {
        this._mitt.off(type, handler);
    };
    ProvenanceGraph.prototype.getSelf = function () {
        return serializeProvenanceGraph(this);
    };
    ProvenanceGraph.prototype.restoreSelf = function (sgraph) {
        return restoreProvenanceGraph(sgraph);
    };
    return ProvenanceGraph;
}());
/* Beware that deeply nested properties in serializedProvenanceGraph are mutated in the process */
function restoreProvenanceGraph(serializedProvenanceGraph) {
    var nodes = {};
    // restore nodes as key value
    for (var _i = 0, _a = serializedProvenanceGraph.nodes; _i < _a.length; _i++) {
        var node = _a[_i];
        nodes[node.id] = __assign({}, node);
        nodes[node.id].label = node.label;
    }
    // restore parent/children relations
    for (var _b = 0, _c = Object.keys(nodes); _b < _c.length; _b++) {
        var nodeId = _c[_b];
        var node = nodes[nodeId];
        node.children = node.children.map(function (id) { return nodes[id]; });
        if ('parent' in node) {
            node.parent = nodes[node.parent];
        }
    }
    var graph = new ProvenanceGraph(serializedProvenanceGraph.application, 'restoredGraphUser', nodes[serializedProvenanceGraph.root]);
    graph._nodes = nodes;
    graph._current = nodes[serializedProvenanceGraph.root];
    return graph;
}
function serializeProvenanceGraph(graph) {
    var nodes = Object.keys(graph.getNodes()).map(function (nodeId) {
        var node = graph.getNode(nodeId);
        node.metadata.loaded = true;
        var serializedNode = __assign({}, node);
        if (isStateNode(node)) {
            serializedNode.parent = node.parent.id;
        }
        serializedNode.children = node.children.map(function (child) { return child.id; });
        return serializedNode;
    });
    return {
        nodes: nodes,
        root: graph.root.id,
        application: graph.application,
        current: graph.current.id
    };
}

var nodeCounter = 0;
var allArtifacts = [];
/**
 * Provenance Graph Tracker implementation
 *
 * @param graph The provenance graph to track (this will serve as storage construct)
 * @param current Optional parameter to set current node for importing a provenance graph that is non-empty
 *
 */
var ProvenanceTracker = /** @class */ (function () {
    function ProvenanceTracker(registry, graph, username) {
        if (username === void 0) { username = 'Unknown'; }
        /**
         * When acceptActions is false, the Tracker will ignore calls to applyAction
         */
        this.acceptActions = true;
        this.previousNode = null;
        this._screenShotProvider = null;
        this._autoScreenShot = false;
        this.registry = registry;
        this.graph = graph;
        this.username = username;
    }
    /**
     * Calls the action.do function with action.doArguments. This will also create a new StateNode
     * in the graph corresponding to the action taken. Optionally, the label set in action.metadata.label
     * will be taken as the label for this node.
     *
     * @param action
     * @param skipFirstDoFunctionCall If set to true, the do-function will not be called this time,
     *        it will only be called when traversing.
     */
    ProvenanceTracker.prototype.applyAction = function (action, skipFirstDoFunctionCall, artifacts, option, newRoot) {
        if (skipFirstDoFunctionCall === void 0) { skipFirstDoFunctionCall = false; }
        return __awaiter(this, void 0, void 0, function () {
            var label, createNewStateNode, newNode, currentNode, parentNode, functionNameToExecute, funcWithThis, actionResult;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.acceptActions) {
                            return [2 /*return*/, Promise.resolve(this.graph.current)];
                        }
                        label = '';
                        if (action.metadata && action.metadata.label) {
                            label = action.metadata.label;
                        }
                        else {
                            label = action.do;
                        }
                        if (artifacts) {
                            artifacts.length === 1 ? allArtifacts.push(artifacts) : allArtifacts.push.apply(allArtifacts, artifacts);
                        }
                        createNewStateNode = function (parentNode, actionResult) { return ({
                            id: generateUUID(),
                            label: label,
                            artifacts: artifacts ? allArtifacts : [],
                            metadata: {
                                option: option ? option : '',
                                mainbranch: false,
                                noLink: false,
                                loaded: false,
                                bookmarked: false,
                                filtered: false,
                                createdBy: _this.username,
                                createdOn: generateTimestamp(),
                                creationOrder: 0,
                                graphID: parentNode.metadata.graphID
                            },
                            action: action,
                            actionResult: actionResult,
                            parent: parentNode,
                            children: []
                        }); };
                        currentNode = this.graph.current;
                        parentNode = (option === 'split') ? this.graph.root : this.graph.current;
                        parentNode = newRoot ? newRoot : parentNode;
                        this.previousNode = this.previousNode !== null ? this.previousNode : currentNode;
                        if (!skipFirstDoFunctionCall) return [3 /*break*/, 1];
                        newNode = createNewStateNode(parentNode, null);
                        nodeCounter = this.previousNode.metadata.graphID === newNode.metadata.graphID ? nodeCounter : nodeCounter + 1;
                        newNode.metadata.creationOrder = this.previousNode.metadata.graphID === newNode.metadata.graphID ? this.previousNode.metadata.creationOrder + 1 : nodeCounter;
                        return [3 /*break*/, 3];
                    case 1:
                        functionNameToExecute = action.do;
                        funcWithThis = this.registry.getFunctionByName(functionNameToExecute);
                        return [4 /*yield*/, funcWithThis.func.apply(funcWithThis.thisArg, action.doArguments.args)];
                    case 2:
                        actionResult = _a.sent();
                        newNode = createNewStateNode(parentNode, actionResult);
                        nodeCounter = this.previousNode.metadata.graphID === newNode.metadata.graphID ? nodeCounter : nodeCounter + 1;
                        newNode.metadata.creationOrder = this.previousNode.metadata.graphID === newNode.metadata.graphID ? this.previousNode.metadata.creationOrder + 1 : nodeCounter;
                        _a.label = 3;
                    case 3:
                        this.previousNode = newNode;
                        if (this.autoScreenShot && this.screenShotProvider) {
                            try {
                                newNode.metadata.screenShot = this.screenShotProvider();
                            }
                            catch (e) {
                                console.warn('Error while getting screenshot', e);
                            }
                        }
                        // When the node is created, we need to update the graph.
                        if (newRoot) {
                            newRoot.children.push(newNode);
                        }
                        else {
                            if (option === 'split') {
                                this.graph.root.children.push(newNode);
                            }
                            else {
                                currentNode.children.push(newNode);
                            }
                        }
                        this.graph.addNode(newNode);
                        this.graph.current = newNode;
                        return [2 /*return*/, newNode];
                }
            });
        });
    };
    Object.defineProperty(ProvenanceTracker.prototype, "screenShotProvider", {
        get: function () {
            return this._screenShotProvider;
        },
        set: function (provider) {
            this._screenShotProvider = provider;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceTracker.prototype, "autoScreenShot", {
        get: function () {
            return this._autoScreenShot;
        },
        set: function (value) {
            this._autoScreenShot = value;
            if (value && !this._screenShotProvider) {
                console.warn('Setting autoScreenShot to true, but no screenShotProvider is set');
            }
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceTracker.prototype.getGraph = function () {
        return this.graph.getSelf();
    };
    ProvenanceTracker.prototype.restoreGraph = function (sgraph) {
        Object.setPrototypeOf(sgraph, serializeProvenanceGraph.prototype);
        alert(JSON.stringify(sgraph));
        this.graph = this.graph.restoreSelf(sgraph);
    };
    return ProvenanceTracker;
}());
var IrreversibleError = /** @class */ (function (_super) {
    __extends(IrreversibleError, _super);
    function IrreversibleError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.invalidTraversal = true;
        return _this;
    }
    return IrreversibleError;
}(Error));

var SlideAnnotation = /** @class */ (function () {
    function SlideAnnotation(data) {
        this._id = generateUUID();
        this._data = data;
        this._mitt = mitt();
    }
    Object.defineProperty(SlideAnnotation.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SlideAnnotation.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (value) {
            this._data = value;
            this._mitt.emit('change', value);
        },
        enumerable: false,
        configurable: true
    });
    SlideAnnotation.prototype.on = function (type, handler) {
        this._mitt.on(type, handler);
    };
    SlideAnnotation.prototype.off = function (type, handler) {
        this._mitt.off(type, handler);
    };
    return SlideAnnotation;
}());
/** The following two functions are used to serialize and deserialize a SlideAnnotation */
function restoreAnnotation(serialized) {
    var annotation = new SlideAnnotation(serialized.data);
    return annotation;
}
function serializeAnnotation(annotation) {
    return {
        data: annotation.data
    };
}

var ProvenanceSlide = /** @class */ (function () {
    function ProvenanceSlide(name, duration, nodeCreationOrder, transitionTime, annotations, node) {
        if (annotations === void 0) { annotations = []; }
        if (node === void 0) { node = null; }
        this._metadata = {};
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
/** The following two functions are used to serialize and deserialize a ProvenanceSlide */
function restoreSlide(serialized, graph) {
    var annotations = [];
    serialized.annotations.forEach(function (annotation) {
        annotations.push(restoreAnnotation(annotation));
    });
    var slide = new ProvenanceSlide(serialized.name, serialized.duration, serialized.nodeCreationOrder, serialized.transitionTime, annotations);
    if (serialized.node != null) {
        var node = graph.getNodes()[serialized.node];
        slide.node = node;
    }
    return slide;
}
function serializeSlide(slide) {
    var annotations = [];
    slide.annotations.forEach(function (annotation) {
        annotations.push(serializeAnnotation(annotation));
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
        mainAnnotation: slide.mainAnnotation
    };
}

var ProvenanceSlidedeck = /** @class */ (function () {
    function ProvenanceSlidedeck(application, traverser) {
        this._slides = [];
        this._screenShotProvider = null;
        this._autoScreenShot = false;
        this._captainPlaceholder = new ProvenanceSlide('Captain Placeholder', 0, 0, 0);
        this._mitt = mitt();
        this._application = application;
        this._graph = traverser.graph;
        this._traverser = traverser;
        this._selectedSlide = null;
    }
    Object.defineProperty(ProvenanceSlidedeck.prototype, "application", {
        get: function () {
            return this._application;
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceSlidedeck.prototype.addSlide = function (slide, index) {
        if (!index ||
            isNaN(index) ||
            !Number.isInteger(index) ||
            index > this._slides.length ||
            index < 0) {
            index = this._slides.length;
        }
        if (slide && this._slides.indexOf(slide) >= 0) {
            throw new Error('Cannot add a slide that is already in the deck');
        }
        if (!slide) {
            var node = this._graph.current;
            slide = new ProvenanceSlide(node.label, 1, 0, 0, [], node);
        }
        if (this.autoScreenShot && this.screenShotProvider) {
            try {
                slide.metadata.screenShot = this.screenShotProvider();
            }
            catch (e) {
                console.warn('Error while getting screenshot', e);
            }
        }
        if (this._slides.length === 0) {
            this._selectedSlide = slide;
        }
        this._slides.splice(index, 0, slide);
        this._mitt.emit('slideAdded', slide);
        return slide;
    };
    ProvenanceSlidedeck.prototype.removeSlideAtIndex = function (index) {
        var deletedSlides = this._slides.splice(index, 1);
        // This can only be 1 slide now, therefore this is ok.
        if (this._selectedSlide === deletedSlides[0]) {
            this.selectedSlide = null;
        }
        this._mitt.emit('slideRemoved', deletedSlides[0]);
    };
    ProvenanceSlidedeck.prototype.removeSlide = function (slide) {
        this.removeSlideAtIndex(this._slides.indexOf(slide));
    };
    Object.defineProperty(ProvenanceSlidedeck.prototype, "selectedSlide", {
        get: function () {
            return this._selectedSlide;
        },
        set: function (slide) {
            if (slide && slide.node) {
                this._traverser.toStateNode(slide.node.id, slide.transitionTime);
            }
            this._selectedSlide = slide;
            this._mitt.emit('slideSelected', slide);
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceSlidedeck.prototype.moveSlide = function (indexFrom, indexTo) {
        if (indexTo < 0 || indexTo > this.slides.length - 1) {
            throw new Error('target index out of bounds');
        }
        if (indexTo >= this._slides.length) {
            var k = indexTo - this._slides.length + 1;
            while (k--) {
                this._slides.push(this._captainPlaceholder);
            }
        }
        this._slides.splice(indexTo, 0, this._slides.splice(indexFrom, 1)[0]);
        this._mitt.emit('slidesMoved', this._slides);
    };
    ProvenanceSlidedeck.prototype.startTime = function (slide) {
        var index = this._slides.indexOf(slide);
        var previousTime = 0;
        for (var i = 0; i < index; i++) {
            previousTime += this._slides[i].transitionTime;
            previousTime += this._slides[i].duration;
        }
        return previousTime;
    };
    ProvenanceSlidedeck.prototype.slideAtTime = function (time) {
        var index = 0;
        var currentSlide = null;
        while (time >= 0 && index < this.slides.length) {
            currentSlide = this.slides[index];
            var nextSlideOffset = currentSlide.duration + currentSlide.transitionTime;
            if (time - nextSlideOffset < 0) {
                break;
            }
            time -= nextSlideOffset;
            index++;
        }
        return currentSlide;
    };
    Object.defineProperty(ProvenanceSlidedeck.prototype, "slides", {
        get: function () {
            return this._slides;
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceSlidedeck.prototype.next = function () {
        if (this._selectedSlide !== null) {
            var currentIndex = this._slides.indexOf(this._selectedSlide);
            if (currentIndex < this._slides.length - 1) {
                currentIndex += 1;
                this.selectedSlide = this._slides[currentIndex];
            }
            else {
                this.selectedSlide = this._slides[0];
            }
        }
    };
    ProvenanceSlidedeck.prototype.previous = function () {
        if (this._selectedSlide !== null) {
            var currentIndex = this._slides.indexOf(this._selectedSlide);
            if (currentIndex > 0) {
                currentIndex -= 1;
                this.selectedSlide = this._slides[currentIndex];
            }
            else {
                this.selectedSlide = this._slides[this._slides.length - 1];
            }
        }
    };
    Object.defineProperty(ProvenanceSlidedeck.prototype, "graph", {
        get: function () {
            return this._graph;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlidedeck.prototype, "screenShotProvider", {
        get: function () {
            return this._screenShotProvider;
        },
        set: function (provider) {
            this._screenShotProvider = provider;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlidedeck.prototype, "autoScreenShot", {
        get: function () {
            return this._autoScreenShot;
        },
        set: function (value) {
            this._autoScreenShot = value;
            if (value && !this._screenShotProvider) {
                console.warn('Setting autoScreenShot to true, but no screenShotProvider is set');
            }
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceSlidedeck.prototype.on = function (type, handler) {
        this._mitt.on(type, handler);
    };
    ProvenanceSlidedeck.prototype.off = function (type, handler) {
        this._mitt.off(type, handler);
    };
    ProvenanceSlidedeck.prototype.serializeSelf = function () {
        return serializeSlideDeck(this);
    };
    ProvenanceSlidedeck.prototype.restoreSelf = function (serializedSlides, traverser, graph, app) {
        return restoreSlideDeck(serializedSlides, traverser, graph, app);
    };
    return ProvenanceSlidedeck;
}());
/** The following two functions are used to serialize and deserialize a ProvenanceSlideDeck */
function restoreSlideDeck(serializedSlides, traverser, graph, app) {
    // if(serializedSlides.id != graph.id){
    //   alert("Graph and slide deck mismatch");
    // }
    var deck = new ProvenanceSlidedeck(app, traverser);
    serializedSlides.slides.forEach(function (serializedSlide) {
        deck.addSlide(restoreSlide(serializedSlide, graph));
    });
    deck.selectedSlide = deck.slides[0];
    return deck;
}
function serializeSlideDeck(slideDeck) {
    var slides = [];
    slideDeck.slides.forEach(function (slide) {
        slides.push(serializeSlide(slide));
    });
    return {
        slides: slides,
        id: slideDeck.graph.id,
    };
}

var STATUS;
(function (STATUS) {
    STATUS[STATUS["IDLE"] = 0] = "IDLE";
    STATUS[STATUS["PLAYING"] = 1] = "PLAYING";
})(STATUS || (STATUS = {}));
var wait = function (duration) { return new Promise(function (resolve) { return setTimeout(resolve, duration); }); };
var ProvenanceSlidedeckPlayer = /** @class */ (function () {
    function ProvenanceSlidedeckPlayer(slides, selectCallback) {
        this._selectCallback = selectCallback;
        this._slides = slides;
        this._currentSlideIndex = 0;
        this._status = STATUS.IDLE;
    }
    ProvenanceSlidedeckPlayer.prototype.setSlideIndex = function (slideIndex) {
        this._currentSlideIndex = slideIndex;
    };
    Object.defineProperty(ProvenanceSlidedeckPlayer.prototype, "slides", {
        get: function () {
            return this._slides;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProvenanceSlidedeckPlayer.prototype, "currentSlideIndex", {
        get: function () {
            return this._currentSlideIndex;
        },
        set: function (index) {
            this._currentSlideIndex = index;
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceSlidedeckPlayer.prototype.play = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shouldPlayNext, slide;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldPlayNext = function () {
                            return _this._status === STATUS.PLAYING && _this._currentSlideIndex < _this._slides.length - 1;
                        };
                        if (!(this._status === STATUS.IDLE)) return [3 /*break*/, 4];
                        this._status = STATUS.PLAYING;
                        this._selectCallback(this._slides[this._currentSlideIndex]);
                        _a.label = 1;
                    case 1:
                        slide = this._slides[this._currentSlideIndex];
                        return [4 /*yield*/, wait(slide.duration)];
                    case 2:
                        _a.sent();
                        if (shouldPlayNext()) {
                            this._currentSlideIndex += 1;
                            this._selectCallback(this._slides[this._currentSlideIndex]);
                        }
                        _a.label = 3;
                    case 3:
                        if (shouldPlayNext()) return [3 /*break*/, 1];
                        _a.label = 4;
                    case 4:
                        this._status = STATUS.IDLE;
                        return [2 /*return*/];
                }
            });
        });
    };
    ProvenanceSlidedeckPlayer.prototype.next = function () {
        this._currentSlideIndex += 1;
        this._selectCallback(this._slides[this._currentSlideIndex]);
    };
    Object.defineProperty(ProvenanceSlidedeckPlayer.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: false,
        configurable: true
    });
    ProvenanceSlidedeckPlayer.prototype.stop = function () {
        this._status = STATUS.IDLE;
    };
    return ProvenanceSlidedeckPlayer;
}());

function firstArgThis(f) {
    return function (...args) {
        return f(this, ...args);
    };
}
var slideCreationOrder = 0;
class SlideDeckVisualization {
    constructor(slideDeck, elm) {
        this._tableHeight = 100;
        this._tableWidth = 1800;
        this._minimumSlideDuration = 100;
        this._barWidthTimeMultiplier = 0.02;
        this._barPadding = 5;
        this._resizebarwidth = 5;
        this._previousSlideX = 0;
        this._lineX1 = 50;
        this._placeholderWidth = 60;
        this._placeholderX = 0;
        this._placeholderHeight = 60;
        this._toolbarX = 10;
        this._toolbarY = 35;
        this._toolbarPadding = 20;
        this._shiftedPosition = 0;
        this.calculatedWidth = 0;
        // Upon dragging a slide, no matter where you click on it, the beginning of the slide jumps to the mouse position.
        // This next variable is calculated to adjust for that error, it is a workaround but it works
        this._draggedSlideReAdjustmentFactor = 0;
        this._originPosition = 55;
        this._currentTime = 0;
        this._currentlyPlaying = false;
        this._timelineShift = 0;
        this._timeIndexedSlides = [];
        // private _currentlyPlayingSlide: IProvenanceSlide | null = null;
        this._gridTimeStep = 1000;
        this._gridSnap = false;
        this._playingID = -1;
        // private _annotationContainer = new AnnotationDisplayContainer();
        this._slidesInDeck = 0;
        this.onDelete = (slide, node) => {
            this._slideDeck.graph.current.metadata.bookmarked = false;
            window.tree._viz.update();
            if (slide) {
                this._slideDeck.removeSlide(slide);
            }
            else if (node) {
                this._slideDeck.slides.filter(slide => slide.node === node);
                this._slideDeck.removeSlide(this._slideDeck.slides[0]);
            }
            this._slidesInDeck -= 1;
        };
        this.onSelect = (slide) => {
            this.selectSlide(slide);
        };
        this.selectSlide = (slide) => {
            if (slide === null) {
                return;
            }
            let originalSlideTransitionTime = slide.transitionTime;
            let artificialTransitionTime = 0;
            if (this._currentlyPlaying) {
                artificialTransitionTime =
                    slide.transitionTime -
                        (this._currentTime - this._slideDeck.startTime(slide));
            }
            else {
                artificialTransitionTime = 250;
            }
            slide.transitionTime = artificialTransitionTime >= 0 ? artificialTransitionTime : 0;
            this._slideDeck.selectedSlide = slide;
            slide.transitionTime = originalSlideTransitionTime;
            window.prov.graph.current = slide.node;
            window.tree._viz.update();
            this.displayAnnotationText(this._slideDeck.selectedSlide.mainAnnotation);
            this.update();
        };
        this.onAdd = (node) => {
            let slideDeck = this._slideDeck;
            let nodeSlide = node ? node : slideDeck.graph.current;
            const slide = new ProvenanceSlide(nodeSlide.label, 5000, 0, 0, [], nodeSlide);
            slide.nodeCreationOrder = nodeSlide.metadata.creationOrder;
            slideDeck.addSlide(slide, slideDeck.slides.length);
            slideCreationOrder = slideCreationOrder + 1;
            nodeSlide.metadata.slideCreationOrder = slideCreationOrder;
            slideDeck.graph.current.metadata.bookmarked = true;
            window.tree._viz.update();
            this.selectSlide(slide);
            this._slidesInDeck += 1;
        };
        this.onClone = (slide) => {
            let slideDeck = this._slideDeck;
            const cloneSlide = new ProvenanceSlide(slide.name, 5000, 0, 0, [], slide.node);
            cloneSlide.mainAnnotation = slide.mainAnnotation;
            slideDeck.addSlide(cloneSlide, slideDeck.selectedSlide ? slideDeck.slides.indexOf(slideDeck.selectedSlide) + 1 : slideDeck.slides.length);
        };
        this.moveDragged = (that, draggedObject) => {
            select(that).attr("transform", (slide) => {
                const originalX = this.previousSlidesWidth(slide) - this._timelineShift;
                const draggedX = event.x;
                const myIndex = this._slideDeck.slides.indexOf(slide);
                if (draggedX < originalX && myIndex > 0) {
                    // check upwards
                    const previousSlide = this._slideDeck.slides[myIndex - 1];
                    let previousSlideCenterY = this.previousSlidesWidth(previousSlide) - this._timelineShift + this.barTotalWidth(previousSlide) / 2;
                    if (draggedX < previousSlideCenterY) {
                        this._slideDeck.moveSlide(myIndex, myIndex - 1);
                    }
                }
                else if (draggedX > originalX && myIndex < this._slideDeck.slides.length - 1) {
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
                let slidePosition = event.x - this._draggedSlideReAdjustmentFactor - this._timelineShift;
                return "translate(" + slidePosition + ", 0)";
            });
        };
        this.moveDragended = (that, draggedObject) => {
            select(that)
                .classed("active", false)
                .attr("transform", (slide) => {
                return ("translate(" +
                    (this.previousSlidesWidth(slide) +
                        50 +
                        this._resizebarwidth -
                        this._timelineShift) +
                    ", 0)");
            });
            this._draggedSlideReAdjustmentFactor = 0;
            if (draggedObject.className === "vertical-line-seek") {
                this._currentTime = draggedObject.x1;
            }
        };
        this.transitionTimeDragged = (slide) => {
            let transitionTime = Math.max(event.x, 0) / this._barWidthTimeMultiplier;
            slide.transitionTime = this.getSnappedTime(slide, transitionTime, 0);
            this.update();
        };
        this.transitionTimeSubject = (slide) => {
            return { x: this.barTransitionTimeWidth(slide) };
        };
        this.durationDragged = (that, slide) => {
            let duration = Math.max(Math.max(event.x, 0) / this._barWidthTimeMultiplier, this._minimumSlideDuration);
            slide.duration = this.getSnappedTime(slide, duration, 1);
            this.update();
        };
        this.durationSubject = (that, slide) => {
            return { x: this.barDurationWidth(slide) };
        };
        this.getSnappedTime = (slide, time, isDuration) => {
            if (this._gridSnap) {
                let currentTime = this._slideDeck.startTime(slide) +
                    slide.transitionTime * isDuration +
                    time;
                let remainder = currentTime % this._gridTimeStep;
                if (remainder > this._gridTimeStep / 2) {
                    return time + this._gridTimeStep - remainder;
                }
                else {
                    return time - remainder;
                }
            }
            return time;
        };
        this.rescaleTimeline = () => {
            let wheelDirectionY = event.deltaY < 0 ? "up" : "down";
            let wheelDirectionX = event.deltaX < 0 ? "up" : "down";
            if (event.shiftKey) {
                if (wheelDirectionX === "down") {
                    this.shrink();
                }
                else {
                    this.stretch();
                }
                this.update();
            }
            else {
                if (wheelDirectionY === "down") {
                    this.slideSliceLeft();
                }
                else {
                    this.slideSliceRight();
                }
            }
        };
        this.shrink = () => {
            this.getDeck().slides.forEach((slide) => {
                slide.duration = slide.duration - 250;
            });
            this.update();
        };
        this.stretch = () => {
            this.getDeck().slides.forEach((slide) => {
                slide.duration = slide.duration + 250;
            });
            this.update();
        };
        this.slideSliceRight = () => {
            let shiftAmount = 75;
            this._timelineShift -= shiftAmount;
            this.update();
        };
        this.slideSliceLeft = () => {
            let shiftAmount = 75;
            this._timelineShift < this._placeholderX ? this._timelineShift += shiftAmount : this._timelineShift;
            this.update();
        };
        this.onBackward = () => {
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
        };
        this.onForward = () => {
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
        };
        this.onPlay = () => {
            if (!this._currentlyPlaying && this._slidesInDeck !== 0) {
                this.startPlaying();
            }
        };
        this.onPause = () => {
            if (this._currentlyPlaying) {
                select('#pauseBtn').attr('style', 'display: none');
                select('#playBtn').attr('style', 'display: block');
                this.stopPlaying();
            }
        };
        this.startPlaying = () => {
            if (this._shiftedPosition !== this._placeholderX + this._originPosition) {
                select('#pauseBtn').attr('style', 'display: block');
                select('#playBtn').attr('style', 'display: none');
                this._currentlyPlaying = true;
                this.playTimeline();
            }
        };
        this.stopPlaying = () => {
            this._currentlyPlaying = false;
            clearInterval(this._playingID);
            this._playingID = -1;
        };
        this.seekStarted = (that) => {
            if (this._currentlyPlaying) {
                this.stopPlaying();
            }
            this._currentTime = (event.x - this._originPosition + this._timelineShift) / this._barWidthTimeMultiplier;
            this.update();
        };
        this.seekDragged = (that) => {
            select('#pauseBtn').attr('style', 'display: none');
            select('#playBtn').attr('style', 'display: block');
            this.stopPlaying();
            this._currentTime = (event.x + this._timelineShift - this._originPosition) / this._barWidthTimeMultiplier;
            this.update();
        };
        /**
         * Displays the annotation text on the screen. The annotaion text is displayed in lines, each of them with a predetermined max width
         * @param annotation: The annotation text
         */
        this.displayAnnotationText = (annotation) => {
            selectAll("text.annotation").remove();
            let textArea = document.getElementById("textArea");
            textArea.value = "";
            textArea.value = annotation;
            this.update();
        };
        /**
         * Add a new annotation to the currently selected slide, and then display it.
         */
        this.addAnnotation = () => {
            if (this._slideDeck.selectedSlide === null) {
                alert("There is no slide currently selected!");
                return;
            }
            let textArea = document.getElementById("textArea");
            let newAnnotation = textArea.value;
            if (newAnnotation !== null) {
                this._slideDeck.selectedSlide.mainAnnotation = newAnnotation;
            }
            else {
                this._slideDeck.selectedSlide.mainAnnotation = "";
            }
            this.displayAnnotationText(this._slideDeck.selectedSlide.mainAnnotation);
        };
        this.fixDrawingPriorities = () => {
            this._slideTable.select("rect.seek-dragger").attr("width", this._placeholderX).raise();
        };
        this.drawSeekBar = () => {
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
        }; // to do: display time on seek bar
        this.adjustSlideAddObjectPosition = () => {
            this._slideTable
                .select("foreignObject.slide_add")
                .attr("x", this._placeholderX + 105 - this._timelineShift)
                .attr("y", 15);
        };
        this._tableWidth = this._originPosition + this._placeholderWidth;
        window.addEventListener("resize", this.resizeTable);
        this._slideDeck = slideDeck;
        this._root = select(elm);
        // (window as any).slideDeck = this;
        const playerPlaceholder = this._root
            .append('div')
            .attr('id', 'playerPlaceholder')
            .on("mouseover", () => {
            select('#playerPlaceholder').style("cursor", "pointer");
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
            .append("svg")
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
            select('#seekDragger').style("cursor", "grab");
        })
            .on("mousedown", () => {
            select('#seekDragger').style("cursor", "grabbing");
        })
            .call(drag()
            .on("start", firstArgThis(this.seekStarted))
            .on("drag", firstArgThis(this.seekDragged)));
        // this._slideTable
        //     .append("rect")
        //     .attr('id', 'addSlide')
        //     .attr("class", "slides_placeholder")
        //     .attr("cursor", "pointer")
        //     .attr("x", this._lineX1 + this._barPadding)
        //     .attr("y", 0)
        //     .attr("width", this._placeholderWidth)
        //     .attr("height", this._placeholderHeight)
        //     .on("click", this.onAdd);
        // this._slideTable
        //     .append("svg:foreignObject")
        //     .attr("cursor", "pointer")
        //     .attr("class", "slide_add")
        //     .attr("x", this._placeholderX + 18)
        //     .attr("width", 30)
        //     .attr("height", 30)
        //     .append("xhtml:body")
        //     .html('<i class="fa fa-file-text-o"></i>')
        //     .on("click", this.onAdd);
        this._slideTable
            .append("circle")
            .attr("class", "currentTime")
            .attr("fill", "red")
            .attr("r", 4)
            .attr("cx", this._originPosition)
            .attr("cy", 65)
            .on("mouseover", () => {
            select('#seekDragger').style("cursor", "grab");
        })
            .on("mousedown", () => {
            select('#seekDragger').style("cursor", "grabbing");
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
        select("#slideDeck")
            .append("textarea")
            .attr('id', 'textArea')
            .attr('placeholder', 'Type here to add an annotation')
            .attr("rows", 4);
        select("#slideDeck")
            .append("text")
            .attr('id', 'addSlide')
            .attr("type", "button")
            .attr("class", "button")
            .append("tspan")
            .attr("class", "fa")
            .text("\uf0fe")
            .on("click", this.onAdd);
        var tooltip = select("#addSlide")
            .append("div")
            .style("position", "absolute")
            .style("left", "25px")
            .style("top", "-10px")
            .style("width", "max-content")
            .style("font-size", "14px")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("background", "white")
            .style("z-index", 11)
            .style("visibility", "hidden")
            .text("Add slide");
        select("#addSlide")
            .on("mouseover", function () { return tooltip.style("visibility", "visible"); })
            .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });
        select("#slideDeck")
            .append("text")
            .attr('id', 'createStoryFromDerivationNodes')
            .attr("type", "button")
            .attr("class", "button")
            .append("tspan")
            .attr("class", "fa")
            .text("\uf0d0")
            .on("click", this.createStoryFromDerivationNodes);
        var tooltip1 = select("#createStoryFromDerivationNodes")
            .append("div")
            .style("position", "absolute")
            .style("left", "25px")
            .style("top", "-10px")
            .style("width", "max-content")
            .style("font-size", "14px")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("background", "white")
            .style("z-index", 11)
            .style("visibility", "hidden")
            .text("Automatic story creation");
        select("#createStoryFromDerivationNodes")
            .on("mouseover", function () { return tooltip1.style("visibility", "visible"); })
            .on("mouseout", function () { return tooltip1.style("visibility", "hidden"); });
        select("#slideDeck")
            .append("text")
            .attr("class", "button")
            .attr("type", "button")
            .attr('id', 'transitionTimeButton')
            .append("tspan")
            .attr("class", "fa")
            .text("\uf0c1")
            .on("click", () => {
            selectAll('.slide').each((slide) => slide.transitionTime = slide.transitionTime + 100);
            this.update();
        });
        var tooltip2 = select("#transitionTimeButton")
            .append("div")
            .style("position", "absolute")
            .style("left", "25px")
            .style("top", "-10px")
            .style("width", "max-content")
            .style("font-size", "14px")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("background", "white")
            .style("z-index", 11)
            .style("visibility", "hidden")
            .text("Increase transition time");
        select("#transitionTimeButton")
            .on("mouseover", function () { return tooltip2.style("visibility", "visible"); })
            .on("mouseout", function () { return tooltip2.style("visibility", "hidden"); });
        select("#slideDeck")
            .append("text")
            .attr('id', 'shrink')
            .attr("class", "button")
            .attr("type", "button")
            .append("tspan")
            .attr("class", "fa")
            .text("\uf104")
            .on("click", this.shrink);
        var tooltip3 = select("#shrink")
            .append("div")
            .style("position", "absolute")
            .style("left", "25px")
            .style("top", "-10px")
            .style("width", "max-content")
            .style("font-size", "14px")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("background", "white")
            .style("z-index", 11)
            .style("visibility", "hidden")
            .text("Decrease duration time");
        select("#shrink")
            .on("mouseover", function () { return tooltip3.style("visibility", "visible"); })
            .on("mouseout", function () { return tooltip3.style("visibility", "hidden"); });
        select("#slideDeck")
            .append("text")
            .attr('id', 'stretch')
            .attr("class", "button")
            .attr("type", "button")
            .append("tspan")
            .attr("class", "fa")
            .text("\uf105")
            .on("click", this.stretch);
        var tooltip4 = select("#stretch")
            .append("div")
            .style("position", "absolute")
            .style("left", "25px")
            .style("top", "-10px")
            .style("width", "max-content")
            .style("font-size", "14px")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("background", "white")
            .style("z-index", 11)
            .style("visibility", "hidden")
            .text("Increase duration time");
        select("#stretch")
            .on("mouseover", function () { return tooltip4.style("visibility", "visible"); })
            .on("mouseout", function () { return tooltip4.style("visibility", "hidden"); });
        select("#slideDeck")
            .append("text")
            .attr('id', 'slideLeft')
            .attr("class", "button")
            .attr("type", "button")
            .append("tspan")
            .attr("class", "fa")
            .text("\uf04a")
            .on("click", this.onBackward);
        var tooltip5 = select("#slideLeft")
            .append("div")
            .style("position", "absolute")
            .style("left", "25px")
            .style("top", "-10px")
            .style("width", "max-content")
            .style("font-size", "14px")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("background", "white")
            .style("z-index", 11)
            .style("visibility", "hidden")
            .text("Backward");
        select("#slideLeft")
            .on("mouseover", function () { return tooltip5.style("visibility", "visible"); })
            .on("mouseout", function () { return tooltip5.style("visibility", "hidden"); });
        select("#slideDeck")
            .append("text")
            .attr('id', 'slideRight')
            .attr("class", "button")
            .attr("type", "button")
            .append("tspan")
            .attr("class", "fa")
            .text("\uf04e")
            .on("click", this.onForward);
        var tooltip6 = select("#slideRight")
            .append("div")
            .style("position", "absolute")
            .style("left", "25px")
            .style("top", "-10px")
            .style("width", "max-content")
            .style("font-size", "14px")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("background", "white")
            .style("z-index", 11)
            .style("visibility", "hidden")
            .text("Forward");
        select("#slideRight")
            .on("mouseover", function () { return tooltip6.style("visibility", "visible"); })
            .on("mouseout", function () { return tooltip6.style("visibility", "hidden"); });
        select("#slideDeck")
            .append("text")
            .attr('id', 'addButton')
            .attr("class", "button")
            .attr("type", "button")
            .append("tspan")
            .attr("class", "fa")
            .text("\uf249")
            .on("click", this.addAnnotation);
        var tooltip7 = select("#addButton")
            .append("div")
            .style("position", "absolute")
            .style("left", "25px")
            .style("top", "-10px")
            .style("width", "max-content")
            .style("font-size", "14px")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("background", "white")
            .style("z-index", 11)
            .style("visibility", "hidden")
            .text("Append annotation");
        select("#addButton")
            .on("mouseover", function () { return tooltip7.style("visibility", "visible"); })
            .on("mouseout", function () { return tooltip7.style("visibility", "hidden"); });
        slideDeck.on("slideAdded", () => this.update());
        slideDeck.on("slideRemoved", () => this.update());
        slideDeck.on("slidesMoved", () => this.update());
        slideDeck.on("slideSelected", () => this.update());
        this.update();
    }
    moveDragStarted(draggedObject) {
        select(this).raise().classed("active", true);
    }
    barTransitionTimeWidth(slide) {
        this.calculatedWidth = this._barWidthTimeMultiplier * slide.transitionTime;
        return Math.max(this.calculatedWidth, 0);
    }
    barDurationWidth(slide) {
        let calculatedWidth = this._barWidthTimeMultiplier * slide.duration;
        return Math.max(calculatedWidth, this._minimumSlideDuration * this._barWidthTimeMultiplier);
    }
    barTotalWidth(slide) {
        let calculatedWidth = this.barTransitionTimeWidth(slide) + this.barDurationWidth(slide);
        return calculatedWidth;
    }
    previousSlidesWidth(slide) {
        let myIndex = this._slideDeck.slides.indexOf(slide);
        let calculatedWidth = 0;
        for (let i = 0; i < myIndex; i++) {
            calculatedWidth += this.barTotalWidth(this._slideDeck.slides[i]);
        }
        return calculatedWidth;
    }
    updateTimeIndices(slideDeck) {
        this._timeIndexedSlides = [];
        let timeIndex = 0;
        slideDeck.slides.forEach((slide) => {
            this._timeIndexedSlides.push({
                slide: slide,
                startTime: timeIndex
            });
            timeIndex += slide.transitionTime + slide.duration;
        });
    }
    playTimeline() {
        let intervalStepMS = 25;
        this._playingID = setInterval(() => {
            if (!this._currentlyPlaying) {
                clearInterval(this._playingID);
            }
            else {
                this._currentTime += intervalStepMS;
                let currentSlide = this._slideDeck.slideAtTime(this._currentTime);
                if (currentSlide !== this._slideDeck.selectedSlide) {
                    this.selectSlide(currentSlide);
                }
            }
            this.update();
        }, intervalStepMS);
    }
    resizeTable() {
        this._tableWidth = this._tableWidth / 2;
        select(".slide__table").attr("width", this._tableWidth);
    }
    update() {
        this.updateTimeIndices(this._slideDeck);
        if (this._timelineShift < 0) {
            this._timelineShift = 0;
        }
        const allExistingNodes = this._slideTable
            .selectAll("g.slide")
            .data(this._slideDeck.slides, (d) => d.id);
        const newNodes = allExistingNodes
            .enter()
            .append("g")
            .attr("class", "slide");
        newNodes
            .on("click", this.onSelect)
            .call(drag()
            .clickDistance([2, 2])
            // .on("start", this.moveDragStarted)
            .on("drag", firstArgThis(this.moveDragged))
            .on("end", firstArgThis(this.moveDragended)));
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
            .on("click", (d) => this.onDelete(d))
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
            .call(drag()
            .subject(firstArgThis(this.durationSubject))
            .on("drag", firstArgThis(this.durationDragged)));
        newNodes
            .append("rect")
            .attr("class", "slides_transitionTime_resize")
            .attr("y", 0)
            .attr("width", this._resizebarwidth)
            .attr("height", 60)
            .attr("cursor", "ew-resize")
            .call(drag()
            .subject(firstArgThis(this.transitionTimeSubject))
            .on("drag", firstArgThis(this.transitionTimeDragged)));
        select(".slide__table").on("wheel", this.rescaleTimeline);
        // Update all nodes
        const allNodes = newNodes
            .merge(allExistingNodes)
            .attr("transform", (slide) => {
            this._previousSlideX = this.previousSlidesWidth(slide);
            slide.xPosition = 50 + this._resizebarwidth + this.previousSlidesWidth(slide);
            slide.mainAnnotation = slide.mainAnnotation;
            return ("translate(" + (slide.xPosition - this._timelineShift) + ", 0 )");
        });
        allNodes
            .select("rect.slides_transitionTime_resize")
            .attr("x", (slide) => {
            return (this.barTransitionTimeWidth(slide) + this._resizebarwidth);
        });
        allNodes
            .select("rect.slides_rect")
            .attr("fill", (slide, i) => {
            const color = "linen";
            if (slide.node) {
                slide.node.metadata.bgColor = color;
            }
            return color;
        })
            .attr("selected", (slide) => {
            return this._slideDeck.selectedSlide === slide;
        })
            .attr("x", (slide) => {
            return this.barTransitionTimeWidth(slide) + 5;
        })
            .attr("width", (slide) => {
            this._placeholderX = this._previousSlideX + this.barDurationWidth(slide) + this.barTransitionTimeWidth(slide);
            return this.barDurationWidth(slide) - 3;
        });
        allNodes
            .select("rect.slides_transitionTime_rect")
            .attr("width", (slide) => {
            return this.barTransitionTimeWidth(slide);
        });
        allNodes
            .select("svg.text-viewport")
            .attr("x", (slide) => {
            return this.barTransitionTimeWidth(slide) + 5;
        })
            .attr("width", (slide) => {
            return this.barDurationWidth(slide) - 5;
        });
        // toolbar = allNodes.select("g.slide_toolbar");
        allNodes
            .select("foreignObject.slides_delete_icon")
            .attr("y", (slide) => {
            return this._toolbarY;
        })
            .attr("x", (slide) => {
            return this._toolbarX + this.barTransitionTimeWidth(slide) + 2;
        });
        allNodes
            .select("foreignObject.slides_clone_icon")
            .attr("y", (slide) => {
            return this._toolbarY;
        })
            .attr("x", (slide) => {
            return this._toolbarX + this._toolbarPadding + this.barTransitionTimeWidth(slide) + 2;
        });
        allNodes
            .select("text.slides_text")
            .attr("x", (slide) => {
            return this._barPadding * 2 - 2;
        })
            .text((slide) => {
            return slide.name;
        });
        allNodes
            .select("text.slides_transitionTimetext")
            .attr("x", (slide) => {
            return (this.barTransitionTimeWidth(slide) + this._barPadding * 2);
        })
            .text((slide) => {
            if (this.barTransitionTimeWidth(slide) > 35 || this._slideDeck.startTime(slide) === 0) {
                return ((this._slideDeck.startTime(slide) + slide.transitionTime) / 1000).toFixed(2);
            }
            else {
                return "";
            }
        });
        allNodes.select("circle.time").attr("cx", (slide) => {
            return this.barTotalWidth(slide) + this._resizebarwidth;
        });
        allNodes
            .select("circle.transitionTime_time")
            .attr("cx", (slide) => {
            return (this.barTransitionTimeWidth(slide) + this._resizebarwidth);
        });
        allNodes
            .select("rect.slides_duration_resize")
            .attr("x", (slide) => {
            return this.barTotalWidth(slide) - 2;
        });
        allNodes
            .select("text.slides_durationtext")
            .attr("x", (slide) => {
            return this.barTotalWidth(slide) + this._barPadding + 10;
        })
            .text((slide) => {
            const totalTime = (this._slideDeck.startTime(slide) + slide.duration + slide.transitionTime) / 1000;
            return (totalTime).toFixed(2);
        });
        placeholder.attr("x", this._placeholderX + 80 - this._timelineShift);
        this._tableWidth = this._originPosition + this._barPadding + this._placeholderX + 100;
        select(".slide__table").attr("width", this._tableWidth);
        this.adjustSlideAddObjectPosition();
        this.drawSeekBar();
        this.fixDrawingPriorities();
        allExistingNodes.exit().remove();
        if (!this._currentlyPlaying) {
            select('#pauseBtn').attr('style', 'display: none');
            select('#playBtn').attr('style', 'display: block');
            this.stopPlaying();
        }
    }
    createStoryFromDerivationNodes() {
        let nodes = window.prov.graph.getNodes();
        var arrayNodes = [];
        for (const nodeId of Object.keys(nodes)) {
            let node = nodes[nodeId];
            arrayNodes.push(node);
        }
        arrayNodes.shift();
        for (const node of arrayNodes.filter((node) => node.action.metadata.userIntent === ('derivation' ))) {
            node.metadata.story = true;
            window.slideDeck.onAdd(node);
        }
        window.tree._viz.update();
    }
    setDeck(deck) {
        this._slideDeck = deck;
    }
    getDeck() {
        return this._slideDeck;
    }
}

export { SlideDeckVisualization };
//# sourceMappingURL=slide-deck-visualization.es5.js.map
