// Crea una instancia de mongoose y mongoose.Schema
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    SALT_WORK_FACTOR = 10,
    validate = require('mongoose-validator');

const emailValidator = [
    validate({
        validator: 'isEmail',
        passIfEmpty: false,
        message: 'Please fill a valid email address'
    })
];

var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    fullname: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: emailValidator,
        index: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    meta: {
        birthday: Date,
        bio: String,
        organization: {
            institution: String,
            position: String
        },
        avatar: String,
        twitter: String,
        facebook: String,
        web: String
    },
    category: {
        level: String,
        points: Number
    },
    admin: {
        type: Boolean,
        default: false
    },
    created_at: Date,
    updated_at: Date
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.pre('save', function(next, done) {
    var user = this;
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    user.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!user.created_at)
        user.created_at = currentDate;

    if ((user.isNew && user.admin) || (!user.isNew && user.isModified('admin'))) {
        var err = new Error('admin field is not allowed to modified');
        return next(err);
    }
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// Establece el modelo de mongoose y lo pasa usando module.exports
module.exports = mongoose.model('User', userSchema);