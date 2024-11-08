// Importação dos módulos
require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require('redis');
const User = require('./models/User'); 
const path = require('path');

//print("oi")
// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Conectado ao MongoDB'))
  .catch((error) => console.error('Erro ao conectar ao MongoDB:', error));

// Configuração do Redis para cache da azure
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
    socket: {
        tls: true,
        keepAlive: 10000,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000) // Retentar a cada 100ms até no máximo 3s
    }
});

// Eventos de conexão
redisClient.on('connect', () => {
    console.log('Conectado ao Redis com sucesso!');
});

redisClient.on('ready', () => {
    console.log('Redis está pronto para uso!');
});

redisClient.on('error', (err) => {
    console.error('Erro no Redis:', err);
});

redisClient.on('end', () => {
    console.log('Conexão com o Redis foi fechada.');
});

// Função para garantir que o cliente Redis esteja conectado
async function ensureRedisConnected() {
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect();
            console.log('Cliente Redis reconectado com sucesso.');
        } catch (err) {
            console.error('Erro ao reconectar ao Redis:', err);
        }
    }
}

// Conectar ao Redis ao iniciar
(async () => {
    await ensureRedisConnected();
})();

// Definição do modelo de Tarefa
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ['pendente', 'completa'], default: 'pendente' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
});
const Task = mongoose.model('Task', taskSchema);

// Configuração do Express
const app = express();
app.use(cors());
app.use(bodyParser.json());


// Middleware de autenticação
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        console.error("Token não fornecido");
        return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        console.error("Erro na verificação do token:", error);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// Controlador da rota /tasks
app.use(express.static(path.join(__dirname, '..', 'frontend')));
// Rota para a página de boas-vindas
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..','frontend','welcome.html'));
});

// Rota para login e obtenção do token JWT
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios" });
        }

        // Lógica para criar o usuário (por exemplo, salvar no banco de dados)
        const newUser = new User({ username, password });
        await newUser.save();

        res.status(201).json({ message: "Usuário registrado com sucesso" });
    } catch (error) {
        console.error("Erro no registro do usuário:", error);
        res.status(500).json({ message: "Erro no servidor", error });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Supondo que você tenha uma coleção de usuários e uma função para validar o login
    const user = await User.findOne({ username, password });
    if (user) {
        const payload = { userId: user._id };  
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Credenciais inválidas' });
    }
});

// CRUD de Tarefas
// Obter todas as tarefas (com cache)

const getAsync = redisClient.get.bind(redisClient);
const setexAsync = redisClient.setEx.bind(redisClient);

app.get('/tasks', authenticate, async (req, res) => {
    try {
        const cacheKey = `tasks:${req.userId}`;
        
        
        
        const data = await redisClient.get(cacheKey);

        await ensureRedisConnected();
        if (data) {
            console.log("Dados encontrados no cache");
            return res.json(JSON.parse(data));
        } else {
            console.log("Dados não encontrados no cache, buscando no banco de dados...");
            
            // Buscar no banco de dados
            const tasks = await Task.find({ userId: req.userId });
            console.log("Tarefas encontradas no banco de dados:", tasks);

            // Salvar no cache por uma hora
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(tasks));
            console.log("Dados salvos no cache");

            res.json(tasks);
        }
    } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        res.status(500).json({ message: "Erro ao buscar tarefas" });
    }
});
// Adicionar nova tarefa
app.post('/tasks', authenticate, async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
        }

        const userId = req.userId;

        await ensureRedisConnected();

        const newTask = new Task({ title, userId });
        await newTask.save();

        // Limpar o cache para o usuário específico
        const cacheKey = `tasks:${userId}`;
        await redisClient.del(cacheKey);

        // Recarregar todas as tarefas do usuário e armazenar no cache
        const tasks = await Task.find({ userId });
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(tasks));

        res.status(201).json(newTask);
    } catch (error) {
        console.error("Erro ao adicionar tarefa:", error);
        res.status(500).json({ message: 'Erro ao adicionar tarefa' });
    }
});


// Atualizar o status de uma tarefa
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    try {
        const updatedTask = await Task.findByIdAndUpdate(id, { title }, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        res.json(updatedTask);
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        res.status(500).json({ message: 'Erro ao atualizar tarefa.' });
    }
});

// Remover uma tarefa
app.delete('/tasks/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });
    await ensureRedisConnected();
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada' });

    redisClient.del(`tasks:${req.userId}`);  // Limpa o cache
    res.json({ message: 'Tarefa removida' });
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});