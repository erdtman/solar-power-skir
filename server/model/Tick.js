/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const db = require('../db');
const moment = require('moment');

exports.create = function (id, tick_count) {
  const tick = {
    "id": id,
    "time": new Date().getTime()
  };

  if (tick_count && tick_count !== '1') {
    tick.tick_count = parseInt(tick_count, 10);
  }

  const collection = db.get().collection('ticks');
  collection.insertOne(tick);
};

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const mapping = {
  "MINUTE": MINUTE,
  "HOUR": HOUR,
  "DAY": DAY,
  "WEEK": WEEK,
  "MONTH": MONTH,
  "YEAR": YEAR,
  "TOTAL": 1,
  "5_MIN": 2
}



exports.read = function (id, interval, multiplyWith, date) {
  return new Promise(async (resolve, reject) => {
    if (!mapping[interval]) {
      return reject(`Unknown interval, ${interval}`);
    }
    interval = (interval === "WEEK" ? 'isoWeek' : interval);

    let start;
    if (interval=== "TOTAL") {
      start = 0;
    } else if (interval === "5_MIN") {
      const now = new Date().getTime();
      start = now - MINUTE * 5;
    } else {
      start = moment().startOf(interval).valueOf();
    }

    const collection = db.get().collection('ticks');

    const list = await collection.aggregate([
      { $match: { "id": id, time: { $gte: start } } }]).toArray();

    resolve(list); // TODO set correct divition
  });
}

exports.readLast = function (id, interval, multiplyWith, date) {
  return new Promise(async (resolve, reject) => {
    if (!mapping[interval]) {
      return reject(`Unknown interval, ${interval}`);
    }
    interval = (interval === "WEEK" ? 'isoWeek' : interval);

    let start;
    if (interval=== "TOTAL") {
      start = 0;
    } else if (interval === "5_MIN") {
      const now = new Date().getTime();
      start = now - MINUTE * 5;
    } else {
      start = moment().startOf(interval).valueOf();
    }

    const collection = db.get().collection('ticks');

    const count = await collection.aggregate([
      { $match: { "id": id, time: { $gte: start } } },
      { $group: {
        _id : null,
        ticks : {
          $sum: {
            $ifNull: [ "$tick_count", 1 ]
          }
        }
      }
    }]).next();

    if (!count) {
      return resolve(0);
    }

    resolve(count.ticks / 1000 * multiplyWith); // TODO set correct divition
  });
}

exports.readPeriod = function (id, interval, start_date) {
  return new Promise(async (resolve, reject) => {
    if (!mapping[interval]) {
      return reject(`Unknown interval, ${interval}`);
    }
    interval = (interval === "WEEK" ? 'isoWeek' : interval);

    const start = start_date.startOf(interval).valueOf();
    const end = start_date.endOf(interval).valueOf();
    const collection = db.get().collection('ticks');

    const count = await collection.aggregate([
      { $match: { "id": id, $and: [
        {time: { $gte: start }},
        {time: { $lte: end }}
      ] } },
      { $group: {
        _id : null,
        ticks : {
          $sum: {
            $ifNull: [ "$tick_count", 1 ]
          }
        }
      }
    }]).next();

    if (!count) {
      return resolve(0);
    }

    resolve(count.ticks / 1000); // TODO set correct divition
  });
}

exports.history = function (id, interval, start_date) {
  return new Promise(async (resolve, reject) => {
    const collection = db.get().collection('ticks');

    let stepsize = 0;
    let steps = 0;
    let format = ""

    start_date = start_date || moment()
    const start = start_date.startOf(interval).valueOf();
    const end = start_date.endOf(interval).valueOf();
    if (interval === "DAY") {
      steps = 24;
      stepsize = HOUR;
      format = "HH:mm";
    } else if(interval === "MONTH") {
      steps = start_date.daysInMonth();
      stepsize = DAY;
      format = "Do";
    } else if(interval === "YEAR") {
      steps = start_date.weeksInYear()
      stepsize = WEEK;
      format = "[Vecka] W";
    } else {
      throw Error(`Unknown interval '${interval}'`)
    }

    const boundaries = [];
    const buckets = {};
    for (let i = 0; i <= steps; i++) {
      const id = start + (i * stepsize)
      boundaries.push(id);
      buckets[id] = {
        label: moment(id).format(format),
        ticks: 0,
        kwh: 0
      }
    }

    const docs = await collection.aggregate([
      { "$match": { "id": id, $and: [
        {time: { $gte: start }},
        {time: { $lte: end }}
      ] } },
      {
        "$bucket": {
          "groupBy": "$time",
          "boundaries": boundaries,
          "default": "Other",
          output: {
            "ticks": { $sum: {$ifNull: [ "$tick_count", 1 ]} },
          }
        }
      },
      { "$addFields": { "kwh": { '$divide': ['$ticks', 1000] } } },
      { "$sort": { '_id': 1 } }
    ]).toArray();

    docs.forEach(doc => {
      if(doc._id === "Other") {
        return;
      }
      buckets[doc._id].kwh = doc.kwh;
      buckets[doc._id].ticks = doc.ticks;
    });
    resolve(Object.values(buckets));
  });
}
