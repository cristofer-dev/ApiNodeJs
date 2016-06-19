module.exports = {
    'secret': process.env.SECRET || 'mysecretkey',
    'database': process.env.MONGOURL || 'localhost/db',
    'sendgrid_user': process.env.SENDGRID_USER || '',
    'sendgrid_pass': process.env.SENDGRID_PASS || ''
};