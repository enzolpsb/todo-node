
let jwtToken = '';

const API_URL = 'https://todo-app-frb9b7e6bqcafdct.canadacentral-01.azurewebsites.net';

// Função de login para obter o token JWT
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        jwtToken = data.token;
        console.log('Token JWT:', jwtToken);
        alert('Login realizado com sucesso!');
        showTaskSection();
        fetchTasks();  // Carregar as tarefas após o login
    } else {
        alert('Falha no login: ' + data.message);
    }
}

// Função para registro de novo usuário
async function register() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("Registro realizado com sucesso!");
            showLoginForm();
        } else {
            alert(data.message || "Erro ao registrar.");
        }
    } catch (error) {
        console.error("Erro ao registrar:", error);
    }
}

// Exibe o formulário de registro e oculta o de login
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Exibe o formulário de login e oculta o de registro
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

// Exibe a seção de tarefas após o login
function showTaskSection() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';
}



async function fetchTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` },
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar tarefas: ${response.status}`);
        }

        const tasks = await response.json();
        console.log('Tarefas recebidas:', tasks);

        if (Array.isArray(tasks)) {
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = '';

            tasks.forEach(task => {
                const li = document.createElement('li');
                li.className = task.status === 'completa' ? 'complete' : '';
                li.innerHTML = `
                    <input type="text" id="edit-title-${task._id}" value="${task.title}" style="display:none;">
                    <span id="task-title-${task._id}">${task.title}</span>
                    <button onclick="editTask('${task._id}')">Edit</button>
                    <button onclick="updateTask('${task._id}')">Save</button>
                    <button onclick="deleteTask('${task._id}')">Delete</button>
                `;
                taskList.appendChild(li);
            });
        } else {
            console.error('A resposta de tasks não é um array:', tasks);
        }
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        alert('Não foi possível carregar as tarefas.');
    }
}

// Função para adicionar nova tarefa
async function addTask() {
    console.log('Função addTask chamada'); // Log para verificar se a função foi chamada
    const title = document.getElementById('task-title').value;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ title }),
        });

        if (response.ok) {
            console.log('Tarefa adicionada com sucesso');
            fetchTasks();  // Atualiza a lista de tarefas
            document.getElementById('task-title').value = '';  // Limpa o campo de entrada
        } else {
            const data = await response.json();
            alert('Erro ao adicionar tarefa: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        alert('Erro ao tentar adicionar tarefa.');
    }
}
async function updateTask(taskId) {
    const newTitle = document.getElementById(`edit-title-${taskId}`).value;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ title: newTitle }),
        });

        if (response.ok) {
            alert('Tarefa atualizada com sucesso!');
            
            // Atualiza o título da tarefa no frontend imediatamente
            const titleSpan = document.getElementById(`task-title-${taskId}`);
            const editInput = document.getElementById(`edit-title-${taskId}`);

            titleSpan.textContent = newTitle;
            titleSpan.style.display = 'block';
            editInput.style.display = 'none';
        } else {
            const data = await response.json();
            alert('Erro ao atualizar a tarefa: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao atualizar a tarefa:', error);
        alert('Erro ao tentar atualizar a tarefa.');
    }
}
// Função para alternar o status da tarefa
function editTask(taskId) {
    const titleSpan = document.getElementById(`task-title-${taskId}`);
    const editInput = document.getElementById(`edit-title-${taskId}`);

    if (editInput.style.display === 'none') {
        // Mostrar campo de edição e ocultar o título original
        editInput.style.display = 'block';
        titleSpan.style.display = 'none';
    } else {
        // Ocultar campo de edição e mostrar o título original
        editInput.style.display = 'none';
        titleSpan.style.display = 'block';
    }
}

// Função para remover uma tarefa
async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${jwtToken}` },
        });
        fetchTasks();
    } catch (error) {
        console.error('Erro ao deletar a tarefa:', error);
        alert('Erro ao tentar deletar a tarefa.');
    }
}