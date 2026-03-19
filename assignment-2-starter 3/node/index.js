import http from "http";
import fs from "fs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "xiqFr1VKA+FE15llNOxj2HSXgTw9ER1dkqsMrvEBvFI=";

http
  .createServer((req, res) => {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello Apache!\n");

      return;
    }

    if (req.method === "POST") {
      if (req.url === "/login") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            body = JSON.parse(body);

            // handle a login attempt

            // open up our "database" (actually a flat file called ./users.txt)
            // to see if there is a username/password combination that matches
            // body.username and body.password
            const database = fs.readFileSync("./users.txt", "utf8").trim().split("\n");


            // return a 401 error if the username isn't found
            const matchedUser = database.find((line) => {
              const [userId, username, password, role] = line.split(",");
              return username === body.username;
            });

            if (!matchedUser) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `${body.username} not found` }));
            return;
          }

            // return a 401 error if the username is found but the password doesn't match
              const [userId, username, password, role] = matchedUser.split(",");
              if (password !== body.password) {
                res.writeHead(401, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid password" }));
                return;
              }

            // on success, return an encoded userId and role using your JWT_SECRET.
            // https://www.npmjs.com/package/jsonwebtoken
              const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "1h" });
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ token }));

          } catch (err) {
            console.log(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Server error" }));
          }
        });
      }

      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  })
  .listen(8000);

console.log("listening on port 8000");
