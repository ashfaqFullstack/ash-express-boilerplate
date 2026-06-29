const { Sequelize } = require('sequelize');
const config = require('./config');
const logger = require('./logger');

const sequelize = new Sequelize(config.database.url, {
    dialect: 'postgres',
    logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,
    dialectOptions:
        config.env === 'production'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

module.exports = sequelize;
