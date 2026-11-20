
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const dueDateInput = document.getElementById("dueDate");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

let tasks = JSON.parse(localStorage.getItem("nexoraTasks")) || [];
let currentFilter = "all";

// TODAY'S DATE
function getTodayString() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// DISPLAY DATE
document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

dueDateInput.min = getTodayString();

// SAVE TASKS
function saveTasks() {
    localStorage.setItem("nexoraTasks", JSON.stringify(tasks));
}

// ADD TASK
function addTask() {

    const title = taskInput.value.trim();

    if (title === "") {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        priority: priorityInput.value,
        category: categoryInput.value,
        dueDate: dueDateInput.value,
        completed: false
    };

    tasks.unshift(newTask);

    taskInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "Medium";
    categoryInput.value = "Study";

    saveTasks();
    renderTasks();
}

// COMPLETE TASK
function toggleTask(id) {

    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// DELETE TASK
function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// FILTER TASKS
function changeFilter(filter) {

    currentFilter = filter;

    // Update filter buttons
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    // Update sidebar buttons
    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    renderTasks();
}

// SEARCH
searchInput.addEventListener("input", renderTasks);

// RENDER TASKS
function renderTasks() {

    taskList.innerHTML = "";

    const searchText = searchInput.value.trim().toLowerCase();

    let filteredTasks = [...tasks];

    // FILTER
    if (currentFilter === "active") {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }

    // SEARCH BY TITLE OR CATEGORY
    filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchText) ||
        (task.category || "").toLowerCase().includes(searchText)
    );

    // DISPLAY TASK CARDS
    filteredTasks.forEach((task, index) => {

        const isOverdue =
            task.dueDate &&
            task.dueDate < getTodayString() &&
            !task.completed;

        // MAIN CARD
        const card = document.createElement("div");
        card.className = "task-item";
        card.style.animationDelay = `${index * 0.04}s`;

        if (task.completed) {
            card.classList.add("completed");
        }

        if (isOverdue) {
            card.classList.add("overdue-task");
        }

        // CHECK BUTTON
        const checkButton = document.createElement("button");
        checkButton.className = "task-check";

        if (task.completed) {
            checkButton.classList.add("checked");
        }

        checkButton.setAttribute(
            "aria-label",
            task.completed ? "Mark as incomplete" : "Complete task"
        );

        checkButton.addEventListener("click", () => {
            toggleTask(task.id);
        });

        // TASK CONTENT
        const content = document.createElement("div");
        content.className = "task-content";

        // TITLE
        const title = document.createElement("p");
        title.className = "task-title";
        title.textContent = task.title;

        // META
        const meta = document.createElement("div");
        meta.className = "task-meta";

        // PRIORITY
        const priority = document.createElement("span");
        priority.className = `priority ${task.priority || "Medium"}`;
        priority.textContent = `${task.priority || "Medium"} Priority`;

        // CATEGORY
        const category = document.createElement("span");
        category.className = "category-tag";
        category.textContent = task.category || "Personal";

        // STATUS
        const status = document.createElement("span");

        status.textContent = task.completed
            ? "✓ Completed"
            : "● In progress";

        // ADD META ITEMS
        meta.append(priority, category, status);

        // DUE DATE
        if (task.dueDate) {

            const due = document.createElement("span");
            due.className = "due-date";

            const formattedDate = new Date(
                task.dueDate + "T00:00:00"
            ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

            if (isOverdue) {
                due.classList.add("overdue");
                due.textContent = "⚠ Overdue · " + formattedDate;
            } else {
                due.textContent = "📅 " + formattedDate;
            }

            meta.appendChild(due);
        }

        content.append(title, meta);

        // DELETE BUTTON
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "✕";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        // APPEND CARD
        card.append(checkButton, content, deleteButton);
        taskList.appendChild(card);
    });

    // EMPTY STATE
    emptyState.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    // STATISTICS
    updateStatistics(filteredTasks);
}

// UPDATE STATISTICS
function updateStatistics(filteredTasks) {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = total - completed;

    // TOTAL
    document.getElementById("totalTasks").textContent = total;

    // ACTIVE
    document.getElementById("activeTasks").textContent = active;

    // COMPLETED
    document.getElementById("completedTasks").textContent = completed;

    // SIDEBAR COUNT
    document.getElementById("sidebarTotal").textContent = total;

    // FILTER COUNT
    document.getElementById("taskCount").textContent =
        `${filteredTasks.length} ${
            filteredTasks.length === 1 ? "task" : "tasks"
        }`;

    // PROGRESS
    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("progressText").textContent =
        percentage + "%";

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressCount").textContent =
        `${completed} of ${total} completed`;

    // PROGRESS MESSAGE
    const message = document.getElementById("progressMessage");

    if (total === 0) {
        message.textContent = "Let's get started!";
    }
    else if (percentage === 100) {
        message.textContent = "Everything is done. Amazing work! ✨";
    }
    else if (percentage >= 50) {
        message.textContent = "You're halfway there. Keep going!";
    }
    else if (completed > 0) {
        message.textContent = "Nice start. Keep the momentum!";
    }
    else {
        message.textContent = "One task at a time. You got this!";
    }
}

// ADD BUTTON
document.getElementById("addTaskBtn").addEventListener("click", addTask);

// ENTER KEY
taskInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

// FILTER BUTTONS
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        changeFilter(button.dataset.filter);
    });
});

// SIDEBAR BUTTONS
document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        changeFilter(button.dataset.filter);
    });
});

// INITIAL LOAD
renderTasks();
