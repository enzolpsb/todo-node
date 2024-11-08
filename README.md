To-Do List Full-Stack em Node.js

📋 Descrição do Projeto

Este é um projeto completo de aplicação To-Do List desenvolvido em Node.js, que permite aos usuários gerenciar suas tarefas de forma eficiente. A aplicação possui autenticação segura utilizando JWT, persistência de dados com MongoDB, e cache de alta performance com Redis. O objetivo é fornecer uma experiência fluida e responsiva para o gerenciamento de tarefas, com uma interface de usuário desenvolvida em HTML/CSS e integração com JavaScript (AJAX) para comunicação com a API backend.

🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:
	•	Node.js: Plataforma de desenvolvimento backend, usada para construir a API REST.
	•	Express.js: Framework para Node.js que facilita a criação de rotas e manipulação de requisições HTTP.
	•	MongoDB: Banco de dados NoSQL utilizado para armazenar as informações de usuários e tarefas.
	•	Mongoose: Biblioteca de modelagem de dados para Node.js, utilizada para simplificar a integração com o MongoDB.
	•	Redis: Utilizado como cache para melhorar a performance, especialmente em consultas frequentes.
	•	JWT (JSON Web Token): Implementado para autenticação e segurança, garantindo que apenas usuários autenticados possam acessar suas tarefas.
	•	HTML/CSS: Para a construção da interface do usuário (frontend).
	•	JavaScript (AJAX): Para comunicação assíncrona entre o frontend e o backend.
	•	Azure App Services: Plataforma de nuvem usada para realizar o deploy da aplicação.
	•	Docker (opcional): Para facilitar o desenvolvimento e a execução da aplicação em ambientes isolados.

⚙️ Funcionalidades

A aplicação oferece as seguintes funcionalidades:
	•	Registro e Login de Usuários: Autenticação segura com JWT.
	•	Gerenciamento de Tarefas:
	•	Criação, atualização, exclusão e listagem de tarefas.
	•	Cada usuário tem acesso apenas às suas próprias tarefas.
	•	Cache com Redis: Melhor performance ao buscar tarefas, utilizando cache para consultas frequentes.
	•	Segurança:
	•	Conexão segura com SSL/TLS.
	•	Proteção de rotas utilizando JWT para validação de usuários.
	•	Deploy na Azure: Aplicação hospedada e acessível publicamente com suporte a HTTPS.

🛠️ Pré-requisitos

Antes de rodar a aplicação, certifique-se de ter instalado:
	•	Node.js (versão 16 ou superior)
	•	MongoDB (local ou Atlas)
	•	Redis (local ou hospedado na nuvem)
	•	Azure CLI (para deploy, se necessário)
	•	Docker (opcional, para uso de containers)

🚀 Como Executar o Projeto Localmente

  1.	Clone o repositório:
    git clone https://github.com/enzolpsb/todo-node.git
    , e entre em cd todo-node
  2.	Crie um arquivo .env com as seguintes variáveis de ambiente:             
    PORT=8182
    MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/todo       
    REDIS_HOST=seu host redis       
    REDIS_PASSWORD=seupasswordredis         
    REDIS_PORT=6380 (no meu caso, com ssl)                
    JWT_SECRET=sua_chave_secreta
    
  4.	Instale as dependências:
     npm install
  5.	Execute a aplicação:
     npm start
  6.	Acesse no navegador:
    http://localhost:8182


Próximos Passos

	•	Implementar testes automatizados utilizando Jest.
	•	Melhorar a interface do usuário com React para uma experiência mais dinâmica.
	•	Adicionar suporte a notificações em tempo real com WebSockets.
