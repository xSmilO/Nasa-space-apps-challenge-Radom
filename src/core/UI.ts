import MeteorCreator from "../ui/MeteeorCreator";
import TimeSlider from "../ui/TimeSlider";
import { getMonthShortName } from "../utility/dateConverter";
import Environment from "./environment";

export class UI {
    private date: HTMLDivElement | null = null;
    private clock: HTMLDivElement | null = null;
    private liveBtn: HTMLDivElement | null = null;
    private meteorCreator: MeteorCreator;
    private environment: Environment;
    private timeSlider: TimeSlider;

    private meteorCreatorBtn: HTMLButtonElement | null;
    constructor(environment: Environment) {
        this.environment = environment;
        this.meteorCreator = new MeteorCreator();
        this.meteorCreatorBtn = document.querySelector<HTMLButtonElement>(".meteorCreatorBtn");
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
    }

    public update(): void {
        if (this.meteorCreator.active) {
            this.meteorCreator.render();
        }
    }

    public setUpEventListeners(): void {
        this.meteorCreatorBtn?.addEventListener("click", () => {
            this.meteorCreator.active ? this.meteorCreator.disable() : this.meteorCreator.enable();
        })
        this.timeSlider.setEventListeners();
        if (this.liveBtn)
            this.liveBtn.addEventListener("click", () => {
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

    private live(): void {
        if (this.liveBtn) {
            this.liveBtn.classList.remove("no-live");
        }
    }

}
