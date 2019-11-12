import {
    ProvenanceGraphTraverser,
    ProvenanceGraph,
    StateNode
} from "@visualstorytelling/provenance-core";
import "./style.css";

interface ITask {
    taskId: number;
    taskName: string;
    taskNodes: StateNode[];
}

export class ProvenanceTaskList {
    private taskId = 1;
    private taskName = "Task" + this.taskId;
    private taskList: ITask[] = [
        {
            taskId: this.taskId,
            taskName: this.taskName,
            taskNodes: []
        }
    ];
    private totalDitance = 0;
    private pos = 0;
    private step = 1;
    private counter = 0;
    private graph: ProvenanceGraph;
    private elm: HTMLDivElement; // the element to render in
    private tasksTable: HTMLUListElement;
    public traverser: ProvenanceGraphTraverser;
    constructor(
        traverser: ProvenanceGraphTraverser,
        graph: ProvenanceGraph,
        elm: HTMLDivElement
    ) {
        this.traverser = traverser;
        this.elm = elm;
        let button = this.createAddTaskButton();
        this.tasksTable = this.createTaskTable();
        elm.appendChild(button);
        elm.appendChild(this.tasksTable);

        this.graph = graph;
        graph.on("nodeAdded", (node: StateNode) => {
            this.taskList[this.taskId - 1].taskNodes.push(node);
            this.addMetadata(this.taskId);
            this.addTaskNodes(node);
        });
    }

    /** Create Add Task Button */
    private createAddTaskButton() {
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
    private createTaskTable() {
        const tasksTable = document.createElement("ul");
        tasksTable.id = "taskTable";
        return tasksTable;
    }
    /** Add TaskId to Node MEtadata */
    public addMetadata(id: number) {
        this.taskList[id - 1].taskNodes.forEach((node: StateNode) => {
            if (node.action.metadata) {
                node.action.metadata.taskId = id;
                node.action.metadata.taskName = this.taskName;
            } else {
                node.action.metadata = {
                    taskId: id,
                    taskName: this.taskName
                };
            }
        });
    }
    traverseToNode(node: StateNode) {
        return this.traverser.toStateNode(node.id, 250);

    }
    /*Add Task Nodes in list */
    addTaskNodes(node: StateNode) {
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
    public addTask() {
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
        const existingNodes = currentTaskNodesList!.childElementCount;
        const taskNodes = this.taskList[this.taskId - 1].taskNodes;
        if (existingNodes !== taskNodes.length) {
            taskNodes.slice(existingNodes).map(node => {
                this.addTaskNodes(node);
            })
        }

    }
    /** Create Empty Task Object */

    private createNewTask() {
        const task = {
            taskId: this.taskId,
            taskName: this.taskName,
            taskNodes: []
        };
        this.taskList.push(task);
    }

    /** Create UI controls for Task */
    private createCheckbox() {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = this.taskId.toString();
        return checkbox;
    }

    private createTaskLabel() {
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
    private enableEdit(event: any) {
        event.target.readOnly = false;
    }
    private updateTaskName(event: any) {
        const id = Number(event.target.id);
        this.taskName = event.target.value;
        // Update taskId and TaskName to Active Task Id and Name
        this.taskId = id;
        this.taskList[id - 1].taskName = this.taskName;

        this.addMetadata(id);
    }
    private createRadioButton() {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "name";
        radio.id = this.taskId.toString();
        radio.setAttribute("checked", "checked");
        radio.addEventListener("change", this.updateTaskId.bind(this));
        return radio;
    }

    private updateTaskId(event: any) {
        this.taskId = Number(event.target.id);
        let name = event.target.nextElementSibling.value;
        this.taskName = name;
        this.addTaskNodesOnChange();
    }
}
