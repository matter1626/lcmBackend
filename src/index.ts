import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getXataClient } from "./xata";
dotenv.config();

const {PORT} = process.env || 3000;

const app = express();
app.use(cors());
app.use(express.json({limit:'50mb'}));

const client = getXataClient();

app.get('/', async (req,res) => {
    const result = await client.db.results.getAll()
    return res.json({results:result})
})

app.get('/results', async (req,res) => {
    const result = await client.db.results
    .sort('xata.createdAt','desc')
    .getMany({
        pagination:{
            size:10
        }
    })
    return res.json(result);
})

app.post('/userres', async (req,res) => {
    const { uid } = req.body;
    console.log('Received UID:', uid);
    console.log('body',req.body);
    const results = await client.db.results.filter({uid:uid}).getMany();

    if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    console.log(results);
    return res.json(results)
    })

app.post('/results', async (req, res) => {
    const { question, answer, score, uid } = req.body;

    console.log('Received data:', req.body); // Ensure this logs the correct data

    const result = await client.db.results.create({
        question: question,
        score: score,
        answer: answer,
        uid:uid 
    });

    console.log('Saved to database:', result);

    return res.json(result);
});

//add new user
app.post('/users', async (req,res) => {
    const {uid, email, username } = req.body;
    console.log('user details:',req.body);

    const user = await client.db.users.create({
        uid,
        username,
        email
    })

    console.log(user)

    return res.json(user);
})



app.listen(PORT, () => {
    console.log(`app is listening on port ${PORT}`)
})