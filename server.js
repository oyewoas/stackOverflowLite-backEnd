import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
// import swaggerUi from 'swagger-ui-express';
// import YAML from 'yamljs';
import path from 'path';
import router from './app/routes';
import createTables from './app/db/db';

const PORT = process.env.PORT || 3002;

// const swaggerDocument = YAML.load(path.join(process.cwd(), './swagger/swagger.yaml'));

createTables();
dotenv.config();

// create express app
const app = express();
// const entries = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


	console.log(`App is running at port ${PORT}`);

