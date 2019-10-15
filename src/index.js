const app = require("./app");
const log = require("./utils/logger");

const port = process.env.PORT;

console.log("Using Port : ", port);

// Wait for the DB to connect, on event start listening     
app.on("db-ready", function() {
    app.listen(port, () => {
        log.i(`PANO-MGR Server listening on Port ${port}`);
    })
});

// If DB failes, then do not start the server
app.on("db-failed", function() {
    log.e("Failed to connect to DB. PANO-MGR will not start...");
})
