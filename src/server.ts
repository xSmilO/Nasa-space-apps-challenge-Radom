import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173/",
    })
);

app.get("/getStyle", async (_, result) => {
    const apiKey: string = process.env.MAP_TILER_API_KEY as string;
    const style: Response = await fetch(
        `https://api.maptiler.com/maps/openstreetmap/style.json?key=${apiKey}`
    );
    const data: any = await style.json();
    result.json(data);
});

app.get("/getSearchResults", async (request, result) => {
    const query: string = request.query.query as string;
    const results: Response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&accept-language=en`
    );
    const data: any = await results.json();

    result.json(data);
});

app.listen(3001, () =>
    console.log("Server's running at: \x1b[7mhttp://localhost:3001\x1b[0m.")
);
