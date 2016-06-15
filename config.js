module.exports = {
    'secret': process.env.SECRET || 'mysecretkey',
    'database': process.env.MONGOURL || 'mongodb://localhost/db'
};