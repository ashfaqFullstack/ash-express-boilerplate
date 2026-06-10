const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { roles } = require('../config/roles');
const toJSON = require('./plugins/toJSON.plugin');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid Email')
                };
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            validate(value) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error("Password must contain at one letter capital and one number!🫢")
                }
            },
            private: true
        },
        role: {
            type: String,
            enum: roles,
            default: 'user'
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


// Plugin to convert mongoose to JSON
userSchema.plugin(toJSON)

/**
 * Check if email is taken alredy
 * @param {string} email
 * @param {ObjectId} [currentUserId] - The id of the user not to be find from DB
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, currentUserId) {
    const user = await this.findOne({ email, _id: { $ne: currentUserId } });
    return !!user;
};

/**
 * Password match with the user entered password
 * @param {string} password
 * @returns {Promis<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function () {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    };
    next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;