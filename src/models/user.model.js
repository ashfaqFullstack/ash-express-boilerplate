const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const validator = require('validator');
const sequelize = require('../config/db');
const { roles } = require('../config/roles');

class User extends Model {
    /**
     * Check if email is already taken
     * @param {string} email
     * @param {string} [excludeUserId] - user id to exclude from check
     * @returns {Promise<boolean>}
     */
    static async isEmailTaken(email, excludeUserId) {
        const { Op } = require('sequelize');
        const where = { email };
        if (excludeUserId) {
            where.id = { [Op.ne]: excludeUserId };
        }
        const user = await this.findOne({ where });
        return !!user;
    }

    /**
     * Match entered password against stored hash
     * @param {string} password
     * @returns {Promise<boolean>}
     */
    async isPasswordMatch(password) {
        return bcrypt.compare(password, this.password);
    }

    /**
     * Return safe public representation (no password)
     */
    toJSON() {
        const values = { ...this.get() };
        delete values.password;
        return values;
    }

    /**
     * Paginate query results
     * @param {Object} filter - where clause
     * @param {Object} options - { sortBy, limit, page }
     * @returns {Promise<{ results, page, limit, totalPages, totalResults }>}
     */
    static async paginate(filter, options) {
        const { Op, fn, col } = require('sequelize');

        const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
        const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
        const offset = (page - 1) * limit;

        // Parse sortBy: "name:asc,email:desc" → [['name','ASC'],['email','DESC']]
        let order = [['createdAt', 'ASC']];
        if (options.sortBy) {
            order = options.sortBy.split(',').map((sortOption) => {
                const [key, direction] = sortOption.split(':');
                return [key, direction === 'desc' ? 'DESC' : 'ASC'];
            });
        }

        const { count, rows } = await this.findAndCountAll({
            where: filter,
            limit,
            offset,
            order,
            attributes: { exclude: ['password'] },
        });

        return {
            results: rows,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            totalResults: count,
        };
    }
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail(value) {
                    if (!validator.isEmail(value)) {
                        throw new Error('Invalid Email');
                    }
                },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [8, 255],
                    msg: 'Password must be at least 8 characters',
                },
                hasLetterAndNumber(value) {
                    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                        throw new Error('Password must contain at least one letter and one number!');
                    }
                },
            },
        },
        role: {
            type: DataTypes.ENUM(...roles),
            defaultValue: 'user',
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
    }
);

// Hash password before create/update
User.beforeCreate(async (user) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});

module.exports = User;
