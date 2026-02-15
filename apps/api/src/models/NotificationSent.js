import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const NotificationSent = sequelize.define('NotificationSent', {
    type: {
        type: DataTypes.ENUM('plate', 'person'),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    camera: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    toNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('sent', 'failed'),
        allowNull: false,
        defaultValue: 'sent',
    },
}, {
    timestamps: true,
});

export default NotificationSent;
