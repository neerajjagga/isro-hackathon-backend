import express from 'express';
import askRouter from './routes/ask.js';
import connectDB from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/ask', askRouter);

app.get("/", (req, res) => {
    res.send("MOSDAC HelpBot Backend is running");
});

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});