const express = require('express');
// Conexión a la base de datos mongoDB
const { dbConnection } = require('./database/config');
// Configuración de dotenv para variables de entorno
require('dotenv').config();
var cors = require('cors');

// Levantamos el servidor express
const app = express();

// Levantamos la base de datos
dbConnection();

// CORS, habilitamos el cors con la config básica
app.use(cors());

// Lectura y parseo del body
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Escuchar peticiones
app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});
