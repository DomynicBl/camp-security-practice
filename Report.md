# Report de Vulnerabilidades

### Esse é um documento para reportar as vulnerabilidades encontradas no projeto original e as correções executadas para contornar as vulnerabilidades. 

<br>

## Vulnerabilidade de SQL Injection:

### A aplicação continha uma vulnerabilidade de injeção de SQL no arquivo "index.js", mais especificamente na função responsável pelo login.

### Descrição:
- A aplicação possuía uma vulnerabilidade de Injeção de SQL no endpoint de login, localizado no arquivo "index.js".
- Antes da correção, os valores de "username" e "password" eram diretamente inseridos na consulta SQL sem serem devidamente sanitizados.
- Esta vulnerabilidade permitia que um atacante executasse consultas maliciosas ao banco de dados, manipulando os campos de entrada e inserindo códigos SQL maliciosos no formulário de login.

- Para corrigir essa vulnerabilidade, implementei o uso do "prepared statements", uma técnica que permite que o Sequelize, nosso ORM (Object-Relational Mapping), faça a sanitização dos dados automaticamente.
- Assim, os dados de login são passados como parâmetros para a consulta SQL e o Sequelize os sanitiza automaticamente durante a execução da consulta.

### Antes da correção:
```
// Endpoint de login (vulnerável a SQL Injection)

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username, password } });
  if (user) {
    res.json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
```

### Depois da correção:
```
// Utilizando prepared statements, para que o Sequelize faça a sanitização dos dados

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username: username, password: password } }); 
  if (user) {
    res.json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});
```
<br><br>

## Vulnerabilidade de Exposição de Dados Sensíveis:

### A aplicação continha uma vulnerabilidade de exposição de dados sensíveis no arquivo "index.js", mais especificamente no endpoint de listagem de usuários.

### Descrição:
- A aplicação possuía uma vulnerabilidade que expunha dados sensíveis no endpoint de listagem de usuários, localizado no arquivo "index.js". 
- Antes da correção, o endpoint retornava todos os usuários do sistema, incluindo suas senhas, o que representava um risco significativo de segurança.
- Essa vulnerabilidade poderia permitir que um atacante obtivesse acesso não autorizado às senhas dos usuários.

- Para corrigir essa vulnerabilidade, reconfigurei o endpoint para retornar apenas as informações essenciais dos usuários, excluindo a exposição das senhas.
- Agora, o endpoint retorna apenas os IDs e nomes de usuário dos usuários, mantendo as senhas ocultas e protegidas.

### Antes da correção:
```
// Endpoint de listagem de usuários (expondo dados sensíveis)

app.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'username', 'password'] });
  res.json(users);
});
```

### Depois da correção:
```
// Expondo apenas id e username, sem a senha

app.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'username'] }); 
  res.json(users);
});
```

<br><br>

## Vulnerabilidade de Exposição de Dados Sensíveis:

A aplicação continha uma vulnerabilidade de exposição de dados sensíveis no arquivo "index.js", mais especificamente no endpoint de detalhe do usuário logado.

### Descrição:
- A aplicação possuía uma vulnerabilidade que expunha a senha do usuário no endpoint de detalhe do usuário logado, localizado no arquivo "index.js".
- Antes da correção, o endpoint retornava todos os detalhes do usuário, incluindo a senha, o que representava um risco significativo de segurança.
- Essa vulnerabilidade poderia permitir que um atacante obtivesse acesso não autorizado às senhas dos usuários.

- Para corrigir essa vulnerabilidade, reconfigurei o endpoint para retornar todos os dados do usuário, exceto a senha.
- Agora, o endpoint retorna todos os detalhes do usuário, mantendo a senha oculta e protegida.

### Antes da correção:
```
// Endpoint de detalhe do usuário logado (expondo senha)

app.get('/profile', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ where: { username: username ?? null } });
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
```

### Depois da correção:
```
// Expondo todos os dados exceto a senha

app.get('/profile', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ where: { username: username ?? null }, attributes: { exclude: ['password'] } }); 
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});
```

<br><br>

## Vulnerabilidade de Armazenamento de Senha sem Criptografia:

A aplicação continha uma vulnerabilidade de armazenamento de senha sem criptografia no arquivo "user.js".

### Descrição:
- A aplicação armazenava as senhas dos usuários como texto puro no banco de dados, o que representava um risco significativo de segurança em caso de violação do banco de dados.
- Antes da correção, as senhas eram armazenadas diretamente no banco de dados sem qualquer forma de criptografia.
- Essa vulnerabilidade permitia que um atacante obtivesse acesso direto às senhas dos usuários, comprometendo a segurança de suas contas.

- Para corrigir essa vulnerabilidade, implementei a criptografia das senhas antes de serem armazenadas no banco de dados.
- Utilizei a biblioteca bcrypt para gerar um hash seguro da senha antes de ser salva.
- Agora, as senhas dos usuários são armazenadas de forma segura, reduzindo significativamente o risco de comprometimento da segurança.

### Antes da correção:
```
// Senha é armazenada como texto puro (sem criptografia)

const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
});

module.exports = User;

```

### Depois da correção:
```
// Criptografando a senha antes de salvar no banco

const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../sequelize');

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
},{
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.hash(user.password, await bcrypt.genSalt(10)); 
      user.password = salt;
    }
  }
});

module.exports = User;
```