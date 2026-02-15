import express from "express"
import cors from "cors"
import "./mqtt.js"
import sequelize from "./config/db.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import notificationSentRoutes from "./routes/notificationSentRoutes.js"
import morgan from "morgan"

const app = express();

app.use(cors("*"));
app.use(express.json());
app.use(morgan("dev"));

app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications-sent', notificationSentRoutes);
app.use('/images', express.static('images'));

try {
    await sequelize.sync({ alter: true }); // Sync database
    console.log("Database connected and synced");
} catch (error) {
    console.error("Unable to connect to the database:", error);
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
