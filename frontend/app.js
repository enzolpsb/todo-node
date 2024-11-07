let jwtToken = '';

// Função de login para obter o token JWT
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            jwtToken = data.token;
            console.log('Token JWT:', jwtToken); // Exibe o token no console do navegador
            alert('Login realizado com sucesso!');
            showTaskSection();
            fetchTasks();  // Carregar as tarefas após o login
        } else {
            alert('Falha no login: ' + data.message);
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao tentar fazer login.');
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
            window.location.href = "/"; // Redireciona para a página de login
        } else {
            alert(data.message || "Erro ao registrar.");
        }
    } catch (error) {
        console.error("Erro ao registrar:", error);
    }
}

function showRegisterForm() {
    document.querySelector('.login').style.display = 'none';
    document.querySelector('.register').style.display = 'block';
}

// Exibe a seção de tarefas após o login
function showTaskSection() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';  // Exibe o formulário de tarefas
    document.getElementById('task-list').style.display = 'block';  // Exibe a lista de tarefas
}

function showLoginForm() {
    document.querySelector('.login').style.display = 'block';
    document.querySelector('.register').style.display = 'none';
}

// Função para obter todas as tarefas
async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:3000/tasks', {
            headers: { 'Authorization': `Bearer ${jwtToken}` },
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar tarefas: ${response.status}`);
        }

        const tasks = await response.json();
        console.log('Tarefas recebidas:', tasks); // Verificar se tasks é um array de tarefas

        if (Array.isArray(tasks)) {
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
        } else {
            console.error('A resposta de tasks não é um array:', tasks);
        }
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        alert('Não foi possível carregar as tarefas. Verifique a conexão com o servidor.');
    }
}

// Função para adicionar nova tarefa
async function addTask() {
    console.log('Função addTask chamada'); // Log para verificar se a função foi chamada
    const title = document.getElementById('task-title').value;

    try {
        const response = await fetch('http://localhost:3000/tasks', {
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

// Função para alternar o status da tarefa
async function toggleTaskStatus(id, currentStatus) {
    const newStatus = currentStatus === 'pendente' ? 'completa' : 'pendente';

    try {
        await fetch(`http://localhost:3000/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ status: newStatus }),
        });
        fetchTasks();
    } catch (error) {
        console.error('Erro ao alternar o status da tarefa:', error);
        alert('Erro ao tentar alternar o status da tarefa.');
    }
}

// Função para remover uma tarefa
async function deleteTask(id) {
    try {
        await fetch(`http://localhost:3000/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${jwtToken}` },
        });
        fetchTasks();
    } catch (error) {
        console.error('Erro ao deletar a tarefa:', error);
        alert('Erro ao tentar deletar a tarefa.');
    }
}