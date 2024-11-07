let jwtToken = '';

// Função de login para obter o token JWT
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('http://localhost:3000/login', {
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
        const response = await fetch("http://localhost:3000/register", {
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

// Função para obter todas as tarefas
async function fetchTasks() {
    const response = await fetch('http://localhost:3000/tasks', {
        headers: { 'Authorization': `Bearer ${jwtToken}` },
    });

    const tasks = await response.json();
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.status === 'completa' ? 'complete' : '';
        li.innerHTML = `
            ${task.title}
            <button onclick="toggleTaskStatus('${task._id}', '${task.status}')">Toggle Status</button>
            <button onclick="deleteTask('${task._id}')">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Função para adicionar nova tarefa
async function addTask() {
    const title = document.getElementById('task-title').value;

    // Verifique se o campo de título não está vazio
    if (!title) {
        alert("Por favor, insira uma tarefa.");
        return;
    }

    const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ title }),
    });

    const data = await response.json();
    if (response.ok) {
        document.getElementById('task-title').value = ''; // Limpa o campo após adicionar a tarefa
        fetchTasks(); // Atualiza a lista de tarefas
    } else {
        alert('Erro ao adicionar tarefa: ' + data.message);
    }
}

// Função para alternar o status da tarefa
async function toggleTaskStatus(id, currentStatus) {
    const newStatus = currentStatus === 'pendente' ? 'completa' : 'pendente';

    await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ status: newStatus }),
    });

    fetchTasks();
}

// Função para remover uma tarefa
async function deleteTask(id) {
    await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwtToken}` },
    });

    fetchTasks();
}