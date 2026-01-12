// Storage keys
const STORAGE_KEYS = {
    dreams: 'goals_app_dreams',
    goals: 'goals_app_goals',
    tasks: 'goals_app_tasks'
};

// Initialize data from localStorage
let dreams = JSON.parse(localStorage.getItem(STORAGE_KEYS.dreams)) || [];
let goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.goals)) || [];
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks)) || [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadInitialData();
    renderAll();
});

// Load initial data if empty
function loadInitialData() {
    if (dreams.length === 0) {
        dreams = [
            { id: Date.now(), title: "Lexus LX 500d J310 в обвесе", cost: 25000000, description: "Премиум внедорожник Lexus LX 500d кузов J310 в обвесе", created_at: new Date().toISOString() },
            { id: Date.now() + 1, title: "Квартира в Тольятти 3-4 комнатная", cost: 12000000, description: "3-4 комнатная квартира с 2 санузлами, 120-150м²", created_at: new Date().toISOString() },
            { id: Date.now() + 2, title: "Дом в Ягодном у леса", cost: 50000000, description: "Построить дом по своему проекту у леса в Ягодном", created_at: new Date().toISOString() }
        ];
        saveDreams();
    }

    if (goals.length === 0) {
        goals = [
            { id: Date.now() + 100, title: "Обустроить дачу", cost: 1000000, description: "Благоустройство дачи", status: "active", created_at: new Date().toISOString() },
            { id: Date.now() + 101, title: "Выкупить Geely Preface из лизинга", cost: 1500000, description: "Полный выкуп автомобиля Geely Preface из лизинга", status: "active", created_at: new Date().toISOString() },
            { id: Date.now() + 102, title: "Слетать на отдых всей семьей", cost: 1000000, description: "Семейный отпуск", status: "active", created_at: new Date().toISOString() }
        ];
        saveGoals();
    }
}

// Save functions
function saveDreams() {
    localStorage.setItem(STORAGE_KEYS.dreams, JSON.stringify(dreams));
}

function saveGoals() {
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
}

// Render all
function renderAll() {
    renderStats();
    renderDreams();
    renderGoals();
    renderTasks();
    updateTaskGoalSelect();
}

// Render stats
function renderStats() {
    const dreamsTotal = dreams.reduce((sum, d) => sum + d.cost, 0);
    const goalsTotal = goals.reduce((sum, g) => sum + g.cost, 0);
    const tasksCount = tasks.filter(t => t.status !== 'completed').length;

    document.getElementById('dreamsTotal').textContent = formatCurrency(dreamsTotal);
    document.getElementById('goalsTotal').textContent = formatCurrency(goalsTotal);
    document.getElementById('tasksCount').textContent = tasksCount;
}

// Render dreams
function renderDreams() {
    const container = document.getElementById('dreamsList');
    container.innerHTML = '';

    dreams.forEach(dream => {
        const card = `
            <div class="col-md-6 mb-3">
                <div class="card dream-item">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${dream.title}</h5>
                            <button class="btn btn-sm btn-danger" onclick="deleteDream(${dream.id})">×</button>
                        </div>
                        <p class="card-text text-muted">${dream.description || ''}</p>
                        <h4 class="text-primary">${formatCurrency(dream.cost)}</h4>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Render goals
function renderGoals() {
    const container = document.getElementById('goalsList');
    container.innerHTML = '';

    goals.forEach(goal => {
        const card = `
            <div class="col-md-6 mb-3">
                <div class="card goal-item ${goal.status === 'completed' ? 'completed' : ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${goal.title}</h5>
                            <div>
                                <button class="btn btn-sm ${goal.status === 'completed' ? 'btn-secondary' : 'btn-success'}"
                                        onclick="toggleGoalStatus(${goal.id})">
                                    ${goal.status === 'completed' ? 'Вернуть' : '✓'}
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteGoal(${goal.id})">×</button>
                            </div>
                        </div>
                        <p class="card-text text-muted">${goal.description || ''}</p>
                        <h5 class="text-primary">${formatCurrency(goal.cost)}</h5>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Render tasks
function renderTasks() {
    const container = document.getElementById('tasksList');
    container.innerHTML = '';

    tasks.forEach(task => {
        const goal = goals.find(g => g.id === task.goalId);
        const goalBadge = goal ? `<span class="badge bg-info">${goal.title}</span>` : '';

        const card = `
            <div class="card task-item mb-2 ${task.status === 'completed' ? 'completed' : ''}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${task.title}</h6>
                            ${task.description ? `<p class="text-muted small mb-1">${task.description}</p>` : ''}
                            ${goalBadge}
                        </div>
                        <div class="ms-2">
                            <button class="btn btn-sm ${task.status === 'completed' ? 'btn-secondary' : 'btn-success'}"
                                    onclick="toggleTaskStatus(${task.id})">
                                ${task.status === 'completed' ? 'Вернуть' : '✓'}
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">×</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Update task goal select
function updateTaskGoalSelect() {
    const select = document.getElementById('taskGoalId');
    select.innerHTML = '<option value="">Не привязана</option>';

    goals.filter(g => g.status !== 'completed').forEach(goal => {
        const option = document.createElement('option');
        option.value = goal.id;
        option.textContent = goal.title;
        select.appendChild(option);
    });
}

// Add dream
function addDream() {
    const title = document.getElementById('dreamTitle').value;
    const cost = parseInt(document.getElementById('dreamCost').value);
    const description = document.getElementById('dreamDescription').value;

    if (!title || !cost) {
        alert('Заполните обязательные поля');
        return;
    }

    dreams.push({
        id: Date.now(),
        title,
        cost,
        description,
        created_at: new Date().toISOString()
    });

    saveDreams();
    renderAll();

    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addDreamModal')).hide();
    document.getElementById('addDreamForm').reset();
}

// Delete dream
function deleteDream(id) {
    if (confirm('Удалить эту мечту?')) {
        dreams = dreams.filter(d => d.id !== id);
        saveDreams();
        renderAll();
    }
}

// Add goal
function addGoal() {
    const title = document.getElementById('goalTitle').value;
    const cost = parseInt(document.getElementById('goalCost').value);
    const description = document.getElementById('goalDescription').value;

    if (!title || !cost) {
        alert('Заполните обязательные поля');
        return;
    }

    goals.push({
        id: Date.now(),
        title,
        cost,
        description,
        status: 'active',
        created_at: new Date().toISOString()
    });

    saveGoals();
    renderAll();

    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addGoalModal')).hide();
    document.getElementById('addGoalForm').reset();
}

// Toggle goal status
function toggleGoalStatus(id) {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.status = goal.status === 'completed' ? 'active' : 'completed';
        saveGoals();
        renderAll();
    }
}

// Delete goal
function deleteGoal(id) {
    if (confirm('Удалить эту цель?')) {
        goals = goals.filter(g => g.id !== id);
        saveGoals();
        renderAll();
    }
}

// Add task
function addTask() {
    const title = document.getElementById('taskTitle').value;
    const goalId = document.getElementById('taskGoalId').value;
    const description = document.getElementById('taskDescription').value;

    if (!title) {
        alert('Введите название задачи');
        return;
    }

    tasks.push({
        id: Date.now(),
        title,
        goalId: goalId ? parseInt(goalId) : null,
        description,
        status: 'active',
        created_at: new Date().toISOString()
    });

    saveTasks();
    renderAll();

    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
    document.getElementById('addTaskForm').reset();
}

// Toggle task status
function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'completed' ? 'active' : 'completed';
        saveTasks();
        renderAll();
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Удалить эту задачу?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderAll();
    }
}
