"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvenanceTaskList = void 0;
require("./style.css");
class ProvenanceTaskList {
    constructor(traverser, graph, elm) {
        this.taskId = 1;
        this.taskName = "Task" + this.taskId;
        this.taskList = [
            {
                taskId: this.taskId,
                taskName: this.taskName,
                taskNodes: []
            }
        ];
        this.totalDitance = 0;
        this.pos = 0;
        this.step = 1;
        this.counter = 0;
        this.traverser = traverser;
        this.elm = elm;
        let button = this.createAddTaskButton();
        this.tasksTable = this.createTaskTable();
        elm.appendChild(button);
        elm.appendChild(this.tasksTable);
        this.graph = graph;
        graph.on("nodeAdded", (node) => {
            this.taskList[this.taskId - 1].taskNodes.push(node);
            this.addMetadata(this.taskId);
            this.addTaskNodes(node);
        });
    }
    /** Create Add Task Button */
    createAddTaskButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "floatingButton";
        button.innerText = "+";
        button.value = "Add";
        button.title = "New Task";
        button.addEventListener("click", this.addTask.bind(this));
        return button;
    }
    /*Create task table i.e. ul to hold the task list*/
    createTaskTable() {
        const tasksTable = document.createElement("ul");
        tasksTable.id = "taskTable";
        return tasksTable;
    }
    /** Add TaskId to Node MEtadata */
    addMetadata(id) {
        this.taskList[id - 1].taskNodes.forEach((node) => {
            if (node.action.metadata) {
                node.action.metadata.taskId = id;
                node.action.metadata.taskName = this.taskName;
            }
            else {
                node.action.metadata = {
                    taskId: id,
                    taskName: this.taskName
                };
            }
        });
    }
    traverseToNode(node) {
        return this.traverser.toStateNode(node.id, 250);
    }
    /*Add Task Nodes in list */
    addTaskNodes(node) {
        const nodeList = document.getElementById('nodeList' + this.taskId);
        if (nodeList !== null) {
            const li = document.createElement('li');
            const lb = document.createElement('label');
            lb.innerText = node.label;
            li.appendChild(lb);
            li.addEventListener('click', () => this.traverseToNode(node));
            nodeList.appendChild(li);
        }
    }
    /** Add Task to task list and create li for each task */
    addTask() {
        // check counter for addTask button clicked
        this.counter += 1;
        if (this.counter > 1) {
            this.taskId = this.counter;
            this.taskName = "Task" + this.taskId;
            this.createNewTask(); // create Task object
        }
        const inputContainer = document.createElement("li");
        inputContainer.className = "inputContainer";
        const checkbox = this.createCheckbox();
        const label = this.createTaskLabel();
        const radioBtn = this.createRadioButton();
        inputContainer.appendChild(radioBtn);
        inputContainer.appendChild(label);
        inputContainer.appendChild(checkbox);
        // Collapsible list of all nodes in Task
        const ul = document.createElement('ul');
        ul.id = 'nodeList' + this.taskId;
        ul.className = 'nodeList';
        inputContainer.appendChild(ul);
        this.tasksTable.appendChild(inputContainer);
        // Add previously added task Nodes
        this.addTaskNodesOnChange();
    }
    addTaskNodesOnChange() {
        const currentTaskNodesList = document.getElementById('nodeList' + this.taskId);
        const existingNodes = currentTaskNodesList.childElementCount;
        const taskNodes = this.taskList[this.taskId - 1].taskNodes;
        if (existingNodes !== taskNodes.length) {
            taskNodes.slice(existingNodes).map(node => {
                this.addTaskNodes(node);
            });
        }
    }
    /** Create Empty Task Object */
    createNewTask() {
        const task = {
            taskId: this.taskId,
            taskName: this.taskName,
            taskNodes: []
        };
        this.taskList.push(task);
    }
    /** Create UI controls for Task */
    createCheckbox() {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = this.taskId.toString();
        return checkbox;
    }
    createTaskLabel() {
        const label = document.createElement("input");
        label.type = "text";
        label.className = "taskTitle";
        label.name = "taskName";
        label.value = this.taskName;
        label.id = this.taskId.toString();
        label.readOnly = true;
        label.addEventListener("click", this.enableEdit.bind(this));
        label.addEventListener("change", this.updateTaskName.bind(this));
        return label;
    }
    enableEdit(event) {
        event.target.readOnly = false;
    }
    updateTaskName(event) {
        const id = Number(event.target.id);
        this.taskName = event.target.value;
        // Update taskId and TaskName to Active Task Id and Name
        this.taskId = id;
        this.taskList[id - 1].taskName = this.taskName;
        this.addMetadata(id);
    }
    createRadioButton() {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "name";
        radio.id = this.taskId.toString();
        radio.setAttribute("checked", "checked");
        radio.addEventListener("change", this.updateTaskId.bind(this));
        return radio;
    }
    updateTaskId(event) {
        this.taskId = Number(event.target.id);
        let name = event.target.nextElementSibling.value;
        this.taskName = name;
        this.addTaskNodesOnChange();
    }
}
exports.ProvenanceTaskList = ProvenanceTaskList;
//# sourceMappingURL=provenance-task-list.js.map