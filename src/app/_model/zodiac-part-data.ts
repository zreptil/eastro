export class ZodiacPartData {
  cycle = -1;
  animal = 0;
  element = -1;

  get elemNumber() {
    return Math.floor(this.element / 2) + 1;

  }

  get elemType() {
    return this.element % 2;
  }
}
