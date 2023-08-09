import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {DomSanitizer} from '@angular/platform-browser';
import {AnimationData} from '@/components/animator/animator.component';

@Component({
  selector: 'app-five-elements',
  templateUrl: './five-elements.component.html',
  styleUrls: ['./five-elements.component.scss']
})
export class FiveElementsComponent {

  markProps: string[] = [];
  animId: string;
  animDefs: AnimationData[] = [
    {
      id: 'Herbst',
      class: 'flake',
      img: 'fall',
      count: 75,
      animName: 'fall',
      size: {min: 10, max: 210},
      x: {min: -20, max: 100},
      y: {min: -20, max: -80},
      static: {
        style: {
          display: 'flex', left: '25%', bottom: '12%',
          height: '100px',
        },
        styleImage: {
          transformOrigin: '75px 5px',
          animation: 'wiggle 4s ease-in-out infinite alternate'
        }
      }
    },
    {
      id: 'Winter',
      class: 'flake',
      img: 'winter',
      count: 75,
      animName: 'fall',
      size: {min: 10, max: 210},
      x: {min: -20, max: 100},
      y: {min: -20, max: -80},
      static: {
        style: {
          display: 'flex', left: '60%', bottom: '10%',
          height: '200px',
        },
        styleImage: {
          transformOrigin: 'center 190px',
          animation: 'wiggle 4s ease-in-out infinite alternate'
        }
      }
    },
    {
      id: 'Frühling',
      class: 'flake',
      img: 'spring',
      count: 75,
      animName: 'raise',
      size: {min: 10, max: 210},
      x: {min: -20, max: 100},
      y: {min: -20, max: -80},
      static: {
        style: {
          display: 'flex', left: '25%', bottom: '10%',
          height: '200px',
        },
        styleImage: {
          transformOrigin: 'center 190px',
          animation: 'wiggle 4s ease-in-out infinite alternate'
        }
      }
    },
    {
      id: 'Sommer',
      class: 'flake',
      img: 'summer',
      count: 1,
      animName: 'sun',
      size: {min: 500, max: 500},
      x: {min: 5, max: 5},
      y: {min: -20, max: -20},
      static: {
        style: {
          display: 'flex', left: '55%', top: '10%',
          height: '180px',
          animation: 'fadeIn 5s ease-in-out 7s normal forwards'
        },
        styleImage: {
          transformOrigin: 'center center',
          animation: 'wiggle 4s ease-in-out infinite alternate'
        }
      }
    },
  ];

  constructor(public sanitizer: DomSanitizer) {
    GLOBALS.currElement = null;
    this.load();
    this.initSeason(GLOBALS.currElement);
  }

  get rootStyle(): string {
    if (GLOBALS.currElement == null) {
      return '';
    }
    return GLOBALS.styleForElement(GLOBALS.currElement, GLOBALS.currElement);
  }

  get globals(): GlobalsService {
    return GLOBALS;
  }

  activateElement(evt: MouseEvent, id: string) {
    evt?.stopPropagation();
    GLOBALS.currElement = id;
    this.initSeason(id);
  }

  initSeason(elem: string, timeout = 750): void {
    if (elem == null) {
      this.animId = 'none';
    } else {
      setTimeout(() => {
        this.animId = GLOBALS.propsForElement(elem)?.find(p => p.name === 'Jahreszeit')?.property;
      }, timeout);
    }
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

  clickPlay(evt: MouseEvent) {
    GLOBALS.currElement = '4';
    this.initSeason(GLOBALS.currElement);
    GLOBALS.clickPlay(evt, this.initSeason.bind(this));
  }

  clickReplay(evt: MouseEvent) {
    evt?.stopPropagation();
    this.animId = null;
    this.initSeason(GLOBALS.currElement, 10);
  }
}
