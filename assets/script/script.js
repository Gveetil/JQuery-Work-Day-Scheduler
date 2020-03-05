const schedulerDayDisplayFormat = "dddd, MMMM Do YYYY";

$(document).ready(function () {

    var currentDayDisplayEl = $("#currentDay");
    var timeblockContainerEl = $("#timeblockContainer");
    var previousEl = $("#previous");
    var nextEl = $("#next");
    var startBusinessHours = 9;
    var endBusinessHours = 17;
    // Selected date is today
    var selectedDate = moment().startOf('day');
    var taskHelper = new WorkdayTaskHelper();
    /**
     * Renders the scheduler user interface
     */
    function renderScheduler() {
        currentDayDisplayEl.text(selectedDate.format(schedulerDayDisplayFormat));
        timeblockContainerEl.text("");
        var timeSelection = moment(selectedDate);
        var currentTime = moment();
        timeSelection.set("hour", startBusinessHours);
        while (timeSelection.hours() <= endBusinessHours) {
            var task = taskHelper.getTask(timeSelection);
            var description = "";
            if (task != null) {
                description = task.description;
            }
            appendTimeBlock(timeSelection, description, currentTime);
            timeSelection.add(1, 'hours');
        }
    }

    function appendTimeBlock(timeSelection, description, currentTime) {
        var row = $("<div class='row time-block no-gutters'>");
        var columnHour = $("<div class='col-2 col-md-1 hour'>");
        columnHour.text(timeSelection.format('ha'));
        row.append(columnHour);
        var columnDescription = $("<div class='col-8 col-md-10 description'>");
        var textTask = $("<textarea class='w-100 h-100'>");
        textTask.val(description);
        columnDescription.append(textTask);
        if (timeSelection.isSame(currentTime, 'hour'))
            columnDescription.addClass("present");
        else if (currentTime.isAfter(timeSelection)) {
            columnDescription.addClass("past");
        }
        else
            columnDescription.addClass("future");
        row.append(columnDescription);
        var columnSave = $("<div class='col-2 col-md-1 saveBtn'>");
        columnSave.append($("<i class='fas fa-save'>"));
        row.append(columnSave);
        timeblockContainerEl.append(row);
    }

    renderScheduler();
    timeblockContainerEl.on("click", timeblockContainerClicked)
    previousEl.on("click", previousButtonCliicked);
    nextEl.on("click", nextButtonCliicked);

    function previousButtonCliicked() {
        selectedDate.subtract(1, 'days');
        renderScheduler();
    }

    function nextButtonCliicked() {
        selectedDate.add('days', 1);
        renderScheduler();
    }

    function timeblockContainerClicked() {
        // Check if Save icon was clicked
        if ($(event.target).is("i")) {
            var timeBlockRowEl = $(event.target).parents(".time-block");
            saveTimeBlock(timeBlockRowEl);
        }
    }

    function saveTimeBlock(rowEl) {
        var taskDescription = rowEl.find("textarea").val().trim();
        var taskHourSelected = rowEl.find(".hour").text();
        var taskDateTime = new moment(taskHourSelected, 'ha')
        taskDateTime.set({
            'year': selectedDate.year(),
            'month': selectedDate.month(),
            'date': selectedDate.date()
        })
        if (taskDescription == "") {
            //No description found -- remove task, if it exists
            taskHelper.removeTask(taskDateTime);
        } else {
            // Add task
            taskHelper.addTask(new WorkdayTask(taskDateTime, taskDescription));
        }
    }
});