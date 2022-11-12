/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const wind = require('../model/Wind.js');

const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Stockholm");
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.render('wind');
});

async function addTo(id, count) {
  const windData = await wind.read(id);
  windData.count += count;
  await wind.write(id, windData);
}

async function now(count) {
  const windData = await wind.read("now");
  windData.count = count;
  windData.time = moment().format("YYYY-MM-DD HH:MM");
  console.log(windData);
  await wind.write("now", windData);
}

router.post('/count', async (req, res) => {
  try {
    console.log(req.body);

    if(!req.body.count) {
      throw new Error("missing count parameter");
    }

    const count = new Number(req.body.count).valueOf();

    const nowTime = moment();
    await addTo(nowTime.format("YYYY-MM-DD-HH"), count);
    await addTo(nowTime.format("YYYY-MM-DD"), count);
    await addTo(nowTime.format("YYYY-MM"), count);
    await addTo(nowTime.format("YYYY"), count);
    await now(count);

  } catch (error) {
    console.log("typiskt");
    console.log(error);
  }

  res.send();
});

router.get('/now', async (_, res) => {
  const windDataNow = await wind.read("now");
  console.log(windDataNow);
  res.json({
    m_per_s: (windDataNow.count*8.75/60/100).toFixed(2),
    time: windDataNow.time
  });
});


module.exports = router;
