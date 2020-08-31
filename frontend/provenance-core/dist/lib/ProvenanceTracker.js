"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvenanceTracker = void 0;
var utils_1 = require("./utils");
var ProvenanceGraph_1 = require("./ProvenanceGraph");
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
    ProvenanceTracker.prototype.applyAction = function (action, skipFirstDoFunctionCall) {
        if (skipFirstDoFunctionCall === void 0) { skipFirstDoFunctionCall = false; }
        return __awaiter(this, void 0, void 0, function () {
            var label, createNewStateNode, newNode, currentNode, functionNameToExecute, funcWithThis, actionResult;
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
                        createNewStateNode = function (parentNode, actionResult) { return ({
                            id: utils_1.generateUUID(),
                            label: label,
                            metadata: {
                                loaded: false,
                                createdBy: _this.username,
                                createdOn: utils_1.generateTimestamp()
                            },
                            action: action,
                            actionResult: actionResult,
                            parent: parentNode,
                            children: []
                        }); };
                        currentNode = this.graph.current;
                        if (!skipFirstDoFunctionCall) return [3 /*break*/, 1];
                        newNode = createNewStateNode(this.graph.current, null);
                        return [3 /*break*/, 3];
                    case 1:
                        functionNameToExecute = action.do;
                        funcWithThis = this.registry.getFunctionByName(functionNameToExecute);
                        return [4 /*yield*/, funcWithThis.func.apply(funcWithThis.thisArg, action.doArguments.args)];
                    case 2:
                        actionResult = _a.sent();
                        newNode = createNewStateNode(currentNode, actionResult);
                        _a.label = 3;
                    case 3:
                        if (this.autoScreenShot && this.screenShotProvider) {
                            try {
                                newNode.metadata.screenShot = this.screenShotProvider();
                            }
                            catch (e) {
                                console.warn('Error while getting screenshot', e);
                            }
                        }
                        // When the node is created, we need to update the graph.
                        currentNode.children.push(newNode);
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
        Object.setPrototypeOf(sgraph, ProvenanceGraph_1.serializeProvenanceGraph.prototype);
        alert(JSON.stringify(sgraph));
        this.graph = this.graph.restoreSelf(sgraph);
    };
    return ProvenanceTracker;
}());
exports.ProvenanceTracker = ProvenanceTracker;
//# sourceMappingURL=ProvenanceTracker.js.map