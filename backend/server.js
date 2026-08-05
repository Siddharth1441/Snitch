import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import { config } from './src/config/config.js';

const start = async () => {
  try {
    await connectDatabase();
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
