import MeteorCreator from "../ui/MeteeorCreator";
import { SearchBar } from "../ui/searchBar";
import TimeSlider from "../ui/TimeSlider";
import { getMonthShortName } from "../utility/dateConverter";
import type { CraterResult } from "../utility/types";
import Environment from "./environment";
import { SETTINGS } from "./Settings";

export class UI {
    private date: HTMLDivElement | null = null;
    private clock: HTMLDivElement | null = null;
    private liveBtn: HTMLDivElement | null = null;
    private meteorCreator: MeteorCreator;
    private environment: Environment;
    private timeSlider: TimeSlider;
    private searchBar: SearchBar;

    constructor(environment: Environment) {
        this.environment = environment;
        this.meteorCreator = new MeteorCreator(this);
        this.searchBar = new SearchBar(environment);
        this.clock = document.querySelector<HTMLDivElement>(
            ".time-slider .info .clock"
        );
        this.date = document.querySelector<HTMLDivElement>(
            ".time-slider .info .date"
        );
        this.liveBtn = document.querySelector(
            ".time-slider .info .live-btn"
        );
        this.timeSlider = new TimeSlider();

        this.meteorCreator.disable();

        this.searchBar.input.addEventListener("input", () => {
            this.searchBar.updateSearchResults();
        });

        this.searchBar.container.addEventListener("focusout", (event: FocusEvent) => {
            if (event.relatedTarget && (
                this.searchBar.container.contains(event.relatedTarget as Node) ||
                this.searchBar.searchResultsContainer.contains(event.relatedTarget as Node)
            )) {
                return;
            }

            this.searchBar.stopQuerying();
            this.searchBar.clearSearchResults();
        });

        this.searchBar.input.addEventListener("focusin", () => {
            this.searchBar.updateSearchResults();
        });
    }

    public update(): void {
        if (this.meteorCreator.active) {
            this.meteorCreator.render();
        }
    }

    public setUpEventListeners(): void {
        this.meteorCreator.setEventListeners();

        this.timeSlider.setEventListeners();
        if (this.liveBtn)
            this.liveBtn.addEventListener("click", () => {
                if (SETTINGS.METEOR_MODE) return;
                this.environment.setLiveDate();
                this.live();
                this.timeSlider.reset();
            });
    }

    public updateTimelineInfo(date: Date): void {
        let hours: string | number = date.getHours();
        let minutes: string | number = date.getMinutes();
        let seconds: string | number = date.getSeconds();
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;


        if (this.clock) this.clock.innerText = `${hours}:${minutes}:${seconds}`;

        let day = date.getDate();
        let month = getMonthShortName(date.getMonth());
        let year = date.getFullYear();

        if (this.date) this.date.innerText = `${day} ${month}, ${year}`;
    }
    public noLive(): void {
        if (this.liveBtn) {
            this.liveBtn.classList.add("no-live");
        }
    }

    public live(): void {
        if (this.liveBtn) {
            this.liveBtn.classList.remove("no-live");
        }
    }

    public onResize(): void {
        // this.meteorCreator.onResize();
    }

    public enableMeteorMode(): void {
        this.timeSlider.reset();
        this.environment.enableMeteorMode();
    }

    public disableMeteorMode(): void {
        this.environment.disableMeteorMode();
    }

    public launchMeteor(): CraterResult {
        return this.meteorCreator.calculateMeteorCrater();
    }

    public show(): void {
        this.meteorCreator.showButton();
        this.searchBar.show();
    }

    public hide(): void {
        this.meteorCreator.hideButton();
        this.meteorCreator.disable();
        this.searchBar.hide();
    }
}
