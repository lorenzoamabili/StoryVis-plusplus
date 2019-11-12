import { ProvenanceGraphTraverser, ProvenanceGraph, StateNode } from "@visualstorytelling/provenance-core";
import "./style.css";
export declare class ProvenanceTaskList {
    private taskId;
    private taskName;
    private taskList;
    private totalDitance;
    private pos;
    private step;
    private counter;
    private graph;
    private elm;
    private tasksTable;
    traverser: ProvenanceGraphTraverser;
    constructor(traverser: ProvenanceGraphTraverser, graph: ProvenanceGraph, elm: HTMLDivElement);
    /** Create Add Task Button */
    private createAddTaskButton;
    private createTaskTable;
    /** Add TaskId to Node MEtadata */
    addMetadata(id: number): void;
    traverseToNode(node: StateNode): Promise<import("@visualstorytelling/provenance-core").RootNode | StateNode | undefined>;
    addTaskNodes(node: StateNode): void;
    /** Add Task to task list and create li for each task */
    addTask(): void;
    addTaskNodesOnChange(): void;
    /** Create Empty Task Object */
    private createNewTask;
    /** Create UI controls for Task */
    private createCheckbox;
    private createTaskLabel;
    private enableEdit;
    private updateTaskName;
    private createRadioButton;
    private updateTaskId;
}
