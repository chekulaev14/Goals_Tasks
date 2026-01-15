// Data
let dreams = [];
let goals = [];
let tasks = [];
let ideas = [];
let weekSchedule = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadDataFromFiles();
    renderAll();
});

// Load data from JSON files
async function loadDataFromFiles() {
    try {
        const [dreamsData, goalsData, tasksData, ideasData, scheduleData] = await Promise.all([
            fetch('/goals/data/dreams.json').then(r => r.json()),
            fetch('/goals/data/goals.json').then(r => r.json()),
            fetch('/goals/data/tasks.json').then(r => r.json()),
            fetch('/goals/data/marketing_ideas.json').then(r => r.json()),
            fetch('/goals/data/week-schedule.json').then(r => r.json())
        ]);

        dreams = dreamsData.dreams || [];
        goals = goalsData.goals || [];
        tasks = tasksData.tasks || [];
        ideas = ideasData.ideas || [];
        weekSchedule = scheduleData;
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
    renderDailyRoutine();
    renderWeekCalendar();
    renderStats();
    renderDreams();
    renderGoals();
    renderTasks();
    renderIdeas();
}

// Render daily routine
function renderDailyRoutine() {
    const container = document.getElementById('dailyRoutine');
    if (!container || !weekSchedule || !weekSchedule.daily_routine) return;

    const items = weekSchedule.daily_routine.map(item =>
        `<span class="daily-routine-item">📱 ${item}</span>`
    ).join('');

    container.innerHTML = `
        <span class="daily-routine-label">Каждый день:</span>
        ${items}
    `;
}

// Render week calendar
function renderWeekCalendar() {
    const container = document.getElementById('weekCalendar');
    if (!container || !weekSchedule) return;

    const dayNames = {
        monday: 'Пн',
        tuesday: 'Вт',
        wednesday: 'Ср',
        thursday: 'Чт',
        friday: 'Пт',
        saturday: 'Сб',
        sunday: 'Вс'
    };

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const today = new Date().getDay();
    const todayKey = dayOrder[today === 0 ? 6 : today - 1];

    container.innerHTML = '';

    dayOrder.forEach(day => {
        const schedule = weekSchedule.schedule[day];
        const project = schedule.project ? weekSchedule.projects[schedule.project] : null;
        const isToday = day === todayKey;

        const borderColor = project ? project.color : '#e9ecef';

        const card = document.createElement('div');
        card.className = `day-card ${isToday ? 'today' : ''} ${project ? 'has-project' : ''}`;
        card.style.borderLeftColor = borderColor;

        card.innerHTML = `
            <div class="day-name">${dayNames[day]}</div>
            ${schedule.emoji ? `<div class="day-emoji">${schedule.emoji}</div>` : ''}
            <div class="day-project">${schedule.title || '—'}</div>
        `;

        container.appendChild(card);
    });
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

    // Sort tasks: active first, then completed by completed_at DESC (recent first)
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'active' ? -1 : 1;
        }
        if (a.status === 'completed' && b.status === 'completed') {
            const dateA = new Date(a.completed_at || a.created_at);
            const dateB = new Date(b.completed_at || b.created_at);
            return dateB - dateA; // DESC: newer first
        }
        return 0;
    });

    sortedTasks.forEach(task => {
        const goal = goals.find(g => g.id === task.goalId);
        const goalBadge = goal ? `<span class="badge bg-info">${goal.title}</span>` : '';

        // Project badge
        let projectBadge = '';
        if (task.project && weekSchedule && weekSchedule.projects[task.project]) {
            const proj = weekSchedule.projects[task.project];
            projectBadge = `<span class="project-badge" style="background-color: ${proj.color}">${proj.title}</span>`;
        }

        // Schedule badge
        let scheduleBadge = '';
        if (task.schedule === 'weekly' && task.end_date) {
            const endDate = new Date(task.end_date);
            const today = new Date();
            const weeksLeft = Math.ceil((endDate - today) / (7 * 24 * 60 * 60 * 1000));
            const remaining = task.progress_total - task.progress;
            scheduleBadge = `<span class="badge bg-secondary ms-2">📅 ${remaining} нед. осталось • до ${endDate.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})}</span>`;
        }

        // Progress bar for tasks with progress tracking
        let progressBar = '';
        if (task.progress !== undefined && task.progress_total !== undefined) {
            const percent = Math.round((task.progress / task.progress_total) * 100);
            const weekLabel = task.schedule === 'weekly' ? 'Неделя' : 'Прогресс';
            progressBar = `
                <div class="mt-2">
                    <div class="d-flex justify-content-between small mb-1">
                        <span>${weekLabel}</span>
                        <span class="fw-bold">${task.progress} / ${task.progress_total}</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar bg-success" role="progressbar"
                             style="width: ${percent}%"
                             aria-valuenow="${task.progress}"
                             aria-valuemin="0"
                             aria-valuemax="${task.progress_total}">
                        </div>
                    </div>
                </div>
            `;
        }

        const card = `
            <div class="card task-item mb-2 ${task.status === 'completed' ? 'completed' : ''}">
                <div class="card-body">
                    <h6 class="mb-1">${task.title}</h6>
                    ${task.description ? `<p class="text-muted small mb-1">${task.description}</p>` : ''}
                    ${projectBadge}
                    ${scheduleBadge}
                    ${goalBadge}
                    ${task.status === 'completed' ? '<span class="badge bg-success ms-2">Выполнено</span>' : ''}
                    ${progressBar}
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Render ideas
function renderIdeas() {
    const container = document.getElementById('ideasList');
    if (!container) return;
    container.innerHTML = '';

    ideas.forEach(idea => {
        const card = `
            <div class="card task-item mb-2 ${idea.status === 'completed' ? 'completed' : ''}">
                <div class="card-body">
                    <h6 class="mb-1">${idea.title}</h6>
                    ${idea.description ? `<p class="text-muted small mb-1">${idea.description}</p>` : ''}
                    ${idea.status === 'completed' ? '<span class="badge bg-success">Выполнено</span>' : ''}
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}
