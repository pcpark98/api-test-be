const express = require('express');
const app = express();

const cors = require('cors');
const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['POST','GET', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],  
};
const router = require('./routes/router')

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', router);
app.use((req,res)=>{
    res.status(404).send("잘못된 페이지 요청입니다.");
})

app.listen(4000, (req,res) => {
    console.log(4000 + "포트로 서버 실행");
})