/*jshint esversion: 6 */
/*jslint node: true */
'use strict';

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send("Hello hello...");
});

module.exports = router;
