import express from 'express';
import session from 'express-session'
import router from './routes.js';

const PORT = 3000;

const app = express();

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false                                                      
}))

app.use(router)

app.use(errorHandler)

app.listen(PORT, () => console.log(`Application started on port: ${PORT}`));

function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }