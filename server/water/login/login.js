const { default: axios } = require("axios");
const { MakeCRC32 } = require("./encrypt.js")
const { String2UTF8 } = require("./utility");


//////////////////////////////////////////////////////////////////////////
//login APIs:
function LoginHandlerStep2(responseText, m_oContext) {
    const arrResult = parseResponse(responseText, 2);

    m_oContext.m_sRef = arrResult[1];
    console.log(`login success: ${arrResult[1]}`);
}


const parseResponse = (data, items) => {
    const arrResult = data.split(",");

    if (isNaN(parseInt(arrResult[0]))) {
        throw new Error("logical error 603");
    }

    if (parseInt(arrResult[0]) != 700) {
        throw new Error(`error ${arrResult[0]}`);
    }

    if (arrResult.length != items) {
        throw new Error(`invalid response item number missmatch`);
    }

    return arrResult
}

module.exports.parseResponse = parseResponse;
module.exports.calculateStep2 = function(m_oContext, key, password) {
    key = parseInt(key) >>> 0;
    let sPasswordToken = password + "+" + key;
    sPasswordToken = sPasswordToken.substring(0, 32);
    const iPasswordToken = (MakeCRC32(String2UTF8(sPasswordToken)) ^ key) >>> 0;
    const iServerChallengeToken = (m_oContext.m_iKey1A1 ^ m_oContext.m_iKey1A2 ^ m_oContext.m_iKey1B1 ^ m_oContext.m_iKey1B2 ^ key) >>> 0;
    return `UAMLOGIN:${m_oContext.m_sUserName},${iPasswordToken},${iServerChallengeToken}`;
}


module.exports.calculateStep1 = function (m_oContext) {
    /*
    m_oContext.m_iKey1A1 = Math.floor(Math.random() * 4294967296) >>> 0;
    m_oContext.m_iKey1A2 = Math.floor(Math.random() * 4294967296) >>> 0;
    m_oContext.m_iKey1B1 = Math.floor(Math.random() * 4294967296) >>> 0;
    m_oContext.m_iKey1B2 = Math.floor(Math.random() * 4294967296) >>> 0;
*/

    m_oContext.m_iKey1A1 = 10;
    m_oContext.m_iKey1A2 = 20;
    m_oContext.m_iKey1B1 = 30;
    m_oContext.m_iKey1B2 = 40;
    return `UAMCHAL:3,4,${m_oContext.m_iKey1A1},${m_oContext.m_iKey1A2},${m_oContext.m_iKey1B1},${m_oContext.m_iKey1B2}`
}


module.exports.login = async function (oTracer) {
    oTracer.m_iFinishFlag = 0;
    const password = "LOGO";

    const response0 = await axios.get('http://solar-power-skir.herokuapp.com/water/login/challenge1')
    //const response0 = await axios.get('http://127.0.0.1:8080/water/login/challenge1')

    const challenge1 = response0.data;
    const response1 = await axios.post('http://192.168.0.3/AJAX', challenge1)

    const response1_5 = await axios.get(`http://solar-power-skir.herokuapp.com/water/login/challenge2?data=${response1.data}`);
    //const response1_5 = await axios.get(`http://127.0.0.1:8080/water/login/challenge2?data=${response1.data}`);
    console.log(response1_5.data);
    const config = {
        headers: {
            "Security-Hint": response1_5.data.security_hint
        }
    }

    const challenge2 = response1_5.data.challenge2;
    const response2 =  await axios.post('http://192.168.0.3/AJAX', challenge2, config)

    LoginHandlerStep2("" + response2.data, oTracer);

}
