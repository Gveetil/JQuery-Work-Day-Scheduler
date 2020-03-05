const schedulerDayDisplayFormat = "dddd, MMMM Do YYYY";

$(document).ready(function () {

    var currentDayDisplayEl = $("#currentDay");
    var timeblockContainerEl = $("#timeblockContainer");
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
        var timeSelection = moment(selectedDate);
        timeSelection.set("hour", startBusinessHours);
        while (timeSelection.hours() <= endBusinessHours) {
            var task = taskHelper.getTask(timeSelection);
            var description = "";
            if (task != null) {
                description = task.description;
            }
            appendTimeBlock(timeSelection.format('ha'), description);

            timeSelection.add(1, 'hours');
        }
    }

    function appendTimeBlock(time, description) {
        var row = $("<div class='row time-block no-gutters'>");
        var column1 = $("<div class='col-sm-1 hour'>");
        column1.text(time);
        row.append(column1);
        var column2 = $("<div class='col-sm-10 present description'>");
        var textTask = $("<textarea class='w-100 h-100'>");
        textTask.val(description);
        column2.append(textTask);
        row.append(column2);
        var column3 = $("<div class='col-sm-1 saveBtn'>");
        column3.append($("<i class='fas fa-save'>"));
        row.append(column3);
        timeblockContainerEl.append(row);
    }

    renderScheduler();
    timeblockContainerEl.on("click", timeblockContainerClicked)

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
            'day': selectedDate.day()
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