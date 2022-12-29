/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const wind = require('../model/Wind.js');

const summary = require('summary');
const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Stockholm");
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.render('wind');
});

// Debug function
async function reset(id) {
  const windData = await wind.read(id);
  windData.count = 0;
  await wind.write(id, windData);
}

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
    res.send();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});


router.get('/now', async (_, res) => {
  try {
    const windDataNow = await wind.read("now");

    res.json({
        m_per_s: (windDataNow.count * 8.75 / 60 / 100).toFixed(2),
        time: windDataNow.time
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Debug function, not used
router.get('/period/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error({ code: 400, message: 'Missing id parameter' });
    }
    const windData = await wind.read(id);
    res.json(windData);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
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

const window = {
  years: 3,
  months: 13,
  days: 31,
  hours: 25
}

const factor = {
  years: 60 * 60 * 24 * 365,
  months: 60 * 60 * 24 * 30,
  days: 60 * 60 * 24,
  hours: 60 * 60
}

router.get('/graph/:period', async (req, res) => {
  try {
    const period = req.params.period;
    if (!period || !formats[period] || !window[period]) {
      throw new Error({ code: 400, message: `Unknown period: ${period}` });
    }

    const windPromises = []
    for (let index = 1; index < window[period]; index++) {
      windPromises.push(getWindData(index, period));
    }

    const windData = await Promise.all(windPromises);
    const labels = []
    const dataset = []
    windData.forEach(wind => {
      labels.push(wind._id);
      dataset.push(wind.count * 8.75 / factor[period] / 100);
    });

    labels.reverse();
    dataset.reverse();

    const summaryData = summary(dataset);

    res.json({
      p50: summaryData.quartile(0.50),
      p75: summaryData.quartile(0.75),
      labels:labels,
      dataset:dataset,
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;
