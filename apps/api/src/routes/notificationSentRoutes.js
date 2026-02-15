import express from 'express';
import { getAllNotificationsSent } from '../controllers/notificationSentController.js';

const router = express.Router();

router.get('/', getAllNotificationsSent);

export default router;
