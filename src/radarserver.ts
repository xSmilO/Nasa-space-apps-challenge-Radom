import express from "express";
import StaticMaps from "staticmaps";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath: string = path.join(__dirname, "./../assets/map.png");

const app = express();

app.use(cors({
  origin: "http://localhost:5173/"
}));

app.get("/generate", async (request, result) => {
  const longitude: number = parseFloat(request.query.longitude as string);
  const latitude: number = parseFloat(request.query.latitude as string);
  const zoom: number = parseFloat(request.query.zoom as string);
  const map = new StaticMaps({width: 400, height: 300});

  try {
    console.log("Generating for: ", longitude, latitude, zoom)

    await map.render([longitude, latitude], zoom);
    await map.image.save(filePath);

    result.sendFile(filePath);
  } catch(error) {
    console.log(error);
    result.sendStatus(100).send("An error occurred while generating the map.");
  }
});

app.listen(3001, () => console.log("Map server running on: http://localhost:3001."));