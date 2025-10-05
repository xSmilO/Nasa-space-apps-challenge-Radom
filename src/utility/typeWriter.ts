export class TypeWriter {
  private htmlElement: HTMLElement;
  private duration: number;
  private contents: string;
  private i: number = 0;

  constructor(htmlElement: HTMLElement, duration: number, contents: string) {
    this.htmlElement = htmlElement;
    this.duration = duration;
    this.contents = contents;

    this.write();
  }

  private write() {
    if(this.i < this.contents.length) {
      this.htmlElement.textContent += this.contents[this.i];
      this.i += 1;

      setTimeout(this.write.bind(this), this.duration / this.contents.length);
    }
  }
}