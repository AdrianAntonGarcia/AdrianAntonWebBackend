// Conexión a la base de datos mongoDB
const { dbConnection } = require("./database/config");
// Configuración de dotenv para variables de entorno
require('dotenv').config();


dbConnection();