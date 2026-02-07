import RegisteredPlate from '../models/RegisteredPlate.js';

export const createRegisteredPlate = async (req, res) => {
    try {
        const { number, description, whatsapps } = req.body;
        const newPlate = await RegisteredPlate.create({ number, description, whatsapps });
        res.status(201).json(newPlate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllRegisteredPlates = async (req, res) => {
    try {
        const plates = await RegisteredPlate.findAll();
        return res.status(200).json(plates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRegisteredPlate = async (req, res) => {
    try {
        const { id } = req.params;
        const plate = await RegisteredPlate.findByPk(id);
        if (!plate) return res.status(404).json({ error: 'Plate not found' });
        res.status(200).json(plate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRegisteredPlate = async (req, res) => {
    try {
        const { id } = req.params;
        const { number, description, whatsapps } = req.body;
        const plate = await RegisteredPlate.findByPk(id);
        if (!plate) return res.status(404).json({ error: 'Plate not found' });

        plate.number = number || plate.number;
        plate.description = description || plate.description;
        plate.whatsapps = whatsapps || plate.whatsapps;

        await plate.save();
        res.status(200).json(plate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteRegisteredPlate = async (req, res) => {
    try {
        const { id } = req.params;
        const plate = await RegisteredPlate.findByPk(id);
        if (!plate) return res.status(404).json({ error: 'Plate not found' });

        await plate.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
