document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const viewHistoryButton = document.getElementById('viewHistoryButton');
    const saveTasksButton = document.getElementById('saveTasksButton');
    const backupButton = document.getElementById('backupButton');
    const confirmBackupButton = document.getElementById('confirmBackupButton');
    const cancelBackupButton = document.getElementById('cancelBackupButton');
    const closeHistoryButton = document.getElementById('closeHistoryButton');
    const closeConfirmationButton = document.getElementById('closeConfirmationButton');
    const historyModal = document.getElementById('historyModal');
    const backupModal = document.getElementById('backupModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const saveTasksModal = document.getElementById('saveTasksModal');
    const confirmSaveButton = document.getElementById('confirmSaveButton');
    const cancelSaveButton = document.getElementById('cancelSaveButton');
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

    const saveCompletedTasks = () => {
        const completedTasks = tasks.filter(task => task.completed);
        if (completedTasks.length > 0) {
            completedTasks.forEach(task => {
                task.completedDate = new Date().toLocaleDateString('de-DE');
            });
            history = history.concat(completedTasks);
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }
    };

    const toggleDeleteMode = () => {
        deleteMode = !deleteMode;
        if (deleteMode) {
            toggleDeleteModeButton.textContent = 'Löschen';
        } else {
            toggleDeleteModeButton.textContent = 'Löschmodus';
            deleteSelectedTasks();
        }
    };

    const deleteSelectedTasks = () => {
        tasks = tasks.filter(task => !task.selectedForDelete);
        saveTasks();
        renderTasks();
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

    const openSaveTasksModal = () => {
        saveTasksModal.style.display = 'flex';
    };

    const closeSaveTasksModal = () => {
        saveTasksModal.style.display = 'none';
    };

    const createBackup = () => {
        if (history.length > 0) {
            const backupContent = history.map(task => `• ${task.text}\n   - Erledigt am: ${task.completedDate || 'Datum unbekannt'}`).join('\n\n');
            const formattedBackup = `Erledigte Aufgaben:\n\n${backupContent}`;
            const blob = new Blob([formattedBackup], { type: 'text/plain;charset=utf-8' });

            // Create a download link and trigger the download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_erledigte_aufgaben_${new Date().toLocaleDateString('de-DE')}.txt`;

            // Append to the body, click and remove the link (cross-device solution)
            document.body.appendChild(link);

            setTimeout(() => {
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100); // 100ms Verzögerung, um den Download auf mobilen Geräten zu unterstützen

        } else {
            alert('Keine erledigten Aufgaben zum Sichern.');
        }
        closeBackupModal();
        showConfirmationModal();
    };

    const showConfirmationModal = () => {
        confirmationModal.style.display = 'flex';
    };

    const closeConfirmationModal = () => {
        confirmationModal.style.display = 'none';
    };

    addTaskButton.addEventListener('click', addTask);
    viewHistoryButton.addEventListener('click', openHistoryModal);
    saveTasksButton.addEventListener('click', openSaveTasksModal);
    confirmSaveButton.addEventListener('click', () => {
        saveCompletedTasks();
        closeSaveTasksModal();
    });
    cancelSaveButton.addEventListener('click', closeSaveTasksModal);
    backupButton.addEventListener('click', openBackupModal);
    confirmBackupButton.addEventListener('click', createBackup);
    cancelBackupButton.addEventListener('click', closeBackupModal);
    closeHistoryButton.addEventListener('click', closeHistoryModal);
    closeConfirmationButton.addEventListener('click', closeConfirmationModal);
    toggleDeleteModeButton.addEventListener('click', toggleDeleteMode);

    renderDate();
    renderTime();
    setInterval(renderTime, 1000); // Aktualisiert die Uhr jede Sekunde
    renderTasks();
});









const isWebView = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (/wv/.test(userAgent) || /Android.*Version\/[\d.]+.*Chrome\/[\.0-9]* Mobile/.test(userAgent));
};

const createBackup = () => {
    if (history.length > 0) {
        const backupContent = history.map(task => `• ${task.text}\n   - Erledigt am: ${task.completedDate || 'Datum unbekannt'}`).join('\n\n');
        const formattedBackup = `Erledigte Aufgaben:\n\n${backupContent}`;
        const blob = new Blob([formattedBackup], { type: 'text/plain;charset=utf-8' });

        if (isWebView()) {
            // Redirect to download page
            const url = URL.createObjectURL(blob);
            window.location.href = url;
            alert("Du wirst nun zu einer Seite weitergeleitet, um das Backup herunterzuladen.");
        } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_erledigte_aufgaben_${new Date().toLocaleDateString('de-DE')}.txt`;

            document.body.appendChild(link);

            setTimeout(() => {
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100); 
        }
    } else {
        alert('Keine erledigten Aufgaben zum Sichern.');
    }
    closeBackupModal();
    showConfirmationModal();
};
