document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const viewHistoryButton = document.getElementById('viewHistoryButton');
    const backupButton = document.getElementById('backupButton');
    const confirmBackupButton = document.getElementById('confirmBackupButton');
    const cancelBackupButton = document.getElementById('cancelBackupButton');
    const closeHistoryButton = document.getElementById('closeHistoryButton');
    const closeConfirmationButton = document.getElementById('closeConfirmationButton');
    const historyModal = document.getElementById('historyModal');
    const backupModal = document.getElementById('backupModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const currentDate = document.getElementById('currentDate');
    const currentTime = document.getElementById('currentTime');
    const toggleDeleteModeButton = document.getElementById('toggleDeleteModeButton');
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');
    const historyList = document.getElementById('historyList');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let deleteMode = false;

    const renderDate = () => {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = today.toLocaleDateString('de-DE', options);
    };

    const renderTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTime.textContent = `${hours}:${minutes}:${seconds}`;
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = `${task.text} (Erstellt am: ${task.createdDate})`;
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
        if (history.length === 0) {
            historyList.innerHTML = '<li>Keine erledigten Aufgaben vorhanden.</li>';
        } else {
            history.forEach(task => {
                const li = document.createElement('li');
                li.textContent = `${task.text} - Erledigt am: ${task.completedDate || 'Datum unbekannt'}`;
                historyList.appendChild(li);
            });
        }
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
            const today = new Date().toLocaleDateString('de-DE');
            tasks.push({ text: taskInput.value.trim(), completed: false, createdDate: today });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    };

    const checkDateChange = () => {
        const today = new Date().toLocaleDateString('de-DE');
        tasks.forEach((task, index) => {
            if (task.createdDate !== today) {
                if (task.completed) {
                    history.push(task); // Erledigte Aufgaben in den Verlauf verschieben
                    tasks.splice(index, 1); // Entferne erledigte Aufgaben von der Hauptliste
                } else {
                    task.createdDate = today; // Aktualisiere das Erstellungsdatum für nicht erledigte Aufgaben
                }
            }
        });
        saveTasks();
        renderTasks();
    };

    const toggleDeleteMode = () => {
        deleteMode = !deleteMode;
        toggleDeleteModeButton.textContent = deleteMode ? 'Löschmodus beenden' : 'Löschmodus';
        deleteSelectedButton.classList.toggle('hidden', !deleteMode);

        // Entfernt die Markierung der Aufgaben nach Beendigung des Löschmodus
        if (!deleteMode) {
            tasks.forEach((task, index) => {
                task.selectedForDelete = false;
                taskList.children[index].classList.remove('selected-for-delete');
            });
        }
    };

    const deleteSelectedTasks = () => {
        tasks = tasks.filter(task => !task.selectedForDelete);
        saveTasks();
        renderTasks();
        toggleDeleteMode(); // Beendet den Löschmodus nach dem Löschen
    };

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('history', JSON.stringify(history));
    };

    const openHistoryModal = () => {
        renderHistory();
        historyModal.style.display = 'flex';
    };

    const closeHistoryModal = () => {
        historyModal.style.display = 'none';
    };

    const openBackupModal = () => {
        backupModal.style.display = 'flex';
    };

    const closeBackupModal = () => {
        backupModal.style.display = 'none';
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
        confirmationModal.style.display = 'flex';
    };

    const closeConfirmationModal = () => {
        confirmationModal.style.display = 'none';
    };

    const checkForNewDay = () => {
        const today = new Date().toLocaleDateString('de-DE');
        const lastCheckDate = localStorage.getItem('lastCheckDate') || today;

        if (lastCheckDate !== today) {
            checkDateChange(); // Überprüfe, ob der Tag gewechselt hat
            localStorage.setItem('lastCheckDate', today);
        }
    };

    addTaskButton.addEventListener('click', addTask);
    viewHistoryButton.addEventListener('click', openHistoryModal);
    backupButton.addEventListener('click', openBackupModal);
    confirmBackupButton.addEventListener('click', createBackup);
    cancelBackupButton.addEventListener('click', closeBackupModal);
    closeHistoryButton.addEventListener('click', closeHistoryModal);
    closeConfirmationButton.addEventListener('click', closeConfirmationModal);
    toggleDeleteModeButton.addEventListener('click', toggleDeleteMode);
    deleteSelectedButton.addEventListener('click', deleteSelectedTasks);

    renderDate();
    renderTime();
    setInterval(renderTime, 1000); // Aktualisiert die Uhr jede Sekunde
    renderTasks();
    setInterval(checkForNewDay, 60000); // Überprüft alle 60 Sekunden, ob ein neuer Tag begonnen hat
    checkForNewDay(); // Überprüft das Datum bei jedem Start der App
});
