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

  const hexString = req.body["<rs><r i"].substring(14, 18);

  if (waterData.measurements.length > 144) {
    waterData.measurements.shift();
  }

  const value = {
    raw: hexString,
    parsed: Number('0x'+hexString)/1000*1.5,
    time: new Date().getTime()
  };

  console.log(value);

  waterData.measurements.push(value)
  await water.write(waterData)

  res.send();
});

router.get('/measurements', async (_, res) => {
  const waterData = await water.read();

  console.log(waterData);

  const labels = waterData.measurements.filter(value => !Number.isNaN(value.parsed)).map(value => {
    return moment(value.time).format("YYYY-MM-DD HH:mm");
  });
  console.log(labels);

  const dataset = waterData.measurements.filter(value => !Number.isNaN(value.parsed)).map(value => {
    return (value.parsed * 1000).toFixed(0);
  });
  console.log(dataset);

  const latest = waterData.measurements.at(-1)

  res.json({
    labels:labels,
    dataset:dataset,
    latest: {
      value: (latest.parsed * 1000).toFixed(0),
      time: moment(latest.time).format("YYYY-MM-DD HH:mm")
    }
  });
});


module.exports = router;
