"use strict";

var dbm;
var type;
var seed;

const SQL_QUERY = require("../db/migrationScript/dbScript");

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  db.runSql(SQL_QUERY.CREATE_RANDOM_USER_PROFILE_TABLE, callback);
};

exports.down = function (db) {
  db.runSql(SQL_QUERY.DROP_RANDOM_USER_PROFILE_TABLE, callback);
};

exports._meta = {
  version: 1,
};
