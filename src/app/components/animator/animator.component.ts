import {Component, Input} from '@angular/core';
import {Utils} from '@/classes/utils';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

export class AnimationLimits {
  min: number;
  max: number;
}

export class AnimationData {
  id: string;
  class: string;
  img: string;
  count: number;
  animName: string;
  size: AnimationLimits;
  x: AnimationLimits;
  y: AnimationLimits;
  static?: any;
}

@Component({
  selector: 'app-animator',
  templateUrl: './animator.component.html',
  styleUrls: ['./animator.component.scss']
})
export class AnimatorComponent {
  public animationString: SafeHtml;

  constructor(public sanitizer: DomSanitizer) {
    this.initAnimation();
  }

  private _animDefs: AnimationData[];

  @Input()
  set animDefs(value: AnimationData[]) {
    this._animDefs = value;
    this.initAnimation();
  }

  get staticImage(): string {
    return this.anim?.img != null ? `assets/images/seasons/${this.anim?.img}-static.png` : '';
  }

  private _animId: string;

  @Input()
  set animId(value: string) {
    this._animId = value;
    this.initAnimation();
  }

  get anim(): AnimationData {
    return this._animDefs.find(a => a.id === this._animId);
  }

  private initAnimation(): void {
    if (this._animDefs == null || this._animDefs.length === 0 || this._animId === 'none') {
      this.animationString = '';
      return;
    }
    const temp = [];
    const defs = this.anim;
    let src = defs;
    const count = defs?.count ?? 150;
    const srcDefs: AnimationData[] = [];
    this._animDefs.forEach(val => srcDefs.push(Object.assign({}, val)));
    for (let i = 0; i < count; i++) {
      src = defs;
      let tries = 0;
      while (src == null && tries < 10) {
        src = srcDefs[Math.floor(Math.random() * srcDefs.length)];
        if (src.count == 0) {
          src = null;
        } else {
          src.count--;
        }
        tries++;
      }
      if (src == null) {
        this.animationString = '';
        return;
      }
      const x = src.x.min + Math.floor(Math.random() * (src.x.max - src.x.min));
      const y = src.y.min + Math.floor(Math.random() * (src.y.max - src.y.min));
      const speed = 5 + Math.floor(1 + Math.random() * 50) / 10;
      const size = src.size.min + Math.floor(Math.random() * (src.size.max - src.size.min));
      const style = `top:${y}%;left:${x}%;animation:${src.animName} ${speed}s 1s linear normal forwards`;
      temp.push(`<div style="${style}" class="${src.class}"><img style="width:${size / 5}px" src="assets/images/seasons/${src.img}.png" alt="season image"></div>`);
    }
    this.animationString = this.sanitizer.bypassSecurityTrustHtml(Utils.join(temp, ''));
  }
}
