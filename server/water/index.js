/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const water = require('../model/Water.js');
const { makeCall, sendSMS } = require('./alert/sender.js');
const auth = require("./login/login.js")


const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Stockholm");
const express = require('express');
const router = express.Router();

const UPPER_LIMIT = 1250;
const LOWER_LIMIT = 500;

router.get('/', (req, res) => {
  res.render('water');
});


function toCM(hexString) {
  return Number('0x'+hexString)*1.5
}

router.post('/measurement', async (req, res) => {
  try {
    const waterData = await water.read();

    console.log(req.body);

    // TOOD fix more robust parsing
    const hexString = req.body["<rs><r i"].substring(14, 18);

    console.log(hexString);

    if (waterData.measurements.length > 288) {
      waterData.measurements.shift();
    }

    const parsed = toCM(hexString);

    if (parsed > UPPER_LIMIT) {
      await sendSMS(`VARNING: Vattennivän är över max (${parsed})`, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_TO_NUMBER);
      await makeCall(`https://solar-power-skir.herokuapp.com/water/voice/high.mp3`, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_TO_NUMBER);
    }

    if (parsed < LOWER_LIMIT) {
      await sendSMS(`VARNING: Vattennivän är under min (${parsed})`, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_TO_NUMBER);
      await makeCall(`https://solar-power-skir.herokuapp.com/water/voice/low.mp3`, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_TO_NUMBER);
    }

    const value = {
      raw: hexString,
      time: new Date().getTime()
    };

    waterData.measurements.push(value)
    await water.write(waterData)
  } catch (error) {
    console.log("typiskt");
    //await sendSMS(`Problem med vattenmonitoreringen!`, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_ERROR_NUMBER);
    console.log(error);
  }

  res.send();
});

router.get('/measurements', async (_, res) => {
  const waterData = await water.read();

  const labels = waterData.measurements.filter(value => !Number.isNaN(value.parsed)).map(value => {
    return moment(value.time).format("YYYY-MM-DD HH:mm");
  });

  const dataset = waterData.measurements.filter(value => !Number.isNaN(value.parsed)).map(value => {
    return toCM(value.raw).toFixed(0);
  });

  const latest = waterData.measurements.at(-1)

  res.json({
    lower_alert: LOWER_LIMIT,
    upper_alert: UPPER_LIMIT,
    labels:labels,
    dataset:dataset,
    latest: {
      value: toCM(latest.raw).toFixed(0),
      time: moment(latest.time).format("YYYY-MM-DD HH:mm")
    }
  });
});

const auth_context = {
  m_bKeeySignIn: false,
  m_bLogToCustomizedSite: false,
  m_iLang: "1",
  // m_oButtonLogin: button#button_login
  // m_oInputPassword: input#input_password
  m_sPublicKey1: "0",
  m_sPublicKey2: "0",
  m_sUserName: "Web User"
}

router.get('/login/challenge1', async (_, res) => {
  console.log("login challenge1");
  console.log("context before");
  console.log(auth_context);

  auth.calculateStep1(auth_context);
  console.log("context after");
  console.log(auth_context);
  res.send(`UAMCHAL:3,4,${auth_context.m_iKey1A1},${auth_context.m_iKey1A2},${auth_context.m_iKey1B1},${auth_context.m_iKey1B2}`);
});

router.get('/login/challenge2', async (req, res) => {
  console.log("login challenge2");
  console.log(auth_context);
  const password = process.env.LOGO_PASSWORD;
  const data = req.query.data
  const arrResult = auth.parseResponse(data, 3);

  const challenge2 = auth.calculateStep2(auth_context, arrResult[2], password);

  res.json({
    "security_hint": arrResult[1],
    "challenge2": challenge2
  });
});

module.exports = router;
