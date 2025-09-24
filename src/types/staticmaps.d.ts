declare module 'staticmaps' {
  interface StaticMapsOptions {
    width?: number;
    height?: number;
    tileUrl?: string;
    tileSize?: number;
  }

  interface MarkerOptions {
    coord: [number, number];
    img?: string;
    width?: number;
    height?: number;
  }

  interface LineOptions {
    coords: [number, number][];
    color?: string;
    width?: number;
  }

  interface PolygonOptions {
    coords: [number, number][][];
    color?: string;
    fillColor?: string;
    width?: number;
  }

  class StaticMaps {
    constructor(options?: StaticMapsOptions);
    render(center: [number, number], zoom: number): Promise<void>;
    addMarker(marker: MarkerOptions): Promise<void>;
    addLine(line: LineOptions): Promise<void>;
    addPolygon(polygon: PolygonOptions): Promise<void>;
    image: {
      save(path: string): Promise<void>;
    };
  }

  export = StaticMaps;
}