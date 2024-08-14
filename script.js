document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const newDayButton = document.getElementById('newDayButton');
    const backupButton = document.getElementById('backupButton');
    const confirmBackupButton = document.getElementById('confirmBackupButton');
    const cancelBackupButton = document.getElementById('cancelBackupButton');
    const closeConfirmationButton = document.getElementById('closeConfirmationButton');
    const backupModal = document.getElementById('backupModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const currentDate = document.getElementById('currentDate');
    const toggleDeleteModeButton = document.getElementById('toggleDeleteModeButton');
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let deleteMode = false;
    let currentDesign = 1;

    const renderDate = () => {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = today.toLocaleDateString('de-DE', options);
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task.text;
            li.className = task.completed ? 'completed' : '';
            li.dataset.date = task.completed ? `Erledigt am: ${task.completedDate}` : '';
            li.addEventListener('click', () => toggleTaskCompletion(index));
            if (task.selectedForDelete) {
                li.classList.add('selected-for-delete');
            }
            taskList.appendChild(li);
        });
    };

    const renderHistory = () => {
        historyList.innerHTML = '';
        history.forEach(task => {
            const li = document.createElement('li');
            li.textContent = `${task.text} - Erledigt am: ${task.completedDate || 'Datum unbekannt'}`;
            historyList.appendChild(li);
        });
    };

    const toggleTaskCompletion = (index) => {
        if (!deleteMode) {
            tasks[index].completed = !tasks[index].completed;
            if (tasks[index].completed) {
                tasks[index].completedDate = new Date().toLocaleDateString('de-DE');
            } else {
                delete tasks[index].completedDate;
            }
            saveTasks();
            renderTasks();
        } else {
            tasks[index].selectedForDelete = !tasks[index].selectedForDelete;
            taskList.children[index].classList.toggle('selected-for-delete');
        }
    };

    const addTask = () => {
        if (taskInput.value.trim() !== '') {
            tasks.push({ text: taskInput.value.trim(), completed: false });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    };

    const startNewDay = () => {
        const completedTasks = tasks.filter(task => task.completed);
        history = history.concat(completedTasks);
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        renderHistory();
    };

    const toggleDeleteMode = () => {
        deleteMode = !deleteMode;
        toggleDeleteModeButton.textContent = deleteMode ? 'Löschmodus beenden' : 'Löschmodus';
        deleteSelectedButton.classList.toggle('hidden', !deleteMode);
    };

    const deleteSelectedTasks = () => {
        tasks = tasks.filter(task => !task.selectedForDelete);
        saveTasks();
        renderTasks();
        toggleDeleteMode();
    };

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('history', JSON.stringify(history));
    };

    const scheduleNextDayCheck = () => {
        const now = new Date();
        const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
        setTimeout(() => {
            startNewDay();
            scheduleNextDayCheck(); // Reschedule for the next day
        }, msUntilMidnight);
    };

    const openBackupModal = () => {
        backupModal.classList.remove('hidden');
    };

    const closeBackupModal = () => {
        backupModal.classList.add('hidden');
    };

    const createBackup = () => {
        const backupContent = history.map(task => `• ${task.text}\n   - Erledigt am: ${task.completedDate || 'Datum unbekannt'}`).join('\n\n');
        const formattedBackup = `Erledigte Aufgaben:\n\n${backupContent}`;
        const blob = new Blob([formattedBackup], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_erledigte_aufgaben_${new Date().toLocaleDateString('de-DE')}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        closeBackupModal();
        showConfirmationModal();
    };

    const showConfirmationModal = () => {
        confirmationModal.classList.remove('hidden');
    };

    const closeConfirmationModal = () => {
        confirmationModal.classList.add('hidden');
    };

    const changeDesign = () => {
        document.body.classList.remove(
            `fire-theme`, `galaxy-theme`, `dark-theme`, `minimal-theme`, `ocean-theme`, 
            `forest-theme`, `luxury-theme`, `neon-theme`, `futuristic-theme`, `antique-theme`
        );
        currentDesign = currentDesign === 10 ? 1 : currentDesign + 1;
        const designClass = [
            'fire-theme', 'galaxy-theme', 'dark-theme', 'minimal-theme', 'ocean-theme', 
            'forest-theme', 'luxury-theme', 'neon-theme', 'futuristic-theme', 'antique-theme'
        ][currentDesign - 1];
        document.body.classList.add(designClass);
    };

    addTaskButton.addEventListener('click', addTask);
    newDayButton.addEventListener('click', startNewDay);
    backupButton.addEventListener('click', openBackupModal);
    confirmBackupButton.addEventListener('click', createBackup);
    cancelBackupButton.addEventListener('click', closeBackupModal);
    closeConfirmationButton.addEventListener('click', closeConfirmationModal);
    toggleDeleteModeButton.addEventListener('click', toggleDeleteMode);
    deleteSelectedButton.addEventListener('click', deleteSelectedTasks);
    changeDesignButton.addEventListener('click', changeDesign);

    renderDate();
    renderTasks();
    renderHistory();
    scheduleNextDayCheck(); // Start the first check for midnight
});
