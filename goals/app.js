// API base URL
const API_BASE = '/.netlify/functions/goals-api';

// Data
let dreams = [];
let goals = [];
let tasks = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadDataFromAPI();
    renderAll();
});

// Load data from API
async function loadDataFromAPI() {
    try {
        const [dreamsData, goalsData, tasksData] = await Promise.all([
            fetch('/api/dreams').then(r => r.json()),
            fetch('/api/goals').then(r => r.json()),
            fetch('/api/tasks').then(r => r.json())
        ]);

        dreams = dreamsData.dreams || [];
        goals = goalsData.goals || [];
        tasks = tasksData.tasks || [];
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save functions
async function saveDreams() {
    try {
        await fetch('/api/dreams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dreams,
                total_cost: dreams.reduce((sum, d) => sum + d.cost, 0),
                last_updated: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error saving dreams:', error);
    }
}

async function saveGoals() {
    try {
        await fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                goals,
                total_cost: goals.reduce((sum, g) => sum + g.cost, 0),
                last_updated: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error saving goals:', error);
    }
}

async function saveTasks() {
    try {
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tasks,
                last_updated: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
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
async function addDream() {
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

    await saveDreams();
    renderAll();

    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addDreamModal')).hide();
    document.getElementById('addDreamForm').reset();
}

// Delete dream
async function deleteDream(id) {
    if (confirm('Удалить эту мечту?')) {
        dreams = dreams.filter(d => d.id !== id);
        await saveDreams();
        renderAll();
    }
}

// Add goal
async function addGoal() {
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

    await saveGoals();
    renderAll();

    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addGoalModal')).hide();
    document.getElementById('addGoalForm').reset();
}

// Toggle goal status
async function toggleGoalStatus(id) {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.status = goal.status === 'completed' ? 'active' : 'completed';
        await saveGoals();
        renderAll();
    }
}

// Delete goal
async function deleteGoal(id) {
    if (confirm('Удалить эту цель?')) {
        goals = goals.filter(g => g.id !== id);
        await saveGoals();
        renderAll();
    }
}

// Add task
async function addTask() {
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

    await saveTasks();
    renderAll();

    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
    document.getElementById('addTaskForm').reset();
}

// Toggle task status
async function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'completed' ? 'active' : 'completed';
        await saveTasks();
        renderAll();
    }
}

// Delete task
async function deleteTask(id) {
    if (confirm('Удалить эту задачу?')) {
        tasks = tasks.filter(t => t.id !== id);
        await saveTasks();
        renderAll();
    }
}
