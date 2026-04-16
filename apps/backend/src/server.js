require("dotenv").config({ path: __dirname + "/../.env" });

const app = require("./app");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PagePulse server running on http://localhost:${PORT}`);
});
