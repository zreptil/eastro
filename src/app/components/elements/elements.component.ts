import {Component, Input} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {EventData} from '@/_model/event-data';
import {SafeHtml} from '@angular/platform-browser';
import {Utils} from '@/classes/utils';

@Component({
  selector: 'app-elements',
  templateUrl: './elements.component.html',
  styleUrls: ['./elements.component.scss']
})
export class ElementsComponent {

  currAnimal = '';
  currElement = '3';
  markProps: string[] = [];
  currDate = Date.now();
  elemView: number = 2;
  _timeoutHandle: number;
  _nextChange: number;
  progress: number;
  currElemStyle: string;
  nextElemStyle: string;
  viewElemStyle: string;

  constructor() {
    this.load();
  }

  get nextElement(): string {
    return this.getElement(this.currElement, 'creates');
  }

  _duration = 5000;

  get duration(): string {
    if (this._duration % 60000 === 0) {
      return Utils.plural(this._duration / 60000, {
        1: `1 Minute`,
        other: `${this._duration / 60000} Minuten`
      });
    }
    return `${this._duration / 1000} Sekunden`;
  }

  private _event: EventData;

  @Input()
  set event(value: EventData) {
    this._event = value;
    // value.updateFunc = this._event.calc;
    // this._event.calc();
    // this.calcCalendar();
  }

  get globals(): GlobalsService {
    return GLOBALS;
  }

  load(): void {
    try {
      const data = JSON.parse(localStorage.getItem('elements'));
      this.markProps = data.m;
    } catch (ex) {
    }
  }

  save(): void {
    const data = {
      m: this.markProps
    };
    localStorage.setItem('elements', JSON.stringify(data));
  }

  getElement(element: string, idx: string): string {
    const elem = GLOBALS.zodiacData?.elements?.[element];
    return elem?.[idx] ?? element;
  }

  activate(idx: string) {
    const nextElement = this.getElement(this.currElement, idx);
    if (this.elemView === 2) {
      const duration = 3;
      this.currElemStyle = 'animation-name:fadeOut';
      this.nextElemStyle = 'animation-name:fadeIn';
      this.viewElemStyle = `--ad:${duration / 2}s;animation:furz ${duration}s ease-in-out normal;--bf:var(--elem-${this.currElement}-back);--bt:var(--elem-${nextElement}-back);--ff:var(--elem-${this.currElement}-fore);--ft:var(--elem-${nextElement}-fore)`;
      setTimeout(() => {
        this.currElement = nextElement;
        this.viewElemStyle = '';
        this.currElemStyle = '';
        this.nextElemStyle = '';
      }, duration * 990);
    } else {
      this.currElement = nextElement;
    }
  }

  getElemRel(elem: number, x: number, y: number, deg: number,
             params: { image?: boolean, creating?: boolean, destroying?: boolean }): string {
    params ??= {};
    params.image ??= true;
    params.creating ??= false;
    params.destroying ??= false;
    const ret = [
      `<div style="position:absolute;left:${x}px;`,
      `top:${y}px;transform:rotate(${deg}deg)">`
    ];
    const prop = GLOBALS.zodiacData['props'].find((p: any) => p.type === 'element' && p.name === 'Farbe' && +p.typeId === +elem);
    const fillColor = GLOBALS.colors[prop?.['property']]?.['fill'] ?? 'transparent';
    // "type":"elements","typeId":5,"name":"Farbe","property":"blau"}
    if (params.image) {
      ret.push('<img style="position:absolute;left:-20px;top:-20px"');
      ret.push(` src="assets/images/elements/clear/${elem}.png">`);
    }
    if (params.creating) {
      ret.push(`<svg style="position:absolute;width:40px;left:13px;top:-30px;--hand-fill:${fillColor}"`);
      ret.push(` viewBox="0 0 511 511">`);
      ret.push('<use href="#hand"/>');
      ret.push('</svg>');
    }
    if (params.destroying) {
      ret.push(`<svg style="position:absolute;width:40px;left:13px;top:-21px;transform:rotate(130deg);--fist-fill:${fillColor}"`);
      ret.push(' viewBox="0 0 511 511">');
      ret.push('<use href="#fist"/>');
      ret.push('</svg>');
    }
    ret.push('</div>');
    return Utils.join(ret, '');
  }

  calcElemRel(): SafeHtml {
    if (GLOBALS.zodiacData?.elements == null) {
      return GLOBALS.sanitizer.bypassSecurityTrustHtml('');
    }
    const radius = 50;
    const ret = [
      `<div style="position:relative;`,
      `width:${radius * 3}px;height:${radius * 5}px;">`
    ];
    let idx = +this.currElement;
    for (let i = 0; i < 5; i++) {
      const deg = Math.floor(360 / 5) * i;
      const x = (radius * 1.5) + Math.sin(deg / 180 * Math.PI) * radius;
      const y = (radius * 1.5) + Math.cos(deg / 180 * Math.PI) * radius;
      ret.push(this.getElemRel(idx, +x, +y, -deg, {creating: true}));
      idx = GLOBALS.zodiacData['elements'][idx]['creates'];
    }
    idx = +this.currElement;
    for (let i = 0; i < 5; i++) {
      const deg = Math.floor(360 / 5) * i;
      const x = (radius * 1.5) + Math.sin(deg / 180 * Math.PI) * radius;
      const y = (radius * 3.5) - Math.cos(deg / 180 * Math.PI) * radius;
      ret.push(this.getElemRel(idx, +x, +y, deg, {image: i > 0, destroying: true}));
      idx = GLOBALS.zodiacData['elements'][idx]['destroys'];
    }
    ret.push('</div>');

    return GLOBALS.sanitizer.bypassSecurityTrustHtml(Utils.join(ret, ''));
  }

  imgForElement(idx: string): string {
    let key = this.currElement;
    if (idx !== 'curr') {
      key = GLOBALS.zodiacData?.elements?.[this.currElement]?.[idx];
    }
    return `assets/images/elements/clear/${key}.png`;
  }

  activateProp(prop: any) {
    const idx = this.markProps.indexOf(prop.name);
    if (idx >= 0) {
      this.markProps.splice(idx, 1);
    } else {
      this.markProps.push(prop.name);
    }
    this.save();
  }

  classForProp(prop: any): string[] {
    const ret: string[] = [];
    if (this.markProps.indexOf(prop.name) >= 0) {
      ret.push('current');
    }
    return ret;
  }

  toggleElemView() {
    let view = this.elemView + 1;
    if (view > 2) {
      view = 0;
    }
    this.elemView = view;
  }

  markedProp(element: string, value: string) {
    const ret = GLOBALS.propsForElement(element)?.find(p => p.name === value);
    if (ret != null) {
      const parts = ret.property.split(',');
      if (parts.length > 1) {
        return {name: ret.name, property: parts[0]};
      }
    }
    return ret ?? {};
  }

  activateNextElement(evt: MouseEvent) {
    evt?.stopPropagation();
    this.activate('creates');
  }

  changeDuration(evt: MouseEvent) {
    evt?.stopPropagation();
    const list = [5, 60, 90, 120, 300];
    const idx = list.findIndex(l => l === this._duration / 1000);
    if (idx < 0) {
      this._duration = list[0] * 1000;
    } else {
      this._duration = list[idx >= list.length - 1 ? 0 : idx + 1] * 1000;
    }
  }

  clickPlay(evt: MouseEvent) {
    evt?.stopPropagation();
    if (evt != null) {
      this._nextChange = new Date().getTime() + this._duration;
      this.progress = 0;
    }
    const timeout = 900;
    this._timeoutHandle = setTimeout(() => {
      const now = new Date().getTime();
      this.progress = (1 - (this._nextChange - now - timeout) / this._duration) * 100;
      if (now >= this._nextChange) {
        this.activateNextElement(null);
        this._nextChange = new Date().getTime() + this._duration;
        this.progress = 0;
      }
      this.clickPlay(null);
    }, 900);

  }

  clickStop(evt: MouseEvent) {
    evt?.stopPropagation();
    clearTimeout(this._timeoutHandle);
    this._timeoutHandle = null;
  }
}
