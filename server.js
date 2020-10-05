const express = require('express');
const app = express();
const port = 3000;
var budget = require('./bud.json');

app.use('/', express.static('public'));



app.get('/hello', (req, res)=>{
    res.send('Hello World!');
});

// var fs = require('fs');
// var obj = JSON.parse(fs.readFileSync('bud.json', 'utf8'));

app.get('/budget', (req,res)=> {
    res.json(budget);
});

app.listen(port, () => {
    console.log('Example app listening at http://localhost:${port}');
});