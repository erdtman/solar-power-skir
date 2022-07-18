/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const water = require('../model/Water.js');
const { makeCall } = require('./alert/sender.js');

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
      //await sendSMS(`VARNING: Vattennivän är över max`, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_TO_NUMBER);
      await makeCall(``, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_TO_NUMBER);
    }

    if (parsed < LOWER_LIMIT) {
      //await sendSMS(`VARNING: Vattennivän är under min`, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_TO_NUMBER);
      await makeCall(``, process.env.ELKS_USERNAME, process.env.ELKS_PASSWORD, process.env.ELKS_TO_NUMBER);
    }

    const value = {
      raw: hexString,
      time: new Date().getTime()
    };

    waterData.measurements.push(value)
    await water.write(waterData)
  } catch (error) {
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


module.exports = router;
