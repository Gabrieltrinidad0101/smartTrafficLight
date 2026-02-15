import { Op } from 'sequelize';
import NotificationSent from '../models/NotificationSent.js';

export const getAllNotificationsSent = async (req, res) => {
    try {
        const { type, name, search, limit = 50, offset = 0 } = req.query;
        const where = {};

        if (type) where.type = type;
        if (name) where.name = name;
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { camera: { [Op.iLike]: `%${search}%` } },
                { toNumber: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows } = await NotificationSent.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        return res.status(200).json({ total: count, data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
