"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeProvenanceGraph = exports.restoreProvenanceGraph = exports.ProvenanceGraph = void 0;
var utils_1 = require("./utils");
var mitt_1 = require("./mitt");
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
        this.id = utils_1.generateUUID();
        this._mitt = mitt_1.default();
        this.application = application;
        this.graphID = this.graphID + 1;
        if (node) {
            this.root = node;
        }
        else {
            this.root = {
                id: utils_1.generateUUID(),
                label: 'Root',
                metadata: {
                    createdBy: userid,
                    createdOn: utils_1.generateTimestamp(),
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
exports.ProvenanceGraph = ProvenanceGraph;
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
exports.restoreProvenanceGraph = restoreProvenanceGraph;
function serializeProvenanceGraph(graph) {
    var nodes = Object.keys(graph.getNodes()).map(function (nodeId) {
        var node = graph.getNode(nodeId);
        node.metadata.loaded = true;
        var serializedNode = __assign({}, node);
        if (utils_1.isStateNode(node)) {
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
exports.serializeProvenanceGraph = serializeProvenanceGraph;
//# sourceMappingURL=ProvenanceGraph.js.map