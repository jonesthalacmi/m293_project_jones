document.addEventListener('DOMContentLoaded', () => {
    const addItemButton = document.getElementById('add-item');
    const newItemInput = document.getElementById('new-item');
    const todoList = document.getElementById('todo-list');
    const listSelector = document.getElementById('list-selector');
    const addListButton = document.getElementById('add-list');
    const calendar = document.getElementById('calendar');
    const modal = document.getElementById('item-modal');
    const modalText = document.getElementById('modal-text');
    const closeModal = document.getElementsByClassName('close')[0];
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const currentMonthYear = document.getElementById('current-month-year');

    const editModal = document.getElementById('edit-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const editItemInput = document.getElementById('edit-item-input');
    const saveEditButton = document.getElementById('save-edit');

    const dateModal = document.getElementById('date-modal');
    const closeDateModal = document.getElementById('close-date-modal');
    const assignDateInput = document.getElementById('assign-date-input');
    const saveDateButton = document.getElementById('save-date');

    const priorityModal = document.getElementById('priority-modal');
    const closePriorityModal = document.getElementById('close-priority-modal');
    const prioritySelect = document.getElementById('priority-select');
    const savePriorityButton = document.getElementById('save-priority');
    const cancelPriorityButton = document.getElementById('cancel-priority');

    const infoModal = document.getElementById('info-modal');
    const closeInfoModal = document.getElementById('close-info-modal');
    const infoText = document.getElementById('info-text');
    const infoNotes = document.getElementById('info-notes');
    const saveInfoButton = document.getElementById('save-info');
    const cancelInfoButton = document.getElementById('cancel-info');

    let currentList = 'default';
    let currentDate = new Date();
    let currentEditIndex = null;
    let currentDateAssignIndex = null;
    let currentPriorityIndex = null;
    let currentInfoIndex = null;
    const lists = JSON.parse(localStorage.getItem('todoLists')) || { default: [] };

    // Example of fetching data from an API
    fetch('https://jsonplaceholder.typicode.com/posts/1')
        .then(response => response.json())
        .then(data => {
            const post = document.createElement('div');
            post.className = 'post';
            post.innerHTML = `<h2>${data.title}</h2><p>${data.body}</p>`;
            document.body.appendChild(post);
        })
        .catch(error => console.error('Error fetching data:', error));

    // Initialize the list selector
    function initializeListSelector() {
        listSelector.innerHTML = '';
        for (const list in lists) {
            const option = document.createElement('option');
            option.value = list;
            option.textContent = list;
            listSelector.appendChild(option);
        }
    }

    // Render the todo list
    function renderTodoList() {
        todoList.innerHTML = '';
        lists[currentList].sort((a, b) => {
            const priorities = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return priorities[b.priority] - priorities[a.priority];
        });

        lists[currentList].forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-text ${item.completed ? 'completed' : ''}" data-index="${index}">${item.text}</span>
                <span class="item-priority ${item.priority.toLowerCase()}">${item.priority}</span>
                <button class="edit-item" data-index="${index}">Edit</button>
                <button class="delete-item" data-index="${index}">Delete</button>
                <button class="toggle-complete" data-index="${index}">${item.completed ? 'Undo' : 'Complete'}</button>
                <button class="assign-date" data-index="${index}">Assign Date</button>
            `;
            todoList.appendChild(li);
        });
        renderCalendar();
        saveLists();
    }

    // Render the calendar
    function renderCalendar() {
        calendar.innerHTML = '';
        currentMonthYear.textContent = currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });

        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell';
            calendar.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.innerHTML = `<div class="date">${i}</div>`;
            lists[currentList].forEach((item, index) => {
                if (item.date === `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`) {
                    const chip = document.createElement('div');
                    chip.className = `chip ${item.priority.toLowerCase()}`;
                    chip.textContent = item.text;
                    chip.addEventListener('click', () => {
                        currentInfoIndex = index;
                        infoText.textContent = `${item.text} (${item.priority})`;
                        infoNotes.value = item.notes || '';
                        infoModal.style.display = 'block';
                    });
                    cell.appendChild(chip);
                }
            });
            calendar.appendChild(cell);
        }

        // Remove extra cells to avoid black space
        const totalCells = firstDay + daysInMonth;
        const extraCells = (7 - totalCells % 7) % 7;
        for (let i = 0; i < extraCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell';
            calendar.appendChild(emptyCell);
        }
    }

    // Close the modals
    closeEditModal.onclick = () => {
        editModal.style.display = 'none';
    };

    closeDateModal.onclick = () => {
        dateModal.style.display = 'none';
    };

    closePriorityModal.onclick = () => {
        priorityModal.style.display = 'none';
    };

    closeInfoModal.onclick = () => {
        infoModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
        if (event.target == dateModal) {
            dateModal.style.display = 'none';
        }
        if (event.target == priorityModal) {
            priorityModal.style.display = 'none';
        }
        if (event.target == infoModal) {
            infoModal.style.display = 'none';
        }
    };

    // Save lists to local storage
    function saveLists() {
        localStorage.setItem('todoLists', JSON.stringify(lists));
    }

    // Add a new item
    addItemButton.addEventListener('click', () => {
        const newItemText = newItemInput.value.trim();
        if (newItemText !== '') {
            currentPriorityIndex = lists[currentList].length;
            priorityModal.style.display = 'block';
        }
    });

    // Add a new list
    addListButton.addEventListener('click', () => {
        const newListName = prompt('Enter the name of the new list:');
        if (newListName && !lists[newListName]) {
            lists[newListName] = [];
            initializeListSelector();
        }
    });

    // Handle list selection
    listSelector.addEventListener('change', (event) => {
        currentList = event.target.value;
        renderTodoList();
    });

    // Handle item actions
    todoList.addEventListener('click', (event) => {
        const index = event.target.getAttribute('data-index');
        if (event.target.classList.contains('delete-item')) {
            lists[currentList].splice(index, 1);
            renderTodoList();
        } else if (event.target.classList.contains('edit-item')) {
            currentEditIndex = index;
            editItemInput.value = lists[currentList][index].text;
            editModal.style.display = 'block';
        } else if (event.target.classList.contains('toggle-complete')) {
            lists[currentList][index].completed = !lists[currentList][index].completed;
            renderTodoList();
        } else if (event.target.classList.contains('assign-date')) {
            currentDateAssignIndex = index;
            dateModal.style.display = 'block';
        }
    });

    // Save edited item
    saveEditButton.addEventListener('click', () => {
        if (currentEditIndex !== null) {
            lists[currentList][currentEditIndex].text = editItemInput.value;
            renderTodoList();
            editModal.style.display = 'none';
        }
    });

    // Save assigned date
    saveDateButton.addEventListener('click', () => {
        if (currentDateAssignIndex !== null) {
            lists[currentList][currentDateAssignIndex].date = assignDateInput.value;
            renderTodoList();
            dateModal.style.display = 'none';
        }
    });

    // Save priority
    savePriorityButton.addEventListener('click', () => {
        if (currentPriorityIndex !== null) {
            const newItem = {
                text: newItemInput.value.trim(),
                priority: prioritySelect.value,
                completed: false,
                date: '',
                notes: ''
            };
            lists[currentList].push(newItem);
            newItemInput.value = '';
            renderTodoList();
            priorityModal.style.display = 'none';
        }
    });

    cancelPriorityButton.addEventListener('click', () => {
        priorityModal.style.display = 'none';
    });

    // Save info
    saveInfoButton.addEventListener('click', () => {
        if (currentInfoIndex !== null) {
            lists[currentList][currentInfoIndex].notes = infoNotes.value;
            renderTodoList();
            infoModal.style.display = 'none';
        }
    });

    cancelInfoButton.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });

    // Handle month navigation
    prevMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    initializeListSelector();
    renderTodoList();
});
