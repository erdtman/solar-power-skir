/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const water = require('../model/Water.js');
const bodyParser = require('body-parser');

const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Stockholm");
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.render('water');
});

router.post('/measurement', async (req, res) => {
  const waterData = await water.read();

  console.log(req.body);

  console.log(req.body["<rs><r i"]);

  const hexString = req.body["<rs><r i"].substring(9, 13);
  console.log(hexString);
  if (waterData.measurements.length > 144) {
    waterData.measurements.shift();
  }

  const value = {
    raw: hexString,
    parsed: Number('0x'+hexString)/1000*1.5,
    time: new Date().getTime()
  };

  console.log(waterData);

  waterData.measurements.push(value)
  await water.write(waterData)

  res.send();
});

router.get('/measurements', async (_, res) => {
  const waterData = await water.read();

  console.log(waterData);

  res.json(waterData);
});


module.exports = router;
