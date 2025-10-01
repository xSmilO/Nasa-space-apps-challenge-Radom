import { SearchResult } from "./searchResult";
import Environment from "../core/environment";

export class SearchBar {
  private timeout?: NodeJS.Timeout = undefined;
  private environment: Environment;

  public container: HTMLDivElement;
  public input: HTMLInputElement;
  public searchResultsContainer: HTMLDivElement;

  constructor(environment: Environment) {
    this.environment = environment;
    this.container = document.getElementById("searchBarContainer") as HTMLDivElement;
    this.input = document.getElementById("searchBar") as HTMLInputElement;
    this.searchResultsContainer = document.getElementById("searchResultsContainer") as HTMLDivElement;
  }

  public updateSearchResults(): void {
    this.stopQuerying();

    this.timeout = setTimeout(() => {
      fetch(`/server/getSearchResults?query=${this.input.value}`, {}).then((response: Response) => {
        response.json().then((data: any) => {
          this.clearSearchResults();

          const placesMapped: { [name: string]: { latitude: number, longitude: number } } = {};

          for (const key in data) {
            const searchResult = data[key];
            const text: string = searchResult.display_name;
            const latitude: number = parseFloat(searchResult.lat);
            const longitude: number = parseFloat(searchResult.lon);

            placesMapped[text] = {
              latitude: latitude,
              longitude: longitude
            };
          }

          for (const name in placesMapped) {
            const place = placesMapped[name];
            this.searchResultsContainer.appendChild(new SearchResult(this.environment.earth, this.environment.controls, name, place.latitude, place.longitude).htmlElement);
          }
        });
      });
    }, 500);
  }

  public stopQuerying(): void {
    if (this.timeout != undefined) {
      clearTimeout(this.timeout);
    }
  }

  public clearSearchResults(): void {
    while (this.searchResultsContainer.firstChild) {
      this.searchResultsContainer.firstChild.remove();
    }
  }

  public show(): void {
    this.container.classList.remove("hidden");
  }

  public hide(): void {
    this.container.classList.add("hidden");
  }
}
