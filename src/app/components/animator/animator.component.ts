import {Component, Input} from '@angular/core';
import {Utils} from '@/classes/utils';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {GLOBALS} from '@/_services/globals.service';

export class AnimationLimits {
  min: number;
  max: number;
}

export class StaticData {
  img: string;
  style: any;
  styleImage: any;
}

export class AnimationData {
  id: string;
  animImg: string;
  def?: {
    class: string;
    count: number;
    animName: string;
    size: AnimationLimits;
    x: AnimationLimits;
    y: AnimationLimits;
  }
  anim?: {
    animation: string,
    height: string
  };
  static?: StaticData[];
}

@Component({
  selector: 'app-animator',
  templateUrl: './animator.component.html',
  styleUrls: ['./animator.component.scss']
})
export class AnimatorComponent {
  public animationString: SafeHtml;
  private _nextHandle: number;

  constructor(public sanitizer: DomSanitizer) {
    this.initAnimation();
  }

  private _animDefs: AnimationData[];

  @Input()
  set animDefs(value: AnimationData[]) {
    this._animDefs = value;
  }

  private _animId: string;

  @Input()
  set animId(value: string) {
    this._animId = value;
    this._animStatic = null;
    this.initAnimation();
  }

  private _animStatic: StaticData[];

  get animStatic(): StaticData[] {
    if (this._animStatic != null) {
      return this._animStatic;
    }
    return this.anim?.static;
  }

  set animStatic(value: StaticData[]) {
    this._animStatic = value;
  }

  get anim(): AnimationData {
    return this._animDefs.find(a => a.id === this._animId);
  }

  staticImage(data: StaticData): string {
    return data?.img != null ? `assets/images/seasons/${data?.img}-static.png` : '';
  }

  imageStyle(a: StaticData): any {
    return {...a.styleImage, animation: 'fadeIn 5s ease-in-out 5s normal forwards'};
  }

  staticClass(_a: StaticData): string[] {
    const ret: string[] = [];
    if (this._animStatic != null) {
      ret.push('staticMulti');
    } else {
      ret.push('static');
    }
    return ret;
  }

  private addAnimations(src: AnimationData, list: any[]): void {
    if (src.def != null) {
      for (let i = 0; i < src.def.count; i++) {
        const x = src.def.x.min + Math.floor(Math.random() * (src.def.x.max - src.def.x.min));
        const y = src.def.y.min + Math.floor(Math.random() * (src.def.y.max - src.def.y.min));
        const speed = 5 + Math.floor(1 + Math.random() * 50) / 10;
        const size = src.def.size.min + Math.floor(Math.random() * (src.def.size.max - src.def.size.min));
        const style = `top:${y}%;left:${x}%;animation:${src.def.animName} ${speed}s 1s linear normal forwards`;
        list.push(`<div style="${style}" class="${src.def.class}"><img style="width:${size / 5}px" src="assets/images/seasons/${src.animImg}.png" alt="season image"></div>`);
      }
    }
    if (src?.anim != null) {
      list.push(`<div style="animation:${src.anim.animation}" class="sunrise"><img style="height:${src.anim.height}" src="assets/images/seasons/${src.animImg}.png" alt="season image"></div>`);
    }
  }

  private initAnimation(): void {
    if (this._animDefs == null || this._animDefs.length === 0 || this._animId === 'none') {
      this.animationString = '';
      return;
    }
    const temp: any[] = [];
    const src = this.anim;
    clearTimeout(this._nextHandle);
    if (src != null) {
      this.addAnimations(src, temp);
    } else {
      for (const anim of this._animDefs) {
        this.addAnimations(anim, temp);
      }
      this.nextStatic(0);
    }
    this.animationString = this.sanitizer.bypassSecurityTrustHtml(Utils.join(temp, ''));
  }

  private nextStatic(idx: number): void {
    if (idx >= this._animDefs.length) {
      idx = 0;
    }
    this._animStatic = this._animDefs[idx]?.static;
    idx++;
    this._nextHandle = setTimeout(() => {
      this.nextStatic(idx);
    }, GLOBALS.cfgFiveElements.animDuration / this._animDefs.length);
  }
}
