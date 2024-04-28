/*jshint esversion: 6 */
/*jslint node: true */
'use strict';
require('dotenv').config();
const wind = require('../model/Wind.js');
const fs = require('fs');
const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Stockholm");
const db = require('../db.js');

const url = process.env.MONGODB_URI || process.env.MONGOHQ_URL;

async function read() {
    const err = await db.connect(url)
    if (err) {
        return console.log('Unable to connect to Mongo');
    }
    console.log('Connected to Mongo')

    let current = moment("2022-11-01 00:00", "YYYY-MM-DD hh:mm");
    const end = moment("2023-01-06 00:00", "YYYY-MM-DD hh:mm");

    console.log("sending requests");
    const windPromises = []
    while (current.isBefore(end)) {
        windPromises.push(wind.read(current.format("YYYY-MM-DD-hh")));
        current = current.add(1, "h");
    }
    console.log("waiting for responses");
    const windData = await Promise.all(windPromises);

    console.log("processing responses");
    const lines = windData.map(wind => {
        const  speed = wind.count * 8.75 / (60 * 60) / 100;
        return `${wind._id};${speed}`;
    });
    console.log("writing to file");
    const toFile = lines.join("\n");
    fs.writeFileSync('winddata.csv', toFile);
    console.log("done");
}

read()

