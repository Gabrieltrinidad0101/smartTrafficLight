import express from 'express';
import {
    createNotification,
    getAllNotifications,
    getNotification,
    updateNotification,
    deleteNotification,
    sendAccidentNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/', createNotification);
router.get('/', getAllNotifications);
router.get('/:id', getNotification);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);
router.post('/send', sendAccidentNotification);

export default router;
