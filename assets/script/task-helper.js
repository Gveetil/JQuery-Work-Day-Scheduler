/** Key used to access the local storage */
const localStorageKey = "scheduledWorkdayTasks";

/** This class represents a task scheduled on a workday */
class WorkdayTask {
    /**
    * Initialize the workday task object 
    * @param {object} workday the date and time moment object 
    * @param {string} description the description of the task
    */
    constructor(workday, description) {
        this.workday = workday;
        this.description = description;
    }
}

/** This class provides utility methods to work with workday tasks and save / retrieve them from local storage */
class WorkdayTaskHelper {
    /**
    * Initialize the workday tasks list
    */
    constructor() {
        this.taskList = JSON.parse(window.localStorage.getItem(localStorageKey), this.parseWorkday);
        if (this.taskList == null) {
            this.taskList = [];
        }
    }

    /**
     * This method parses date time strings and converts them into moment objects
     * It is used while reading data from local storage
     * @param {string} key key being parsed -- workday or description
     * @param {string} value value being parsed
     * @returns {object} moment object in case of workdays, string otherwise
     */
    parseWorkday(key, value) {
        if (key == "workday")
            return new moment(value);
        return value;
    }

    /** 
     * Fetches a task from the local storage for a given date / time
     * @param {object} selectedTime the date and time moment object
    */
    getTask(selectedTime) {
        for (var index in this.taskList) {
            if (this.taskList[index].workday.isSame(selectedTime)) {
                return this.taskList[index];
            }
        }
        return null;
    }

    /** Save the workday tasks list into local storage */
    saveTasks() {
        window.localStorage.setItem(localStorageKey, JSON.stringify(this.taskList));
    }

    /** Adds / Updates a new workday task to the local storage
     * @param {WorkdayTask} newTask the workday task object to be added or updated 
     */
    addTask(newTask) {
        var insertPosition = this.taskList.length;
        var isNewTask = true;
        // Order tasks and find index where task needs to be added / updated
        for (var index in this.taskList) {
            if (this.taskList[index].workday.isSame(newTask.workday)) {
                // Task already exists -- update description
                this.taskList[index].description = newTask.description;
                isNewTask = false;
                break;
            } else if (this.taskList[index].workday.isAfter(newTask.workday)) {
                // Update position to insert new task in
                insertPosition = index;
                break;
            }
        }
        if (isNewTask) {
            // New Task -- Add to the task list  
            this.taskList.splice(insertPosition, 0, newTask);
        }
        // Save changes to local storage
        this.saveTasks();
    }

    /** Removes a task from the local storage for a given date / time
     * @param {object} selectedTime the date and time moment object
     */
    removeTask(selectedTime) {
        // Check if a task matching the selected time exists
        for (var index in this.taskList) {
            if (this.taskList[index].workday.isSame(selectedTime)) {
                //Remove Task and save to storage
                this.taskList.splice(index, 1);
                this.saveTasks();
                return;
            }
        }
    }
}