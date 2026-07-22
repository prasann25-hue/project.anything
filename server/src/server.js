import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  CareerPilot AI server is running on:   `);
  console.log(`  http://localhost:${PORT}             `);
  console.log(`=========================================`);
});
