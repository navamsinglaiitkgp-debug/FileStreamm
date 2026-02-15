//calls dotenv.config()
//checks PORT, NODE_ENV, MONGO_URI exist
//if missing → print which ones are missing and process.exit(1)

require('dotenv').config();

const requiredEnvVars = ['PORT', 'NODE_ENV', 'MONGO_URI'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}
