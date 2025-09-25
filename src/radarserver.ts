import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173/"
}));

app.get("/getStyle", async (request, result) => {
  const apiKey = process.env.MAP_TILER_API_KEY;
  const style = await fetch(`https://api.maptiler.com/maps/topo-v2/style.json?key=${apiKey}`);
  const data = await style.json();

  result.json(data);
});

app.listen(3001, () => console.log("Radar-generating server running on: \x1b[7mhttp://localhost:3001\x1b[0m."));