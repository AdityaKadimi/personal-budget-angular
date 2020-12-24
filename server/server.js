const express = require("express");

const app = express();

app.use(express.static("./dist/personal-budget-angular"));

app.get("/*", (req, res) => {
  res.sendFile("index.html", { root: "./dist/personal-budget-angular/" });
});

app.listen(process.env.PORT || 8080);
