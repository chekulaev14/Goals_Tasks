// Data
let dreams = [];
let goals = [];
let tasks = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadDataFromFiles();
    renderAll();
});

// Load data from JSON files
async function loadDataFromFiles() {
    try {
        const [dreamsData, goalsData, tasksData] = await Promise.all([
            fetch('/goals/data/dreams.json').then(r => r.json()),
            fetch('/goals/data/goals.json').then(r => r.json()),
            fetch('/goals/data/tasks.json').then(r => r.json())
        ]);

        dreams = dreamsData.dreams || [];
        goals = goalsData.goals || [];
        tasks = tasksData.tasks || [];
    } catch (error) {
        console.error('Error loading data:', error);
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
                        <h5 class="card-title">${dream.title}</h5>
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
                        <h5 class="card-title">${goal.title}</h5>
                        <p class="card-text text-muted">${goal.description || ''}</p>
                        <h5 class="text-primary">${formatCurrency(goal.cost)}</h5>
                        ${goal.status === 'completed' ? '<span class="badge bg-success">Выполнено</span>' : ''}
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
                    <h6 class="mb-1">${task.title}</h6>
                    ${task.description ? `<p class="text-muted small mb-1">${task.description}</p>` : ''}
                    ${goalBadge}
                    ${task.status === 'completed' ? '<span class="badge bg-success ms-2">Выполнено</span>' : ''}
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}
