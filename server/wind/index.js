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
  windData.time = moment().format("YYYY-MM-DD HH:mm");
  console.log(windData);
  await wind.write("now", windData);
}

router.post('/count', async (req, res) => {
  try {
    console.log(req.body);

    if (!req.body.count) {
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
    m_per_s: (windDataNow.count * 8.75 / 60 / 100).toFixed(2),
    time: windDataNow.time
  });
});

router.get('/period/:id', async (req, res) => {

  const id = req.params.id;

  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  const seconds = 60 * 60;
  const windData = await wind.read(id);
  console.log(windData);
  res.json({
    m_per_s: (windData.count * 8.75 / seconds / 100).toFixed(2),
    time: windData.time
  });
});


async function getWindData(lookback, period) {
  const id = moment().subtract(lookback, period).format(formats[period]);
  return await wind.read(id);
}

const formats = {
  years: "YYYY",
  months: "YYYY-MM",
  days: "YYYY-MM-DD",
  hours: "YYYY-MM-DD-HH"
}

const factor = {
  years: 60 * 60 * 24 * 365, // TODO adjust for leap year
  months: 60 * 60 * 24 * 30, // TODO fix exact days in month
  days: 60 * 60 * 24,
  hours: 60 * 60
}

router.get('/graph/:period', async (req, res) => {
  try {

    const period = req.params.period;

    if (!period || !formats[period]) {
      throw new Error({ code: 400, message: `Unknown period: ${period}` });
    }

    const seconds = factor[period];
    const respData = [];
    const labels = []
    const dataset = []
    for (let index = 0; index < 24; index++) {
      const wind = await getWindData(index, period)
      console.log(wind);
      const data = {
        m_per_s: (wind.count * 8.75 / seconds / 100).toFixed(2),
        time: wind._id
      }
      labels.push(wind._id);
      dataset.push(wind.count * 8.75 / seconds / 100);
      respData.push(data);
    }


    console.log({
      labels:labels,
      dataset:dataset,
    });

    const windDataNow = await wind.read("now");
    console.log(windDataNow);


    res.json({
      latest: {
        m_per_s: (windDataNow.count * 8.75 / 60 / 100).toFixed(2),
        time: windDataNow.time
      },
      labels:labels,
      dataset:dataset,
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



module.exports = router;
