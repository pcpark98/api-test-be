const postgres = require('../database/pg');
const parameter = require('../utils/parameter');
const axios = require('axios');
const tokenUtil = require('../utils/jwtToken');
const {PostgreConnectionError, SqlSyntaxError, NullParameterError, TokenIssueError, SendMailError, SqlUniqueViolationError} = require('../error/error');

require('dotenv').config();

module.exports.kakaoLogin = async(req, res) => {
    const redirectCode = req.query.code;
    const pg = new postgres();
    const token_url = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.REST_API_KEY}&redirect_uri=${process.env.REDIRECT_URI}/kakao/callback&code=${redirectCode}`;
    try{
        await parameter.nullCheck(redirectCode);
        await pg.connect();

        const result = await axios.post(token_url,
            {
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            }
        );

        const userInfo = await axios.get('https://kapi.kakao.com/v2/user/me',
            {
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                    Authorization: `Bearer ${result.data.access_token}`
                }
            }
        );
        
        const checkUser = await pg.queryExecute(`
            SELECT * FROM sparc.user WHERE platform_id = $1;
        `, [userInfo.data.id]);

        let queryResult;
        let userIndex;
        if(checkUser.rowCount == 0){
            queryResult = await pg.queryExecute(`
                INSERT INTO sparc.user (user_index, platform_id, name) VALUES(DEFAULT, $1, $2) RETURNING user_index;
            `, [userInfo.data.id, userInfo.data.properties.nickname]);
            userIndex = queryResult.rows[0].user_index;
        } else{
            userIndex = checkUser.rows[0].user_index;
        }
        console.log(userIndex);

        const token = await tokenUtil.issueToken(userIndex);
        return res.status(200).send({
            user_index : userIndex,
            user_name : userInfo.data.properties.nickname,
            token : token
        })
    }catch(error){
        console.log(error);
        if(error instanceof NullParameterError){
            return res.status(400).send();
        }
        if(error instanceof PostgreConnectionError){
            return res.status(500).send();
        }
        if(error instanceof TokenIssueError){
            return res.status(500).send();
        }
        return res.status(500).send();
    }
    finally{
        await pg.disconnect();
    }
}