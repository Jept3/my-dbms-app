// Frontend JavaScript - handles UI interactions and API calls

const API_URL = '/api';

// Load tasks when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add task form
    document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
    
    // Edit task form
    document.getElementById('editTaskForm').addEventListener('submit', handleEditTask);
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('editModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Load all tasks
async function loadTasks() {
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const tasksList = document.getElementById('tasksList');
    
    try {
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        
        const response = await fetch(`${API_URL}/tasks`);
        
        if (!response.ok) {
            throw new Error('Failed to load tasks');
        }
        
        const tasks = await response.json();
        
        loadingMessage.style.display = 'none';
        
        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p>No tasks yet. Add your first task above!</p>
                </div>
            `;
            return;
        }
        
        displayTasks(tasks);
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        loadingMessage.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Error loading tasks. Please refresh the page.';
    }
}

// Display tasks
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item">
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <span class="task-status ${task.status}">${formatStatus(task.status)}</span>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                Created: ${formatDate(task.created_at)}
            </div>
            <div class="task-actions">
                <button class="btn btn-edit" onclick="openEditModal(${task.id}, '${escapeHtml(task.title)}', '${escapeHtml(task.description || '')}', '${task.status}')">
                    Edit
                </button>
                <button class="btn btn-delete" onclick="deleteTask(${task.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Handle add task
async function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const status = document.getElementById('taskStatus').value;
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        
        // Clear form
        document.getElementById('addTaskForm').reset();
        
        // Reload tasks
        await loadTasks();
        
        showMessage('Task added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding task:', error);
        showMessage('Error adding task. Please try again.', 'error');
    }
}

// Open edit modal
function openEditModal(id, title, description, status) {
    document.getElementById('editTaskId').value = id;
    document.getElementById('editTaskTitle').value = title;
    document.getElementById('editTaskDescription').value = description;
    document.getElementById('editTaskStatus').value = status;
    
    document.getElementById('editModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Handle edit task
async function handleEditTask(e) {
    e.preventDefault();
    
    const id = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const status = document.getElementById('editTaskStatus').value;
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        closeModal();
        await loadTasks();
        showMessage('Task updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating task:', error);
        showMessage('Error updating task. Please try again.', 'error');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        await loadTasks();
        showMessage('Task deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting task:', error);
        showMessage('Error deleting task. Please try again.', 'error');
    }
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '1001';
    messageDiv.style.minWidth = '250px';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
