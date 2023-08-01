import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-five-elements',
  templateUrl: './five-elements.component.html',
  styleUrls: ['./five-elements.component.scss']
})
export class FiveElementsComponent {

  markProps: string[] = [];
  snow: SafeHtml;

  constructor(public sanitizer: DomSanitizer) {
    GLOBALS.currElement = '4';
    this.load();
    setTimeout(() => this.initSeason(GLOBALS.currElement), 100);
  }

  get globals(): GlobalsService {
    return GLOBALS;
  }

  initSeason(elem: string): void {
    const temp = [];
    const objList: any = {
      Herbst: {class: 'flake', content: '#', img: 'fall', count: 75, anim: 'fall', min: 10, max: 210},
      Winter: {class: 'flake', content: '*', img: 'winter', count: 75, anim: 'fall', min: 10, max: 210},
      Fruehling: {class: 'flake', content: '+', img: 'spring', count: 75, anim: 'raise', min: 10, max: 210},
      Sommer: {class: 'flake', content: '(..)', img: 'summer', count: 1, anim: 'up', min: 500, max: 500},
    };
    const obj = objList[GLOBALS.propsForElement(elem)?.find(p => p.name === 'Jahreszeit')?.property];
    const keys = Object.keys(objList);
    let src = obj;
    const count = obj?.count ?? 150;
    const srcObjs = {...objList};
    for (let i = 0; i < count; i++) {
      src = obj;
      while (src == null) {
        src = srcObjs[keys[Math.floor(Math.random() * keys.length)]];
        if (src.count == 0) {
          src = null;
        } else {
          src.count--;
        }
      }
      const x = Math.floor(Math.random() * 100);
      const y = -20 - Math.floor(Math.random() * 80);
      const speed = 5 + Math.floor(1 + Math.random() * 50) / 10;
      const size = src.min + Math.floor(Math.random() * (src.max - src.min));
      const style = `top:${y}%;left:${x}%;font-size:${size}%;animation:${src.anim} ${speed}s 1s linear normal forwards`;
      temp.push(`<div style="${style}" class="${src.class}"><img style="width:${size / 5}px" src="assets/images/seasons/${src.img}.png" alt="season image"></div>`);
    }
    this.snow = this.sanitizer.bypassSecurityTrustHtml(Utils.join(temp, ''));
  }

  load(): void {
    try {
      const data = JSON.parse(localStorage.getItem('elemProps'));
      this.markProps = data.m;
    } catch (ex) {
    }
  }

  clickElement(evt: MouseEvent) {
    if (GLOBALS._timeoutHandle == null) {
      GLOBALS.activateNextElement(evt, this.initSeason.bind(this));
      this.initSeason(GLOBALS.nextElement);
    } else {
      GLOBALS.clickStop(evt);
    }
  }
}
