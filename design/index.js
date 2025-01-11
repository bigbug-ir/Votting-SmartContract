let express = require('express');
let app = express();
app.use(express.static('src'));
app.use(express.static('../contract/build/contracts'));
app.get('/',(req,res)=>{
    res.render('index.html');
})
app.listen(3000,()=>{
    console.log('Your Dapp listening on port 3000');
})