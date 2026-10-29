/**
 * Action List for CTRL + Z and CTRL + SHIFT + Z
 */
export class ActionList {
    constructor() {
        this.actions = [];
        this.current = -1;
        this.MAX_SIZE = 30;
    }

    KeydownHandle(e) {
        const action_list = this;
        if((e.key == 'z' || e.key == 'Z') && e.ctrlKey) {
            e.preventDefault();
            if(e.shiftKey) action_list.Redo();
            else action_list.Undo();
        }
    }

    /**
     * Undo last action
     */
    Undo() {
        if(this.current > -1) {
            const action = this.actions[this.current];
            action.undo(action.data);
            this.current--;
        }
    }

    /**
     * Redo last action canceled action
     */
    Redo() {
        if(this.current + 1 < this.actions.length) {
            this.current++;
            const action = this.actions[this.current];
            action.do(action.data);
        }
    }

    /**
     * Add an action to action list
     * @param {object} action 
     * @param {Function} action.do Function to execute
     * @param {Function} action.undo Function to cancel action.do
     * @param {object} action.data Data to apply to functions
     */
    Add(action) {
        if(typeof action.do == 'function' && typeof action.undo == 'function') {
            if(this.current < this.actions.length - 1) {
                this.actions = this.actions.slice(0, this.current + 1);
                this.current++;
            } else if(this.actions.length == this.MAX_SIZE) {
                this.actions.shift();
            } else {
                this.current++;
            }
            this.actions.push(action);
        }
    }

    /**
     * Reset ActionList
     */
    Reset() {
        this.actions = [];
        this.current = -1;
    }
}