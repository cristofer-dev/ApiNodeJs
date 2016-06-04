// Crea una instancia de mongoose y mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Establece el modelo de mongoose y lo pasa usando module.exports
module.exports = mongoose.model('User', new Schema({ 
    name: String, 
    password: String, 
    admin: Boolean 
}));