/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

const db = require('../db');
const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Stockholm");

exports.write = function(id, value) {
  return new Promise((resolve, reject) => {
    const collection = db.get().collection('wind');

    collection.replaceOne({_id:id}, value, { upsert: true }, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

exports.read = function(id) {
  return new Promise((resolve, reject) => {
    const collection = db.get().collection('wind');

    collection.findOne({_id:id}, (err, doc) => {
      if (err) {
        return reject(err);
      }

      if(!doc) {
        const newWind = {
            count: 0
        }
        newWind._id = id;
        return resolve(newWind);
      }

      resolve(doc);
    });
  });
};
