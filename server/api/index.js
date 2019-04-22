/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const tick = require('../model/Tick.js');
const moment = require('moment');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  const now = moment();
  const data = {
    month_text: now.format('MMMM'),
    year_text: now.format('YYYY')
  };

  data.weave_room = {
    today_value: await tick.readLast('test1', 'DAY'),
    month_value: await tick.readLast('test1', 'MONTH'),
    year_value: await tick.readLast('test1', 'YEAR'),
    total_value: await tick.readLast('test1', 'TOTAL')
  };

  data.tractor_garage = {
    today_value: 3,
    month_value: 32,
    year_value: 124,
    total_value: 4321
  };

  data.glade = {
    today_value: 43,
    month_value: 121,
    year_value: 342,
    total_value: 1233
  };

  res.json(data);
});

router.post('/tick/:id', (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  tick.create(id);
  res.send();
});

router.get('/tick/:id/last', async (req, res) => {
  const interval = req.query.interval || "HOUR";
  const id = req.params.id;
  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  const lastX = await tick.readLast(id, interval);
  res.send(lastX);
});

router.get('/tick/:id/graph', async (req, res) => {
  const interval = req.query.interval || "DAY";
  const id = req.params.id;
  if (!id) {
    throw new Error({ code: 400, message: 'Missing id parameter' });
  }

  const history = await tick.history(id, interval);

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
