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
  wiggle = `wiggle ${GLOBALS.cfgFiveElements.animWiggleDuration}s ease-in-out infinite alternate`;

  constructor(public sanitizer: DomSanitizer) {
    GLOBALS.currElement = null;
    this.load();
    this.initSeason(GLOBALS.currElement);
  }

  _animDefs: AnimationData[] = [
    {
      id: 'Herbst',
      animImg: 'fall',
      def: {
        class: 'flake',
        count: 75,
        animName: 'fall',
        size: {min: 10, max: 210},
        x: {min: -20, max: 100},
        y: {min: -20, max: -80},
      },
      static: [{
        style: {
          display: 'flex',
          left: '25%',
          bottom: '12%',
          height: '100px',
        },
        img: 'fall',
        styleImage: {
          transformOrigin: '75px 5px',
          animation: this.wiggle
        }
      }, {
        style: {
          display: 'flex',
          left: '75%',
          bottom: '12%',
          height: '100px',
          transform: 'scaleX(-1) translateX(100%)'
        },
        img: 'fall',
        styleImage: {
          transformOrigin: '75px 5px',
          animation: this.wiggle
        }
      }]
    },
    {
      id: 'Winter',
      animImg: 'winter',
      def: {
        class: 'flake',
        count: 75,
        animName: 'fall',
        size: {min: 10, max: 210},
        x: {min: -20, max: 100},
        y: {min: -20, max: -80},
      },
      static: [{
        style: {
          display: 'flex', left: '25%', bottom: '10%',
          height: '200px',
        },
        img: 'winter',
        styleImage: {
          transformOrigin: 'center 190px',
          animation: this.wiggle
        }
      }, {
        style: {
          display: 'flex', left: '75%', bottom: '10%',
          height: '200px',
          transform: 'scaleX(-1) translateX(100%)'
        },
        img: 'winter',
        styleImage: {
          transformOrigin: 'center 190px',
          animation: this.wiggle
        }
      }]
    },
    {
      id: 'Frühling',
      animImg: 'spring',
      def: {
        class: 'flake',
        count: 75,
        animName: 'raise',
        size: {min: 10, max: 210},
        x: {min: -20, max: 100},
        y: {min: -20, max: -80},
      },
      static: [{
        style: {
          display: 'flex', left: '25%', bottom: '10%',
          height: '200px',
        },
        img: 'spring',
        styleImage: {
          transformOrigin: 'center 190px',
          animation: this.wiggle
        }
      }, {
        style: {
          display: 'flex', left: '75%', bottom: '10%',
          height: '200px',
          transform: 'scaleX(-1) translateX(100%)'
        },
        img: 'spring',
        styleImage: {
          transformOrigin: 'center 190px',
          animation: this.wiggle
        }
      }]
    },
    {
      id: 'Sommer',
      animImg: 'summer',
      static: [{
        style: {
          display: 'flex', left: '50%', top: '10.5%',
          height: '110px',
          transform: 'translateX(-50%)'
        },
        img: 'summer',
        styleImage: {
          animation: this.wiggle
        }
      }],
      anim: {
        animation: 'sunrise 5s ease-in-out normal forwards', //, sunwiggle 4s ease-in-out -2s infinite alternate',
        height: '130px'
      },
    },
  ];

  get animDefs(): AnimationData[] {
    const ret: AnimationData[] = [];
    if (GLOBALS.cfgFiveElements.animShowAnimation) {
      for (const anim of this._animDefs) {
        const temp: any = {};
        for (const key of Object.keys(anim)) {
          if (GLOBALS.cfgFiveElements.animShowStatic || key !== 'static') {
            temp[key] = (anim as any)[key];
          }
        }
        ret.push(temp);
      }
    }
    return ret;
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
