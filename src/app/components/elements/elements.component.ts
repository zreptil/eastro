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
  markProps: string[] = [];
  currDate = Date.now();

  constructor() {
    this.load();
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
    if (GLOBALS.currElement == null) {
      GLOBALS.currElement = '4';
    }
    return GLOBALS;
  }

  load(): void {
    try {
      const data = JSON.parse(localStorage.getItem('elemProps'));
      this.markProps = data.m;
    } catch (ex) {
    }
  }

  save(): void {
    const data = {
      m: this.markProps
    };
    localStorage.setItem('elemProps', JSON.stringify(data));
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
    let idx = +GLOBALS.currElement;
    for (let i = 0; i < 5; i++) {
      const deg = Math.floor(360 / 5) * i;
      const x = (radius * 1.5) + Math.sin(deg / 180 * Math.PI) * radius;
      const y = (radius * 1.5) + Math.cos(deg / 180 * Math.PI) * radius;
      ret.push(this.getElemRel(idx, +x, +y, -deg, {creating: true}));
      idx = GLOBALS.zodiacData['elements'][idx]['creates'];
    }
    idx = +GLOBALS.currElement;
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
    return GLOBALS.imgForElement(GLOBALS.currElement, idx);
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
}
