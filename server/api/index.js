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
    now_value: 0,
    today_value: 0,
    month_value: 0,
    year_value: 0,
    total_value: 0
  };

  data.tractor_garage = {
    now_value: await tick.readLast('traktorgaraget', '5_MIN', 12), 
    today_value: await tick.readLast('traktorgaraget', 'DAY', 1),
    month_value: await tick.readLast('traktorgaraget', 'MONTH', 1),
    year_value: await tick.readLast('traktorgaraget', 'YEAR', 1),
    total_value: await tick.readLast('traktorgaraget', 'TOTAL', 1) 
  };

  data.glade = {
    now_value: 0,
    today_value: 0,
    month_value: 0,
    year_value: 0,
    total_value: 0
  };

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
