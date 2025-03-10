import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {AnimationData} from '@/components/animator/animator.component';
import {Utils} from '@/classes/utils';

@Component({
  selector: 'app-five-elements',
  templateUrl: './five-elements.component.html',
  styleUrls: ['./five-elements.component.scss'],
  standalone: false
})
export class FiveElementsComponent {

  footDist = 40;
  animFootLeft: any = null;
  animFootRight: any = null;
  animPrologText: any = null;
  prologText: string;
  lastPrologType: string;

  constructor() {
    GLOBALS.currElement = null;
    this.load();
    this.initSeason(GLOBALS.currElement);
  }

  get animFoot(): any {
    return {'--footDist': `${this.footDist ?? 40}px`};
  }

  __animDefs: AnimationData[];

  get _animDefs(): AnimationData[] {
    const wiggle = `wiggle ${GLOBALS.cfgFiveElements.animWiggleDuration}s ease-in-out infinite alternate`;
    return [
      {
        id: 'Prolog',
        animImg: 'fall',
        // def: {
        //   class: 'flake',
        //   count: 75,
        //   animName: 'fall',
        //   size: {min: 10, max: 210},
        //   x: {min: -20, max: 100},
        //   y: {min: -20, max: -80},
        // },
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
            animation: wiggle
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
            animation: wiggle
          }
        }]
      },
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
            animation: wiggle
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
            animation: wiggle
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
            animation: wiggle
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
            animation: wiggle
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
            animation: wiggle
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
            animation: wiggle
          }
        }]
      },
      {
        id: 'Sommer',
        animImg: 'summer',
        static: [{
          style: {
            display: 'flex', left: '50%', top: '50%',
            height: '180px',
            transform: 'translate(-50%,-32%)'
          },
          img: 'summer',
          styleImage: {
            animation: wiggle
          }
        }],
        anim: {
          animation: 'sunrise 5s ease-in-out normal forwards', //, sunwiggle 4s ease-in-out -2s infinite alternate',
          height: '280px'
        },
      },
    ];
  }

  get animDefs(): AnimationData[] {
    return this.__animDefs;
  }

  get styleForRoot(): any {
    if (GLOBALS.currElement == null) {
      return {};
    }
    const ret: any = GLOBALS.styleForElement(GLOBALS.currElement, GLOBALS.currElement);
    if (GLOBALS.animShowQuiz) {
      if (GLOBALS._quizIdx === GLOBALS.markProps.findIndex(p => p === 'Farbe') + 1) {
        ret.animation = 'fadeColor 2s ease-in-out forwards';
      }
    }
    return ret;
  }

  get globals(): GlobalsService {
    return GLOBALS;
  }

  fillAnimDefs(): void {
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
    this.__animDefs = ret;
  }

  activateElement(evt: MouseEvent, id: string) {
    evt?.stopPropagation();
    GLOBALS.currElement = id;
    this.initSeason(id);
  }

  initSeason(elem: string): void {
    if (elem === 'prolog') {
      this.initPlay(Utils.nextListItem(this.lastPrologType, ['left', 'right', 'end']));
      return;
    }
    this.fillAnimDefs();
    GLOBALS.seasonAnimationTimeout = 0;//timeout;
    if (elem == null) {
      GLOBALS.animId = 'none';
    } else {
      if (GLOBALS.animShowQuiz) {
        GLOBALS._quizIdx = 0;
        GLOBALS.seasonAnimationTimeout = 0;
      } else {
        GLOBALS.initSeasonAnimation(elem);
      }
    }
  }

  load(): void {
    try {
      const data = JSON.parse(localStorage.getItem('elemProps'));
      GLOBALS.markProps = data.m;
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
    evt?.stopPropagation();
    this.initPlay();
  }

  initPlay(type = 'left'): void {
    this.lastPrologType = type;
    const time = GLOBALS.cfgFiveElements.prologDuration;
    GLOBALS.elem5Page = 'prolog';
    if (type === 'end') {
      clearTimeout(GLOBALS._timeoutHandle);
      GLOBALS._timeoutHandle = null;
      this.animPrologText = '';
      this.prologText = '<div>Das waren die 5 Elemente</div><div>Vielen Dank für die Teilnahme</div>';
      this.animFootLeft = null;
      this.animFootRight = null;
      setTimeout(() => {
        clearTimeout(GLOBALS._timeoutHandle);
        GLOBALS._timeoutHandle = null;
        GLOBALS.viewElemStyle = '';
        GLOBALS.currElemAnim = '';
        GLOBALS.nextElemAnim = '';
        GLOBALS.currElement = null;
        GLOBALS.elem5Page = null;
      }, Math.max(time, 5000));
      return;
    }
    const stepLength = 130;
    switch (type) {
      case 'right':
        this.prologText = 'Bogenschritt rechts';
        this.animFootLeft = {animation: `footBack ${time}ms ease-in-out 1s forwards`, '--x': `-${this.footDist}px`, '--d': '-40deg'};
        this.animFootRight = {
          animation: `footFront ${time}ms ease-in-out 1s forwards`,
          '--x': `${this.footDist}px`,
          '--y': `-${stepLength}px`
        };
        this.animPrologText = {animation: `footText ${time}ms ease-in-out 1s forwards`};
        break;
      case 'left':
        this.prologText = 'Bogenschritt links';
        this.animFootRight = {animation: `footBack ${time}ms ease-in-out 1s forwards`, '--x': `${this.footDist}px`, '--d': '40deg'};
        this.animFootLeft = {animation: `footFront ${time}ms ease-in-out 1s forwards`, '--x': `-${this.footDist}px`, '--y': `-${stepLength}px`};
        this.animPrologText = {animation: `footText ${time}ms ease-in-out 1s forwards`};
        break;
    }
    setTimeout(() => {
      GLOBALS.elem5Page = null;
      GLOBALS.currElement = '4';
      this.initSeason(GLOBALS.currElement);
      GLOBALS.clickPlay(true, this.initSeason.bind(this));
    }, time);
  }

  clickReplay(evt: MouseEvent) {
    evt?.stopPropagation();
    GLOBALS.animId = 'none';
    GLOBALS._quizIdx = 0;
    // this.initSeason(GLOBALS.currElement, 10);
  }

  classForElement(id: string): string[] {
    const ret: string[] = [];
    if (GLOBALS.animShowQuiz) {
      if (id === GLOBALS.currElement && GLOBALS._quizIdx === GLOBALS.markProps.findIndex(p => p === 'Farbe') + 1) {
        ret.push(`anim-quiz-elem`);
      }
    }
    return ret;
  }

  classForImage(id: string): string[] {
    const ret: string[] = [];
    if (GLOBALS.animShowQuiz) {
      if (id === GLOBALS.currElement && GLOBALS._quizIdx === GLOBALS.markProps.findIndex(p => p === 'Farbe') + 1) {
        ret.push(`anim-quiz-img`);
      }
    }
    return ret;
  }

  classForProp(idx: number): string[] {
    const ret: string[] = [];
    if (GLOBALS.animShowQuiz) {
      if (GLOBALS._quizIdx === idx) {
        ret.push(`anim-quiz-prop`);
      } else if (idx === GLOBALS._quizIdx - 1) {
        ret.push(`anim-quiz-prop-end`);
      }
    }
    return ret;
  }

  styleForQuiz(idx: number): any {
    const ret: any = {};
    if (GLOBALS.animShowQuiz && (GLOBALS._quizIdx === idx || GLOBALS._quizIdx === idx + 1)) {
      ret.visibility = `visible`;
    }
    return ret;
  }
}
