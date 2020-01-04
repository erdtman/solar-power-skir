/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const tick = require('../model/Tick.js');
const moment = require('moment');
const express = require('express');
const router = express.Router();


router.get('/now', async (req, res) => {
  const data = {
    tractor_garage: await tick.readLast('traktorgaraget', '5_MIN', 12),
    glade: await tick.readLast('glade', '5_MIN', 12),
    weave_room: await tick.readLast('weave_room', '5_MIN', 12),
  };
  data.total = (data.tractor_garage + data.weave_room + data.glade).toFixed(2);

  res.json(data);
});

const title = {
  DAY(date) {
    const now = moment();
    return now.isSame(date) ? `Idag` : date.format("YYYY-MM-DD");
  },
  MONTH(date) {
    return date.format('MMMM');
  },
  YEAR(date) {
    return date.format('YYYY')
  }
}

const lookback_unit = {
  DAY: 'days',
  MONTH: 'months',
  YEAR: 'years',
}

router.get('/period', async (req, res) => {  
  const lookback = Number(req.query.lookback || 0);
  const interval = req.query.interval || "DAY";

  console.log(`${interval} - lookback=${lookback}`);

  if(!title[interval] || !lookback_unit[interval]) {
    throw new Error(`Unhandeled intervall ${interval}`);
  }

  const date = moment().subtract(lookback, lookback_unit[interval]);

  const data = {
    title: title[interval](date),
    tractor_garage: await tick.readPeriod('traktorgaraget', interval, date),
    glade: await tick.readPeriod('glade', interval, date),
    weave_room: await tick.readPeriod('weave_room', interval, date),
  };
  data.total = (data.tractor_garage + data.weave_room + data.glade).toFixed(2);

  res.json(data);
});

router.post('/tick/:id', (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }
  
  const ticks = req.body.tick_count || 1;
  
  tick.create(id, ticks);
  res.send();
});

router.get('/tick/:id/last', async (req, res) => {
  const interval = req.query.interval || "HOUR";
  const id = req.params.id;
  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  const lastX = await tick.readLast(id, interval, 1);
  res.send(lastX);
});

router.get('/tick/:id/graph', async (req, res) => {
  const lookback = Number(req.query.lookback || 0);
  const interval = req.query.interval || "DAY";

  console.log(`graph - ${interval} - lookback=${lookback}`);

  if(!title[interval] || !lookback_unit[interval]) {
    throw new Error(`Unhandeled intervall ${interval}`);
  }

  const date = moment().subtract(lookback, lookback_unit[interval]);
  const id = req.params.id;
  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  const history = await tick.history(id, interval, date);

  let label = "empty";
  if (interval === "DAY") {
    label = "idag";
  } else if (interval === "MONTH") {
    label = moment().format('MMMM');
  } else if (interval === "YEAR") {
    label = moment().format('YYYY');
  } 

  res.json({
    label: label,
    history: history
  });
});

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.code)
  res.send(err.message);
});

module.exports = router;
