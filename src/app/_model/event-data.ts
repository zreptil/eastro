import {GLOBALS} from '@/_services/globals.service';
import {BaseData} from '@/_model/base-data';
import {Utils} from '@/classes/utils';
import {ZodiacPartData} from './zodiac-part-data';

export class EventData extends BaseData {
  name: string;
  time: Date;
  genderIdx: number;
  photoUrl: string;
  updateFunc: () => {};
  timeYear: number;
  year = new ZodiacPartData();
  month = new ZodiacPartData();
  day = new ZodiacPartData();
  hour = new ZodiacPartData();
  elemCount: any;
  animCount: any;

  _marked = false;

  get marked(): boolean {
    return this._marked;
  }

  get gender() {
    return GLOBALS.genders[this.genderIdx];
  }

  get copy(): EventData {
    const ret = EventData.fromJson(JSON.parse(this.asString));
    ret.updateFunc = this.updateFunc;
    return ret;
  }

  get timeDisplay(): string {
    return Utils.fmtTime(this.time.getTime());
  }

  get _asJsonString(): string {
    return JSON.stringify(this.asJson);
  }

  get asJson(): any {
    return {
      n: this.name,
      g: this.genderIdx,
      t: this.time.getTime(),
      img: this.photoUrl,
      c: this.marked
    }
  }

  get isNotEmpty(): boolean {
    return this.year.animal > 0;
  }

  get yama(): string {
    return `${this.year.animal}-${this.month.animal}`;
  }

  get yada(): string {
    return `${this.year.animal}-${this.day.animal}`;
  }

  get yaha(): string {
    return `${this.year.animal}-${this.hour.animal}`;
  }

  get genderStyle(): string {
    if (this.gender['type'] === 'Yang') {
      return '--yang:white;--yangdot:black;--yin:transparent;--yindot:transparent';
    }
    return '--yang:transparent;--yangdot:transparent;--yin:black;--yindot:white';
  }

  get listGoodRelations(): any[] {
    return this._relations(this.year.animal, 4);
  }

  get listBadRelations(): any[] {
    return this._relations(this.year.animal, 3);
  }

  static fromJson(json: any): EventData {
    if (json == null || json.isEmpty) {
      return null;
    }
    const ret = new EventData();
    ret.fillFromJson(json);
    return ret;
  }

  _fillFromJson(json: any, def?: any): void {
    this.name = json['n'];
    this.time = BaseData.toDate(json['t'] ?? Date.now());
    this.photoUrl = json['img'];
    this.genderIdx = json['g'] ?? 0;
    this._marked = json['c'] ?? false;
  }

  elem4Animal(data: any, animal: number): number {
    const ret = data['animals'][`${animal}`];
    return (ret['element'] - 1) * 2 + ret['type'];
  }

  getAnimalPath(key: string): string {
    return this.animCount == null ? 'clear' : this.animCount[key] > 0 ? 'square' : 'clear';
  }

  getAnimalClass(key: string): string {
    return this.animCount == null ? 'miss' : this.animCount[key] > 0 ? '' : 'miss';
  }

  getElementCount(key: string): string {
    return this.elemCount == null ? 'clear' : this.elemCount[key ?? 0] > 0 ? 'square' : 'clear';
  }

  getElementClass(key: string): string {
    return this.elemCount == null ? 'miss' : this.elemCount[key ?? 0] > 0 ? '' : 'miss';
  }

  countAnimals(list: string[]): number {
    var ret = 0;
    for (const key of list) {
      ret += this.animCount[key];
    }
    return ret;
  }

  _relations(animal: number, diff: number): any[] {
    const ret: any[] = [];
    if (animal == null) {
      return ret;
    }
    for (const key of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      if (animal !== key && ((animal - key) % diff) === 0) {
        ret.push(key);
      }
    }
    return ret;
  }

  calcDayAnimal(date: Date) {
    var days = Utils.differenceInDays(date, new Date(1879, 0, 1));
    var animal = days % 12 + 9;
    var element = days % 10 + 1;
    while (animal > 11) {
      animal -= 12;
    }
    while (element > 9) {
      element -= 10;
    }
    return {animal: animal + 1, element: element};
  }

  /*
  dateActivity(date) {
    var id = -1;
    var day = this.calcDayAnimal(date);
    var monthIdx = 13 - this.getMonthIdx(date);
    var dayIdx = day.animal - 1;
    var yearIdx = this.year.animal - 1;
    id = monthIdx + (dayIdx - yearIdx);

    // 13 - monthIdx
    // 1 A 0
    // 2 L 11
    // 3 K 10
    // 4 J 9
    // 5 I 8
    // 6 H 7
    // 7 G 6
    // 8 F 5
    // 9 E 4
    // 10 D 3
    // 11 C 2
    // 12 B 1

    while (id < 0) {
      id += 12;
    }
    while (id > 11) {
      id -= 12;
    }
    id++;
    var keys = 'ABCDEFGHIJKL';
    return {
      'pro': this.meaningHtml('dayPro', id.toString()),
      'contra': this.meaningHtml('dayContra', id.toString()),
      'key': keys.substring(id - 1, id)
    };
  }

  getMonthIdx(date: Date): number {
    var ret = 0;
    if (GLOBALS.zodiacData == null) return ret;
    for (const month of GLOBALS.zodiacData['months']) {
      ret = month['idx'];
      if (month['begmonth'] < date.month && month['endmonth'] > date.month) {
        break;
      } else if (month['begmonth'] == date.month && month['begday'] <= date.day) {
        break;
      } else if (month['endmonth'] == date.month && month['endday'] >= date.day) {
        break;
      }
    }
    return ret;
  }

  String calc() {
    dynamic data = ZodiacComponent.data;
    if (data == null) return null;

    var bd = time;
    timeYear = data['years'][time.year.toString()];
    if (timeYear != null) {
      if (time.isBefore(timeYear)) {
        timeYear = data['years'][(time.year - 1).toString()];
      }
    }

    if (timeYear == null) {
      return Intl.message('Das Geburtsjahr ist unbekannt');
    }

    year.cycle = (bd.year - 4) % 60;

    year.cycle = (timeYear.year - 4) % 60;
    year.animal = (year.cycle % 12) + 1;
    year.elements = ((timeYear.year + 6) % 10);

    var monthIdx = getMonthIdx(bd);
    month.animal = monthIdx;
    month.elements = ((bd.year % 10) * 2 + 2 + monthIdx - 1) % 10;

    var temp = calcDayAnimal(bd);
    day.animal = temp['animal'];
    day.elements = temp['elements'];

    if (bd.hour != 0 || bd.minute != 0) {
      hour.animal = ((bd.hour + 1) ~/ 2) % 12 + 1;
      hour.elements = (((bd.hour + 1) ~/ 2) + day.elements * 2) % 10;
    } else {
      hour.animal = 0;
      hour.elements = -1;
    }

    elemCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // animCount muss 13 Eintraege haben, weil die Tiere 1-basiert sind
    animCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // sum elements of elements
    elemCount[year.elements]++;
    elemCount[month.elements]++;
    elemCount[day.elements]++;
    if (hour.elements >= 0) elemCount[hour.elements]++;
    // sum animals of elements
    animCount[year.animal]++;
    animCount[month.animal]++;
    animCount[day.animal]++;
    if (hour.animal >= 1) animCount[hour.animal]++;
    // sum elements of animals
    elemCount[elem4Animal(data, year.animal)]++;
    elemCount[elem4Animal(data, month.animal)]++;
    elemCount[elem4Animal(data, day.animal)]++;
    if (hour.animal >= 1) elemCount[elem4Animal(data, hour.animal)]++;
    return null;
  }

  String meaning(String type, var lookup) {
    var info;
    if (ZodiacComponent.data == null) {
      return '';
    }

    for (var meaning in ZodiacComponent.data['meanings']) {
      if (meaning['type'] == type && meaning['lookup'] == lookup.toString()) {
        info = meaning['info'];
        break;
      }
    }

    if (info == null) {
      return GLOBALS.isDebug ? 'Nicht gefunden $type - $lookup' : '';
    }

    var ret = '<span>${info}</span>';
    ret = ret.replaceAll('@+', '<span class="mark">');
    ret = ret.replaceAll('@-', '</span>');
    ret = ret.replaceAll('@|', '<br />');
    ret = ret.replaceAll('@~', '&quot;');
    ret = ret.replaceAll(
      '@K', '<span class="info" title="Das Kurierpferd steht für weite Reisen">Kurierpferd</span><br>');
    ret = ret.replaceAll(
      '@B',
      '<span class="info" title="Die Blume der Liebe steht für '
    'Glück oder Selbstzerstörung">Blume der Liebe</span><br>');

    var pos = ret.indexOf('@');
    while (pos >= 0) {
      var id = ret.codeUnitAt(pos + 1);
      if (id >= 48 && id <= 57) {
        ret =
          '${ret.substring(0, pos)}</span><img src="packages/eastro/assets/img/elements/square/${id - 48}.png"><span>${ret.substring(pos + 2)}';
      } else if (id >= 97 && id <= 108) {
        ret =
          '${ret.substring(0, pos)}</span><img src="packages/eastro/assets/img/animals/square/${id - 96}.png"><span>${ret.substring(pos + 2)}';
      }
      pos = ret.indexOf('@');
    }
    return ret;
  }

  SafeHtml meaningHtml(String type, var lookup) {
    return GLOBALS.sanitizer.bypassSecurityTrustHtml(meaning(type, lookup));
  }

  SafeHtml combiMeaningHtml(String existtype, String misstype, var list) {
    if (ZodiacComponent.data == null || animCount == null) {
      return GLOBALS.sanitizer.bypassSecurityTrustHtml('');
    }
    var ret = '';
    var diff = '';
    for (var key in list) {
      var temp = '';
      if (animCount[key] == 0) {
        temp = meaning(misstype, key);
      } else if (existtype != '') {
        temp = meaning(existtype, key);
      }

      if (temp.isNotEmpty) {
        ret += diff + temp;
        diff = '<br />';
      }
    }

    return GLOBALS.sanitizer.bypassSecurityTrustHtml(ret);
  }
  */
}
