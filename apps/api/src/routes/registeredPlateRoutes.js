import express from 'express';
import {
    createRegisteredPlate,
    getAllRegisteredPlates,
    getRegisteredPlate,
    updateRegisteredPlate,
    deleteRegisteredPlate
} from '../controllers/RegisteredPlateController.js';

const router = express.Router();

router.post('/', createRegisteredPlate);
router.get('/', getAllRegisteredPlates);
router.get('/:id', getRegisteredPlate);
router.put('/:id', updateRegisteredPlate);
router.delete('/:id', deleteRegisteredPlate);

export default router;
