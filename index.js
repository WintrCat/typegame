const express = require("express");
const bodyParser = require("body-parser");
const { readFileSync, writeFileSync } = require("fs");

let server = express();

server.use(bodyParser.json());
server.use("/", express.static("./public"));

server.post("/api/score", (req, res) => {

	if (req.body.username.length == 0 || req.body.username.length > 18 || req.body.score == 0) {
		res.status(400);
		res.send("bad request");
	} else {
		let leaderboard = JSON.parse(readFileSync("./leaderboard.json", "utf-8"));

		if (leaderboard[req.body.username] > req.body.score) {
			res.status(202);
			res.send("you already have a better score");
		} else {
			leaderboard[req.body.username] = req.body.score;

			writeFileSync("./leaderboard.json", JSON.stringify(leaderboard));
			
			res.status(200);
			res.send("thanks");	
		}
		
	}
	
});

server.get("/api/leaderboard", (req, res) => {

	res.send(readFileSync("./leaderboard.json", "utf-8"));
	
});

server.listen(8080, () => {
	console.log("running");
});