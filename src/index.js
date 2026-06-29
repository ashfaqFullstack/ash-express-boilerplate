const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const sequelize = require('./config/db');

// Import models so Sequelize registers them before sync
require('./models');

let server;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connected to PostgreSQL');

        // Sync tables (use migrations in production instead)
        if (config.env !== 'production') {
            await sequelize.sync({ alter: true });
            logger.info('Database synced');
        }

        server = app.listen(config.port, () => {
            logger.info(`Listening to port: ${config.port}`);
        });
    } catch (error) {
        logger.error('Unable to connect to PostgreSQL:', error);
        process.exit(1);
    }
};

startServer();

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
