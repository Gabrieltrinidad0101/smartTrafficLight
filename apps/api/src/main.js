import express from "express"
import cors from "cors"
import "./mqtt.js"
import sequelize from "./config/db.js"
import registeredPlateRoutes from "./routes/registeredPlateRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/plates', registeredPlateRoutes);

try {
    await sequelize.sync(); // Sync database
    console.log("Database connected and synced");
} catch (error) {
    console.error("Unable to connect to the database:", error);
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});