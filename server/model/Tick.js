/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const db = require('../db');
const moment = require('moment');

exports.create = function (id) {
  const tick = {
    "id": id,
    "time": new Date().getTime()
  };
    
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
  "TOTAL": 1
}

exports.readLast = function (id, interval) {
  return new Promise(async (resolve, reject) => {
    if (!mapping[interval]) {
      reject(`Unknown interval, ${interval}`);
    }
    interval = (interval === "WEEK" ? 'isoWeek' : interval);
    
    let start;
    if(interval=== "TOTAL") {
      start = 0;
    } else {
      start = moment().startOf(interval).valueOf();
    }
    
    const collection = db.get().collection('ticks');
    const count = await collection.countDocuments({ id: id, time: { "$gte": start } });
    resolve((count / 500).toFixed(2)); // TODO set correct divition
  });
}

exports.history = function (id, interval) {
  return new Promise(async (resolve, reject) => {
    const collection = db.get().collection('ticks');

    let stepsize = 0;
    let steps = 0;
    let format = ""

  
    let start = 0;
    
    if (interval === "DAY") {
      start = moment().startOf("DAY").valueOf();
      steps = 24;
      stepsize = HOUR;
      format = "HH:mm";
    } else if(interval === "MONTH") {
      start = moment().startOf("MONTH").valueOf();
      steps = moment().daysInMonth();
      stepsize = DAY;
      format = "Do";
    } else if(interval === "YEAR") {
      start = moment().startOf("YEAR").valueOf();
      steps = moment().weeksInYear()
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

    collection.aggregate([
      { "$match": { "id": id, time: { $gte: start } } },
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
      { "$addFields": { "kwh": { '$divide': ['$ticks', 500] } } },
      { "$sort": { '_id': 1 } }
    ]).toArray(function (err, docs) {
      if (err) {
        return reject(err);
      }

      docs.forEach(doc => {
        if(doc._id === "Other") {
          return;
        }
        buckets[doc._id].kwh = doc.kwh;
        buckets[doc._id].ticks = doc.ticks;
      });

      resolve(Object.values(buckets));
    });
  });
}
