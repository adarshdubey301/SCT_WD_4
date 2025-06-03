let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;
let selectedPriority = 'medium';
let selectedCategory = 'personal';
let currentTheme = 'default';
let searchQuery = '';

const motivationalQuotes = [
    "You've got this! 💪",
    "Every task completed is a step towards greatness! 🌟",
    "Progress, not perfection! 🚀",
    "You're unstoppable today! ⚡",
    "Small steps lead to big achievements! 🎯",
    "Believe in your amazing abilities! ✨",
    "You're doing incredible work! 🔥",
    "Keep pushing forward, champion! 🏆"
];

document.addEventListener('DOMContentLoaded', function() {
    createFloatingParticles();
    loadTasks();
    updateStats();
    renderTasks();
    updateProgress();
    
    document.getElementById('taskDate').valueAsDate = new Date();
    
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    setInterval(saveTasks, 30000);
});

function createFloatingParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 6 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

function changeTheme(theme) {
    const themes = {
        default: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        sunset: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 25%, #ff8a65 50%, #ffab40 75%, #ff7043 100%)',
        ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 25%, #43e97b 50%, #38f9d7 75%, #4facfe 100%)',
        forest: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 25%, #667eea 50%, #764ba2 75%, #43e97b 100%)',
        candy: 'linear-gradient(135deg, #fa709a 0%, #fee140 25%, #f093fb 50%, #f5576c 75%, #fa709a 100%)'
    };
    
    document.body.style.background = themes[theme];
    document.body.style.backgroundSize = '400% 400%';
    currentTheme = theme;

    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    showCelebration('🎨');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const toggle = document.querySelector('.dark-mode-toggle');
    toggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

function selectPriority(priority) {
    selectedPriority = priority;
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

function selectCategory(category) {
    selectedCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const taskTime = document.getElementById('taskTime');
    const taskNotes = document.getElementById('taskNotes');
    
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        shakeElement(taskInput);
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: selectedPriority,
        category: selectedCategory,
        date: taskDate.value || new Date().toISOString().split('T')[0],
        time: taskTime.value || '',
        notes: taskNotes.value.trim(),
        createdAt: new Date().toLocaleString()
    };

    if (editingTaskId) {
        const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...task, id: editingTaskId };
        }
        editingTaskId = null;
        document.querySelector('.add-btn').innerHTML = 'Add Magic ✨';
    } else {
        tasks.unshift(task);
        showCelebration('🎉');
    }

    taskInput.value = '';
    taskNotes.value = '';
    taskTime.value = '';
    
    saveTasks();
    updateStats();
    updateProgress();
    renderTasks();
    taskInput.focus();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this amazing task? 🗑️')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        updateStats();
        updateProgress();
        renderTasks();
        showCelebration('👋');
    }
}

function duplicateTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        const duplicatedTask = {
            ...task,
            id: Date.now(),
            text: task.text + ' (Copy)',
            completed: false,
            createdAt: new Date().toLocaleString()
        };
        tasks.unshift(duplicatedTask);
        saveTasks();
        updateStats();
        updateProgress();
        renderTasks();
        showCelebration('📋');
    }
}

function toggleComplete(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        updateStats();
        updateProgress();
        renderTasks();
        
        if (task.completed) {
            showCelebration('🎊');
            setTimeout(() => generateMotivation(), 500);
        }
    }
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        document.getElementById('taskInput').value = task.text;
        document.getElementById('taskDate').value = task.date;
        document.getElementById('taskTime').value = task.time;
        document.getElementById('taskNotes').value = task.notes || '';
      
        selectedPriority = task.priority;
        selectedCategory = task.category;
        
        document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`.priority-${task.priority}`).classList.add('selected');
        
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[onclick="selectCategory('${task.category}')"]`).classList.add('selected');
        
        editingTaskId = id;
        document.querySelector('.add-btn').innerHTML = '📝 Update Task';
        document.getElementById('taskInput').focus();
    }
}

function searchTasks() {
    searchQuery = document.getElementById('searchInput').value.toLowerCase();
    renderTasks();
}

function filterTasks(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderTasks();
}

function renderTasks() {
    const todoList = document.getElementById('todoList');
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchQuery) || 
                            task.notes.toLowerCase().includes(searchQuery) ||
                            task.category.toLowerCase().includes(searchQuery);
        
        if (!matchesSearch) return false;

        switch (currentFilter) {
            case 'completed': return task.completed;
            case 'pending': return !task.completed;
            case 'today': return task.date === new Date().toISOString().split('T')[0];
            case 'high': return task.priority === 'high';
            default: return true;
        }
    });

    if (filteredTasks.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <div class="emoji">${getEmptyStateEmoji()}</div>
                <h3>${getEmptyStateTitle()}</h3>
                <p>${getEmptyStateMessage()}</p>
            </div>
        `;
        return;
    }

    todoList.innerHTML = filteredTasks.map(task => `
        <div class="todo-item ${task.completed ? 'completed' : ''} priority-${task.priority}">
            <div class="todo-header">
                <div class="todo-text">${escapeHtml(task.text)}</div>
                <div class="priority-badge priority-${task.priority}">
                    ${getPriorityIcon(task.priority)} ${task.priority.toUpperCase()}
                </div>
            </div>
            <div class="todo-meta">
                <span>📂 ${getCategoryIcon(task.category)} ${task.category}</span>
                <span>📅 ${formatDate(task.date)}</span>
                ${task.time ? `<span>⏰ ${task.time}</span>` : ''}
                <span>📝 ${task.createdAt}</span>
                ${task.notes ? `<span>💭 ${escapeHtml(task.notes)}</span>` : ''}
            </div>
            <div class="todo-actions">
                <button class="action-btn complete-btn" onclick="toggleComplete(${task.id})">
                    ${task.completed ? '↩️ Undo' : '✅ Complete'}
                </button>
                <button class="action-btn edit-btn" onclick="editTask(${task.id})">
                    📝 Edit
                </button>
                <button class="action-btn duplicate-btn" onclick="duplicateTask(${task.id})">
                    📋 Duplicate
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const today = tasks.filter(task => task.date === new Date().toISOString().split('T')[0]).length;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('todayTasks').textContent = today;
    document.getElementById('productivityScore').textContent = productivity + '%';
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    document.getElementById('progressFill').style.width = percentage + '%';
    
    let progressMessage = '';
    if (percentage === 0) {
        progressMessage = "Ready to start your productive day! 🌟";
    } else if (percentage < 25) {
        progressMessage = "Great start! Keep going! 🚀";
    } else if (percentage < 50) {
        progressMessage = "You're building momentum! 💪";
    } else if (percentage < 75) {
        progressMessage = "More than halfway there! ⚡";
    } else if (percentage < 100) {
        progressMessage = "Almost there, champion! 🏆";
    } else {
        progressMessage = "Perfect! You're unstoppable! 🎉";
    }
    
    document.getElementById('progressText').textContent = progressMessage;
}

function exportTasks(format) {
    if (tasks.length === 0) {
        alert('No tasks to export! Add some tasks first. 📝');
        return;
    }

    let content = '';
    const fileName = `my-awesome-tasks-${new Date().toISOString().split('T')[0]}`;

    if (format === 'txt') {
        content = '✨ MY AWESOME TO-DO LIST ✨\n';
        content += '='.repeat(40) + '\n\n';
        
        tasks.forEach((task, index) => {
            content += `${index + 1}. ${task.completed ? '✅' : '⏳'} ${task.text}\n`;
            content += `   Priority: ${getPriorityIcon(task.priority)} ${task.priority.toUpperCase()}\n`;
            content += `   Category: ${getCategoryIcon(task.category)} ${task.category}\n`;
            content += `   Date: ${task.date} ${task.time || ''}\n`;
            if (task.notes) content += `   Notes: ${task.notes}\n`;
            content += `   Created: ${task.createdAt}\n\n`;
        });
        
        downloadFile(content, fileName + '.txt', 'text/plain');
    } else if (format === 'json') {
        content = JSON.stringify(tasks, null, 2);
        downloadFile(content, fileName + '.json', 'application/json');
    }
    
    showCelebration('📤');
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearAllTasks() {
    if (confirm('Are you sure you want to clear all tasks? This cannot be undone! 🗑️')) {
        tasks = [];
        saveTasks();
        updateStats();
        updateProgress();
        renderTasks();
        showCelebration('🧹');
    }
}

function generateMotivation() {
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    showCelebration(quote);
   
    const completedTasks = document.querySelectorAll('.todo-item.completed');
    if (completedTasks.length > 0) {
        const randomTask = completedTasks[Math.floor(Math.random() * completedTasks.length)];
        randomTask.classList.add('wiggle');
        setTimeout(() => randomTask.classList.remove('wiggle'), 800);
    }
}

function saveTasks() {

}

function loadTasks() {

    tasks = [
        {
            id: 1,
            text: "Welcome to your Ultimate To-Do Master! 🎉",
            completed: false,
            priority: 'high',
            category: 'personal',
            date: new Date().toISOString().split('T')[0],
            time: "09:00",
            notes: "This is your productivity command center!",
            createdAt: new Date().toLocaleString()
        },
        {
            id: 2,
            text: "Explore all the amazing features ⭐",
            completed: false,
            priority: 'medium',
            category: 'learning',
            date: new Date().toISOString().split('T')[0],
            time: "10:00",
            notes: "Try different priorities, categories, and themes!",
            createdAt: new Date().toLocaleString()
        },
        {
            id: 3,
            text: "Complete your first task for motivation! 💪",
            completed: true,
            priority: 'low',
            category: 'fun',
            date: new Date().toISOString().split('T')[0],
            time: "11:00",
            notes: "You'll get a celebration!",
            createdAt: new Date().toLocaleString()
        }
    ];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today 🌟';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow 🌅';
    } else {
        return date.toLocaleDateString() + ' 📅';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPriorityIcon(priority) {
    const icons = { high: '🔥', medium: '⚡', low: '🌱' };
    return icons[priority] || '⚡';
}

function getCategoryIcon(category) {
    const icons = {
        personal: '👤',
        work: '💼',
        health: '❤️',
        learning: '📚',
        fun: '🎉'
    };
    return icons[category] || '📂';
}

function getEmptyStateEmoji() {
    const emojis = {
        all: '🎯',
        pending: '⏳',
        completed: '🎉',
        today: '📅',
        high: '🔥'
    };
    return emojis[currentFilter] || '🎯';
}

function getEmptyStateTitle() {
    const titles = {
        all: 'Ready for greatness!',
        pending: 'No pending tasks!',
        completed: 'No completed tasks yet!',
        today: 'No tasks for today!',
        high: 'No high priority tasks!'
    };
    return titles[currentFilter] || 'Ready for greatness!';
}

function getEmptyStateMessage() {
    const messages = {
        all: 'Add your first task and start your productive journey',
        pending: 'All tasks completed! You\'re amazing! 🎉',
        completed: 'Complete some tasks to see your achievements here',
        today: 'Add some tasks for today to stay organized',
        high: 'No urgent tasks right now - great job staying on top of things!'
    };
    return messages[currentFilter] || 'Add your first task and start your productive journey';
}

function showCelebration(content) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.innerHTML = content;
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        if (document.body.contains(celebration)) {
            document.body.removeChild(celebration);
        }
    }, 1500);
}

function shakeElement(element) {
    element.classList.add('wiggle');
    setTimeout(() => element.classList.remove('wiggle'), 800);
}
