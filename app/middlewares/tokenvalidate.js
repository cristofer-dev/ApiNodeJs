var express = require('express');
var app = express();

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var secretKey = require('../../config').secret;

var validateToken = function(req, res, next) {
    // Verifica cabeceras o parametros URL o POST en busca de un Token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // Decodificando Token
    if (token) {

        // Verificando Token
        jwt.verify(token, secretKey, function(err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'No se ha podido autentificar el Token.'
                });
            } else {
                // Si todo esta ok, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // Si no hay token, retorna ERROR    
        return res.status(403).send({
            success: false,
            message: 'No hay token.'
        });

    }
};
module.exports = validateToken;