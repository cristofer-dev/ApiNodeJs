var config = require('../../config');
var sendgrid = require('sendgrid')(config.sendgrid_user, config.sendgrid_pass);
var email = new sendgrid.Email();
var Mail = function() {};

Mail.prototype.send = function(fromName, from, to, subject, body, callback) {
    console.log("Sending with SendGrid");

    email.to = to || 'contacto@ivdevs.com';
    email.from = from || 'contacto@ivdevs.com';
    email.fromname = fromName || 'Comunidad IV Devs';
    email.subject = subject;
    email.html = body;

    sendgrid.send(email, function(err, json) {
        console.info("SENT TO " + email.to);
        console.info(json);
        return callback(err, json);
    });
};
exports.Mail = new Mail();