const { default: axios } = require("axios");
const { MakeCRC32 } = require("./encrypt.js")
const { String2UTF8 } = require("./utility")


//////////////////////////////////////////////////////////////////////////
//login APIs:
function LoginHandlerStep2(responseText, m_oContext) {
    const sResponseText = "" + responseText;
    const arrResult = sResponseText.split(",");
    if (isNaN(parseInt(arrResult[0]))) {
        throw new Error("s2 logical error 603");
    }

    if (parseInt(arrResult[0]) != 700) {
        throw new Error(`s2 error ${arrResult[0]}`);
    }

    if (arrResult.length != 2) {
        throw new Error(`s2 invalid response on step1`);
    }

    m_oContext.m_sRef = arrResult[1];
    console.log(`login success: ${arrResult[1]}`);
}

async function LoginHandlerStep1(sResponseText, m_oContext) {
    const arrResult = sResponseText.split(",");

    if (isNaN(parseInt(arrResult[0]))) {
        throw new Error("logical error 603");
    }

    if (parseInt(arrResult[0]) != 700) {
        throw new Error(`error ${arrResult[0]}`);
    }

    if (arrResult.length != 3) {
        throw new Error(`invalid response on step1`);
    }

    m_oContext.m_sRef = arrResult[1];
    m_oContext.m_iKey2 = parseInt(arrResult[2]) >>> 0;

    var sPasswordToken = m_oContext.m_sPassword + "+" + m_oContext.m_iKey2;
    sPasswordToken = sPasswordToken.substr(0, 32);
    const iPasswordToken = (MakeCRC32(String2UTF8(sPasswordToken)) ^ m_oContext.m_iKey2) >>> 0;
    const iServerChallengeToken = (m_oContext.m_iKey1A1 ^ m_oContext.m_iKey1A2 ^ m_oContext.m_iKey1B1 ^ m_oContext.m_iKey1B2 ^ m_oContext.m_iKey2) >>> 0;
    const challenge = `UAMLOGIN:${m_oContext.m_sUserName},${iPasswordToken},${iServerChallengeToken}`;

    const config = {
        headers: {
            "Security-Hint": m_oContext.m_sRef
        }
    }

    const response =  await axios.post('http://192.168.0.3/AJAX', challenge, config)
    LoginHandlerStep2(response.data, m_oContext);
}

module.exports = async function Login(oTracer) {
    oTracer.m_iFinishFlag = 0;
    oTracer.m_iKey1A1 = Math.floor(Math.random() * 4294967296) >>> 0;
    oTracer.m_iKey1A2 = Math.floor(Math.random() * 4294967296) >>> 0;
    oTracer.m_iKey1B1 = Math.floor(Math.random() * 4294967296) >>> 0;
    oTracer.m_iKey1B2 = Math.floor(Math.random() * 4294967296) >>> 0;

    const challenge = `UAMCHAL:3,4,${oTracer.m_iKey1A1},${oTracer.m_iKey1A2},${oTracer.m_iKey1B1},${oTracer.m_iKey1B2}`

    const response = await axios.post('http://192.168.0.3/AJAX', challenge)
    LoginHandlerStep1(response.data, oTracer);

}
