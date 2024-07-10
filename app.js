

dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const compression = require("compression");
const apiRoutes = require("./routes/api");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const flash = require("connect-flash");
const db_connection = require("./database/db.configurations").connectDB;
const PORT = process.env.PORT || 3000;

/**
 * cluster implementation
 * 
 * 
 * 
 */
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
        console.log(`Worker ${i} started`);
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log('Starting a new worker');
        cluster.fork();
    });

} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server

    //-------------------
    //connect to database
    //-------------------
    db_connection()
        .then(() => {
            console.log("Successfully connected to database");
        })
        .catch((err) => {
            console.log("Error connecting to database", err);
            process.exit();
        });

    //------------------
    //configure app
    //------------------
    app.use(cors());
    app.use(morgan("dev"));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(compression());

    //define routes
    app.use("/api/v1", apiRoutes);
    app.use("*", (req, res) => {
        res.status(404).json([
            {
                status: false,
                message: `The URL ${req.originalUrl} is not on this server`,
            },
        ]);
    });

    //error handling
    // app.use((err, req, res, next) => {
    //     console.error(err.stack);
    //     res.status(500).json([{ status: false, message: "Something broke!" }]);
    // });

    //start server
    app.listen(`${PORT}`, () => {
        console.log(
            `  -----------------------------------------------
   Server running at http://localhost:${PORT}
   Server Started at ${new Date()},
  -----------------------------------------------`
        );
        console.log(`Worker ${process.pid} started`);
    });
}
