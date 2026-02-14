import express from 'express';
import { sendAccidentNotification } from '../controllers/notificationController.js';
// import multer from 'multer';
// import path from 'path';

const router = express.Router();

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// });

// const upload = multer({ storage: storage });

//router.post('/send', upload.single('image'), sendAccidentNotification);
router.post('/send', sendAccidentNotification);

export default router;
