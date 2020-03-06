// Note: This javascript file references classes and functions from task-helper.js

// the format used to display the date and time intervals
const dayDisplayFormat = "dddd, MMMM Do YYYY";
const hourDisplayFormat = "hA";

$(document).ready(function () {
    // UI Elements referenced by this code
    var currentDayDisplayEl = $("#currentDay");
    var timeblockContainerEl = $("#timeblockContainer");
    var previousEl = $("#previous");
    var nextEl = $("#next");
    // Business Hours 
    var startBusinessHours = 9;
    var endBusinessHours = 17;
    // Selected date is today by default
    var selectedDate = moment().startOf('day');
    var hourUpdateTimeout = null;
    var taskHelper = new WorkdayTaskHelper();

    /** Renders the scheduler user interface */
    function renderScheduler() {
        currentDayDisplayEl.text(selectedDate.format(dayDisplayFormat));
        timeblockContainerEl.empty();
        var currentTime = moment();
        var taskTime = moment(selectedDate);
        taskTime.set("hour", startBusinessHours);
        while (taskTime.hours() <= endBusinessHours) {
            // Fetch saved task if it exists, and append time block
            var savedTask = taskHelper.getTask(taskTime);
            var description = "";
            if (savedTask != null) {
                description = savedTask.description;
            }
            appendTimeBlock(taskTime, description, currentTime);
            taskTime.add(1, 'hours');
        }
        // Add change event on text area to keep track of changes
        $("textarea").on("change", descriptionChanged);
    }

    /**
     * Creates a new time block row and appends it to the container
     * @param {moment} taskTime the time of the task
     * @param {string} description the task description
     * @param {moment} currentTime the present date time 
     */
    function appendTimeBlock(taskTime, description, currentTime) {
        // New row
        var row = $("<div class='row time-block no-gutters'>");
        // Hour column
        var columnHour = $("<div class='col-2 col-md-1 hour'>");
        columnHour.text(taskTime.format(hourDisplayFormat));
        row.append(columnHour);
        // Description column
        var columnDescription = $("<div class='col-8 col-md-10 description'>");
        var textTask = $("<textarea class='w-100 h-100'>");
        textTask.attr("data-hour", taskTime.hour());
        textTask.attr("data-savedvalue", description);
        textTask.val(description);
        columnDescription.append(textTask);
        // Set description styling based on hour
        if (taskTime.isSame(currentTime, 'hour')) {
            columnDescription.addClass("present");
            scheduleHourUpdate(currentTime);
        }
        else if (currentTime.isAfter(taskTime)) {
            columnDescription.addClass("past");
        }
        else
            columnDescription.addClass("future");
        row.append(columnDescription);
        // Save button column
        var columnSave = $("<div class='col-2 col-md-1 saveBtn'>");
        columnSave.append($("<i class='fas fa-save'>"));
        row.append(columnSave);
        timeblockContainerEl.append(row);
    }

    /**
     * Schedules an update of the screen when the hour changes   
     * @param {moment} currentTime the present date time 
     */
    function scheduleHourUpdate(currentTime) {
        var nextHour = moment(currentTime).hour(currentTime.hour() + 1).startOf('hour');
        var timeoutInterval = nextHour.diff(currentTime, 'milliseconds');
        clearUpdateTimeouts();
        hourUpdateTimeout = setTimeout(updateCurrentHour, timeoutInterval);
    }

    /** Clear previous screen update timeouts, if any */
    function clearUpdateTimeouts() {
        if (hourUpdateTimeout != null) {
            clearTimeout(hourUpdateTimeout);
            hourUpdateTimeout = null;
        }
    }

    /** Updates the screen to display current hour time interval correctly */
    function updateCurrentHour() {
        // Clear previous hour setting
        var previousHourEl = $(".present");
        if (previousHourEl != undefined)
            previousHourEl.toggleClass('present past');
        var currentTime = moment();
        // Fetch element matching current hour and update formatting .. if no match is found, nothing gets updated since the array is empty
        var nextHourTextboxEl = $("textarea").filter("[data-hour='" + currentTime.hour() + "']");
        nextHourTextboxEl.parents(".future").toggleClass('future present');
        // schedule update for next hour if within business hours
        if (currentTime.hour() <= endBusinessHours)
            scheduleHourUpdate(currentTime);
    }

    /** Moves the scheduler date backwards */
    function previousButtonClicked() {
        // Proceed if all data has been saved
        if (validatePageUpdates()) {
            clearUpdateTimeouts();
            selectedDate.subtract(1, 'days');
            renderScheduler();
        }
    }

    /** Moves the scheduler date forwards */
    function nextButtonClicked() {
        // Proceed if all data has been saved
        if (validatePageUpdates()) {
            clearUpdateTimeouts();
            selectedDate.add(1, 'days');
            renderScheduler();
        }
    }

    /** Handles save of task when save icon is clicked */
    function timeblockContainerClicked() {
        // Check if Save icon was clicked
        if ($(event.target).is("i")) {
            var timeBlockRowEl = $(event.target).parents(".time-block");
            saveTask(timeBlockRowEl);
        }
    }

    /** Checks if the description has changed from the saved one */
    function descriptionChanged() {
        var currentValue = $(this).val().trim();
        // If description has changed - set the isupdated flag
        if ($(this).attr("data-savedvalue") != currentValue)
            $(this).attr("data-isupdated", "1");
        else
            $(this).attr("data-isupdated", "0");
    }

    /** Validates if all data on the form has been saved */
    function validatePageUpdates() {
        var unsavedRows = $("textarea").filter("[data-isupdated='1']");
        // Check if unsaved rows exist
        if (unsavedRows.length > 0) {
            var message = "You have unsaved changes in the below time block(s):\n";
            // make a list of unsaved rows 
            unsavedRows.each(function () {
                message += $(this).parents(".time-block").find(".hour").text() + ", ";
            });
            message = message.trim().slice(0, -1);
            message += "\nDo you wish to proceed without saving?";
            // Return user's response
            return (confirm(message));
        }
        return true;
    }

    /**
     * Saves a task to local storage
     * @param {Element} rowEl the time block row element to be saved
     */
    function saveTask(rowEl) {
        var taskDescriptionEl = rowEl.find("textarea");
        var taskDescription = taskDescriptionEl.val().trim();
        var taskHourSelected = taskDescriptionEl.attr("data-hour");
        var taskDateTime = new moment(selectedDate).set("hour", taskHourSelected).startOf('hour');
        if (taskDescription == "") {
            //No description found -- remove task, if it exists
            taskHelper.removeTask(taskDateTime);
        } else {
            // Add / update task
            taskHelper.addTask(new WorkdayTask(taskDateTime, taskDescription));
        }
        // Update textbox data attributes
        taskDescriptionEl.attr("data-savedvalue", taskDescription);
        taskDescriptionEl.attr("data-isupdated", "0");
    }

    // render scheduler when the screen is loaded up
    renderScheduler();

    // Event handlers
    timeblockContainerEl.on("click", timeblockContainerClicked)
    previousEl.on("click", previousButtonClicked);
    nextEl.on("click", nextButtonClicked);

});