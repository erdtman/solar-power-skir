

const login = require("../server/water/login.js")

const oTracer = {
    m_bKeeySignIn: true,
    m_bLogToCustomizedSite: false,
    m_iLang: "1",
    // m_oButtonLogin: button#button_login
    // m_oInputPassword: input#input_password
    m_sPassword: "",
    m_sPublicKey1: "0",
    m_sPublicKey2: "0",
    m_sUserName: "Web User"
}


login(oTracer);