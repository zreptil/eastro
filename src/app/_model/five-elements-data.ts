import {BaseData} from '@/_model/base-data';

export class FiveElementsData extends BaseData {
  animShowStatic = true;
  animShowAnimation = true;
  animDuration = 0;

  get _asJsonString(): string {
    return JSON.stringify(this.asJson);
  }

  get asJson(): any {
    return {
      c1: this.animShowStatic,
      c2: this.animDuration,
      c3: this.animShowAnimation
    }
  }

  static fromJson(json: any): FiveElementsData {
    if (json == null || json.isEmpty) {
      return null;
    }
    const ret = new FiveElementsData();
    ret.fillFromJson(json);
    return ret;
  }

  _fillFromJson(json: any, def?: any): void {
    this.animShowStatic = json['c1'] ?? true;
    this.animDuration = json['c2'] ?? 10000;
    this.animShowAnimation = json['c3'] ?? true;
  }
}
