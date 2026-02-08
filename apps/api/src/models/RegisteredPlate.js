import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const RegisteredPlate = sequelize.define('RegisteredPlate', {
    number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    whatsapps: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    }
}, {
    timestamps: true,
});

export default RegisteredPlate;
