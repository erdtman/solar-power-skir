/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const tick = require('../model/Tick.js');
const moment = require('moment');
const express = require('express');
const router = express.Router();

const createData = (tractor_garage, glade, weave_room) =>({
  tractor_garage: tractor_garage.toFixed(3),
  glade: glade.toFixed(3),
  weave_room: weave_room.toFixed(3),
  total: (tractor_garage + weave_room + glade).toFixed(3)
});

const sweDay = {
  "Sunday":     "Lördag",
  "Saturday":   "Lördag",
  "Friday":     "Fredag",
  "Thursday":   "Torsdag",
  "Wednesday":  "Onsdag",
  "Tuesday":    "Tisdag",
  "Monday":     "Måndag"
}

const sweMonth = {
  "January":    "January",
  "February":   "Februari",
  "March":      "Mars",
  "April":      "April",
  "May":        "Maj",
  "June":       "Juni",
  "July":       "Juli",
  "August":     "Augusti",
  "September":  "September",
  "October":    "Oktober",
  "November":   "November",
  "December":   "December"
}

const title = {
  DAY(date, lookback) {
    const now = moment();
    return lookback === 0 ? `Idag` : sweDay[date.format("dddd")];
  },
  MONTH(date) {
    return sweMonth[date.format('MMMM')];
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

router.post('/tick/:id', (req, res) => {
  const start = new Date().getMilliseconds();
  const id = req.params.id;

  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  const ticks = req.body.tick_count || 1;

  tick.create(id, ticks);
  res.send();
  const end = new Date().getMilliseconds();
  console.log(`id=${id}, tick_count=${req.body.tick_count}, last_rtt=${req.body.last_rtt}, time=${end - start}, start_time=${req.body.start_time}`);
});

router.get('/now', async (_, res) => {
  const tractor_garage = await tick.readLast('traktorgaraget', '5_MIN', 12);
  const glade = await tick.readLast('skogsglantan', '5_MIN', 12);
  const weave_room = await tick.readLast('weave_room', '5_MIN', 12);
  const data = createData(tractor_garage, glade, weave_room, 2);
  res.json(data);
});

router.get('/period', async (req, res) => {
  const lookback = Number(req.query.lookback || 0);
  const interval = req.query.interval || "DAY";

  if(!title[interval] || !lookback_unit[interval]) {
    throw new Error(`Unhandeled intervall ${interval}`);
  }

  const date = moment().subtract(lookback, lookback_unit[interval]);

  const tractor_garage = await tick.readPeriod('traktorgaraget', interval, date);
  const glade = await tick.readPeriod('skogsglantan', interval, date);
  const weave_room = await tick.readPeriod('weave_room', interval, date);
  const data = createData(tractor_garage, glade, weave_room);
  data.title = title[interval](date, lookback);

  res.json(data);
});

router.get('/tick/:id', async (req, res) => {
  const interval = req.query.interval || "HOUR";
  const id = req.params.id;
  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  const lastX = await tick.read(id, interval, 1);
  res.send(lastX);
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
  const id = req.params.id;

  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  if(!title[interval] || !lookback_unit[interval]) {
    throw new Error(`Unhandeled intervall ${interval}`);
  }

  const date = moment().subtract(lookback, lookback_unit[interval]);
  const history = await tick.history(id, interval, date);

  res.json({
    label: title[interval](date, lookback),
    history: history
  });
});

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.code)
  res.send(err.message);
});

module.exports = router;
