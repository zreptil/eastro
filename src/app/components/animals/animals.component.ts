import {Component, Inject, Input} from '@angular/core';
import {EventData} from '@/_model/event-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';
import {DateAdapter, MAT_DATE_LOCALE, NativeDateAdapter} from '@angular/material/core';

export class GermanDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if ((typeof value === 'string') && (value.indexOf('.') > -1)) {
      const str = value.split('.');
      if (str.length < 2 || isNaN(+str[0]) || isNaN(+str[1]) || isNaN(+str[2])) {
        return null;
      }
      return new Date(Number(str[2]), Number(str[1]) - 1, Number(str[0]), 12);
    }
    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }
}

@Component({
  selector: 'app-animals',
  templateUrl: './animals.component.html',
  styleUrls: ['./animals.component.scss'],
  providers: [{provide: MAT_DATE_LOCALE, useValue: 'de-DE'}, {provide: DateAdapter, useClass: GermanDateAdapter}]
})
export class AnimalsComponent {

  currAnimal = '1';
  protected readonly Date = Date;

  constructor(
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
  ) {
    this._locale = 'de';
    this._adapter.setLocale(this._locale);
  }

  _currDate = new Date();

  get currDate(): Date {
    return this._currDate;
  }

  set currDate(value: Date) {
    this._currDate = value;
  }

  private _event: EventData;

  @Input()
  set event(value: EventData) {
    this._event = value;
    // value.updateFunc = this._event.calc;
    // this._event.calc();
    // this.calcCalendar();
  }

  get test(): any {
    return `${Utils.fmtDate(this.currDate)}`;
  }

  get globals(): GlobalsService {
    return GLOBALS;
  }

  changeDate(): void {
    const min = new Date(1921, 0, 1).getTime();
    const max = new Date().getTime();
    this.currDate = new Date(Math.floor(min + Math.random() * (max - min)));
  }

  imgForAnimal(id: string | number): string {
    return `assets/images/animals/square/${id}.png`;
  }

  classForAnimal(id: string): string[] {
    const ret: string[] = [];
    if (this.currAnimal === id) {
      ret.push('current');
      ret.push(`e${GLOBALS.getAnimalElement(id)}`);
    }
    return ret;
  }

  activateAnimal(id: string) {
    this.currAnimal = id;
  }

  styleForAnimal(animal: any) {
    return GLOBALS.styleForElement(GLOBALS.elementForAnimal(animal), '');
  }

  getDateFormatString(): string {
    if (this._locale === 'ja-JP') {
      return 'YYYY/MM/DD';
    } else if (this._locale === 'de-DE') {
      return 'DD/MM/YYYY';
    }
    return '';
  }
}
