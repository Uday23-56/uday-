class GoalTracker {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('dailyGoals')) || [];
        this.completedGoals = JSON.parse(localStorage.getItem('completedGoals')) || [];
        this.currentDate = new Date().toDateString();
        
        this.initializeApp();
        this.bindEvents();
        this.renderGoals();
        this.updateStats();
    }

    initializeApp() {
        if (this.goals.length > 0) {
            const firstGoal = this.goals[0];
            if (firstGoal.date !== this.currentDate) {
                this.goals = [];
                this.completedGoals = [];
                this.saveToLocalStorage();
            }
        }
    }

    bindEvents() {
        const goalForm = document.getElementById('goalForm');
        const categoryFilter = document.getElementById('categoryFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        goalForm.addEventListener('submit', (e) => this.handleAddGoal(e));
        categoryFilter.addEventListener('change', () => this.filterGoals());
        priorityFilter.addEventListener('change', () => this.filterGoals());
    }

    handleAddGoal(e) {
        e.preventDefault();
        
        const title = document.getElementById('goalTitle').value.trim();
        const category = document.getElementById('goalCategory').value;
        const priority = document.getElementById('goalPriority').value;
        const description = document.getElementById('goalDescription').value.trim();

        if (!title || !category || !priority) {
            alert('Please fill in all required fields');
            return;
        }

        const newGoal = {
            id: Date.now(),
            title,
            category,
            priority,
            description,
            date: this.currentDate,
            progress: 0,
            createdAt: new Date().toISOString()
        };

        this.goals.push(newGoal);
        this.saveToLocalStorage();
        this.renderGoals();
        this.updateStats();
        
        e.target.reset();
        alert('Goal added successfully!');
    }

    renderGoals() {
        const goalsList = document.getElementById('goalsList');
        const completedGoalsList = document.getElementById('completedGoalsList');

        if (this.goals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <h3>No goals set for today</h3>
                    <p>Add your first goal to get started!</p>
                </div>
            `;
        } else {
            goalsList.innerHTML = this.goals
                .map(goal => this.createGoalHTML(goal))
                .join('');
        }

        if (this.completedGoals.length === 0) {
            completedGoalsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <h3>No completed goals yet</h3>
                    <p>Complete some goals to see them here!</p>
                </div>
            `;
        } else {
            completedGoalsList.innerHTML = this.completedGoals
                .map(goal => this.createCompletedGoalHTML(goal))
                .join('');
        }
    }

    createGoalHTML(goal) {
        const priorityClass = `priority-${goal.priority}`;
        const progressPercentage = goal.progress;
        
        return `
            <div class="goal-item ${priorityClass}" data-id="${goal.id}">
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-actions">
                        <button class="btn btn-complete" onclick="goalTracker.completeGoal(${goal.id})">
                            <i class="fas fa-check"></i> Complete
                        </button>
                        <button class="btn btn-edit" onclick="goalTracker.editGoal(${goal.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="goalTracker.deleteGoal(${goal.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="goal-meta">
                    <span class="goal-category">${goal.category}</span>
                    <span class="goal-priority ${goal.priority}">${goal.priority}</span>
                </div>
                ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
                <div class="goal-progress">
                    <span>Progress: ${progressPercentage}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <button class="btn btn-edit" onclick="goalTracker.updateProgress(${goal.id})">
                        <i class="fas fa-plus"></i> Update
                    </button>
                </div>
            </div>
        `;
    }

    createCompletedGoalHTML(goal) {
        return `
            <div class="completed-goal-item">
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-actions">
                        <button class="btn btn-delete" onclick="goalTracker.deleteCompletedGoal(${goal.id})">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
                <div class="goal-meta">
                    <span class="goal-category">${goal.category}</span>
                    <span class="goal-priority ${goal.priority}">${goal.priority}</span>
                    <span>Completed: ${new Date(goal.completedAt).toLocaleTimeString()}</span>
                </div>
                ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
            </div>
        `;
    }

    completeGoal(goalId) {
        const goalIndex = this.goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return;

        const goal = this.goals[goalIndex];
        goal.completedAt = new Date().toISOString();
        
        this.completedGoals.push(goal);
        this.goals.splice(goalIndex, 1);
        
        this.saveToLocalStorage();
        this.renderGoals();
        this.updateStats();
        
        alert('Goal completed! Great job!');
    }

    editGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const newTitle = prompt('Edit goal title:', goal.title);
        if (newTitle === null) return;

        const newCategory = prompt('Edit category (work/health/learning/personal/fitness):', goal.category);
        if (newCategory === null) return;

        const newPriority = prompt('Edit priority (low/medium/high):', goal.priority);
        if (newPriority === null) return;

        const newDescription = prompt('Edit description:', goal.description);

        goal.title = newTitle.trim();
        goal.category = newCategory.trim();
        goal.priority = newPriority.trim();
        goal.description = newDescription ? newDescription.trim() : '';

        this.saveToLocalStorage();
        this.renderGoals();
        this.updateStats();
        
        alert('Goal updated successfully!');
    }

    updateProgress(goalId) {
        const goalIndex = this.goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return;

        const newProgress = Math.min(100, this.goals[goalIndex].progress + 25);
        this.goals[goalIndex].progress = newProgress;

        this.saveToLocalStorage();
        this.renderGoals();
        this.updateStats();

        if (newProgress === 100) {
            alert('Goal progress updated to 100%!');
        } else {
            alert(`Progress updated to ${newProgress}%`);
        }
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveToLocalStorage();
            this.renderGoals();
            this.updateStats();
        }
    }

    deleteCompletedGoal(goalId) {
        if (confirm('Are you sure you want to remove this completed goal?')) {
            this.completedGoals = this.completedGoals.filter(g => g.id !== goalId);
            this.saveToLocalStorage();
            this.renderGoals();
            this.updateStats();
        }
    }

    filterGoals() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;

        let filteredGoals = this.goals;

        if (categoryFilter) {
            filteredGoals = filteredGoals.filter(g => g.category === categoryFilter);
        }

        if (priorityFilter) {
            filteredGoals = filteredGoals.filter(g => g.priority === priorityFilter);
        }

        const goalsList = document.getElementById('goalsList');
        
        if (filteredGoals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No goals match your filters</h3>
                    <p>Try adjusting your filter criteria</p>
                </div>
            `;
        } else {
            goalsList.innerHTML = filteredGoals
                .map(goal => this.createGoalHTML(goal))
                .join('');
        }
    }

    updateStats() {
        const totalGoals = this.goals.length;
        const completedCount = this.completedGoals.length;
        const completionRate = totalGoals + completedCount > 0 
            ? Math.round((completedCount / (totalGoals + completedCount)) * 100) 
            : 0;

        document.getElementById('totalGoals').textContent = totalGoals;
        document.getElementById('completedGoals').textContent = completedCount;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
    }

    saveToLocalStorage() {
        localStorage.setItem('dailyGoals', JSON.stringify(this.goals));
        localStorage.setItem('completedGoals', JSON.stringify(this.completedGoals));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.goalTracker = new GoalTracker();
});
