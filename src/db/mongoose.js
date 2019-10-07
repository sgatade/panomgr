const log = require("../utils/logger");
const mongoose = require("mongoose");

// Create DB URL
const db_url =
  "mongodb://" +
  process.env.DB_IP +
  ":" +
  process.env.DB_PORT +
  "/" +
  process.env.DB_NAME;

// Connect to DB
const con_wait = parseInt(process.env.DB_CONN_WAIT) || 15000; 
const con_retry = parseInt(process.env.DB_CONN_RETRY) || 5;
let con_count = 0;

const connect = function(app) {
    
    return mongoose.connect(db_url,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    },
    function(err) {
        // Increase connection count
        con_count++;
        if (err) {
            log.e(`[Attempt ${con_count}/${con_retry}] DB Connection (${db_url}) failed, waiting ${con_wait / 1000} seconds before trying again...`);

            if (con_count < con_retry) {
                setTimeout(() => {
                    connect(app);
                }, con_wait);
            } else {
                log.e(`[CRITICAL] Failed to connect to DB @ (${db_url}) after ${con_count} attempt(s)!`);
                app.emit("db-failed");
            }

        } else {

            // Connected to DB
            if(con_count <= 1) {
                log.i(`Connected to DB (${db_url}) on 1st attempt!`);
            } else {
                log.i(`Connected to DB (${db_url}) after ${con_count} attempts!`);
            }
            
            app.emit("db-ready"); // Emit db-ready event for app-server to start
        }
      }
    );
};

module.exports = connect;
