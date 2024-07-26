import 'dotenv/config'
import express from "express";
 import connectDB from "./config/database.js";
import  userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import https from "https";
import fs from "fs";
import path from "path";
 import  http from "http";
 import { fileURLToPath } from "url";

 // Convert `import.meta.url` to a file path
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const HTTP_PORT = process.env.HTTP_PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));



// Read SSL certificate and key
const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
};


// Redirect HTTP to HTTPS
const redirectApp = express();
redirectApp.get('*', (req, res) => {
  res.redirect(`https://${req.hostname}:${HTTPS_PORT}${req.url}`);
});

 app.use("/api/v1", userRoute);
 app.use("/api/v1",postRoute);


app.get("/", (req, res) => {
  res.send("Welcome to our Social Media API");
});



server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${HTTPS_PORT}`);
});

http.createServer(redirectApp).listen(HTTP_PORT, () => {
  console.log(`HTTP Server running on http://localhost: ${HTTP_PORT}, redirecting to HTTPS`);
});