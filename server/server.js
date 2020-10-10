//Budget API

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
var budget = require('./bud.json');

app.use(cors());
// app.use('/', express.static('public'));



// app.get('/hello', (req, res)=>{
//     res.send('Hello World!');
// });

// var fs = require('fs');
// var obj = JSON.parse(fs.readFileSync('bud.json', 'utf8'));

app.get('/budget', (req,res)=> {
    res.json(budget);
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});