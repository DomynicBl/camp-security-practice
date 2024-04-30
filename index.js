// index.js
const express = require('express');
const bodyParser = require('body-parser');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const sequelize = require('./sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

sequelize.sync({force: true}).then(() => console.log('Database connected')).catch(() => console.log('Error connecting to database'));

// Endpoint de login (vulnerável a SQL Injection)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username: username, password: password } }); //Utilizando prepared statements, para que o Sequelize faça a sanitização dos dados
  if (user) {
    res.json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Endpoint de listagem de usuários (expondo dados sensíveis)
app.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'username'] }); // Expondo apenas id e username, sem a senha
  res.json(users);
});

// Endpoint de detalhe do usuário logado (expondo senha)
app.get('/profile', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ where: { username: username ?? null }, attributes: { exclude: ['password'] } }); // Expondo todos os dados exceto a senha
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
