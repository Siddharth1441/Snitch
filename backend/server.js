import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
