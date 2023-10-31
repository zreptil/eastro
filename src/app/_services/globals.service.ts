import {Injectable} from '@angular/core';
import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {lastValueFrom, throwError, timeout} from 'rxjs';
import {oauth2SyncType} from '@/_services/sync/oauth2pkce';
import {LangData} from '@/_model/lang-data';
import {SyncService} from '@/_services/sync/sync.service';
import {LanguageService} from '@/_services/language.service';
import {EnvironmentService} from '@/_services/environment.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {ZodiacEventData} from '@/_model/zodiac-event-data';
import {Router} from '@angular/router';
import {FiveElementsData} from '@/_model/five-elements-data';

class CustomTimeoutError extends Error {
  constructor() {
    super('It was too slow');
    this.name = 'CustomTimeoutError';
  }
}

export let GLOBALS: GlobalsService;

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  version = '1.0';
  skipStorageClear = false;
  debugFlag = 'debug';
  debugActive = 'yes';
  appMode = 'standard';
  editPart: string;
  maxLogEntries = 20;
  storageVersion: string;
  currentPage: string;
  language: LangData;
  theme: string;
  _syncType: oauth2SyncType;
  oauth2AccessToken: string = null;
  genders = [
    {'type': 'Yang', 'name': $localize`männlich`, 'color': 'white'},
    {'type': 'Yin', 'name': $localize`weiblich`, 'color': 'black'}
  ];
  public zodiacEvent: ZodiacEventData = null;
  public zodiacData: any;
  svgCollection: SafeHtml;
  public listAnimals: any[] = [];
  public colors: any = {
    'Grün': {fill: 'var(--elem-1-back)', text: 'var(--elem-1-fore)'},
    Rot: {fill: 'var(--elem-2-back)', text: 'var(--elem-2-fore)'},
    Gelb: {fill: 'var(--elem-3-back)', text: 'var(--elem-3-fore)'},
    Weiss: {fill: 'var(--elem-4-back)', text: 'var(--elem-4-fore)'},
    Blau: {fill: 'var(--elem-5-back)', text: 'var(--elem-5-fore)'}
  };
  _timeoutHandle: number;
  _nextChange: number;
  progress: number;
  elemView: number = 2;
  currElemStyle: string;
  nextElemStyle: string;
  viewElemStyle: string;
  elem5Page: string = null;
  cfgFiveElements: FiveElementsData;
  private flags = '';

  constructor(public http: HttpClient,
              public sync: SyncService,
              public ls: LanguageService,
              public env: EnvironmentService,
              public sanitizer: DomSanitizer,
              public router: Router) {

    GLOBALS = this;
    this.loadWebData();
    this.loadSharedData().then(_ => {
      // if (Utils.isEmpty(this.storageVersion)) {
      //   this.currentPage = 'welcome';
      // } else if (this.storageVersion !== this.version) {
      //   this.currentPage = 'news';
      // } else {
      //   this.currentPage = 'elements';
      // }
    });
  }

  _currElement = '4';

  get currElement(): string {
    return this._currElement;
  }

  set currElement(value: string) {
    this._currElement = value;
  }

  _isDebug = false;

  get isDebug(): boolean {
    return this._isDebug && Log.mayDebug;
  }

  set isDebug(value: boolean) {
    if (!Log.mayDebug) {
      value = false;
    }
    this._isDebug = value;
  }

  get mayDebug(): boolean {
    return Log.mayDebug;
  }

  get mayEdit(): boolean {
    return this.may('edit');
  }

  get isAdmin(): boolean {
    return this.may('admin');
  }

  get runsLocal(): boolean {
    return window.location.href.indexOf('/localhost:') >= 0;
  }

  _isLocal = window.location.href.indexOf('/localhost:') >= 0;

  get isLocal(): boolean {
    return this._isLocal;
  }

  set isLocal(value: boolean) {
    this._isLocal = value;
  }

  get appTitle(): string {
    return document.querySelector('head>title').innerHTML;
  }

  set animDuration(value: number) {
    this.cfgFiveElements.animDuration = value;
    this.saveSharedData();
  }

  set prologDuration(value: number) {
    this.cfgFiveElements.prologDuration = value;
    this.saveSharedData();
  }

  get animShowStatic(): boolean {
    return this.cfgFiveElements.animShowStatic;
  }

  set animShowStatic(value: boolean) {
    this.cfgFiveElements.animShowStatic = value;
    this.saveSharedData();
  }

  get animWiggleDuration(): number {
    return this.cfgFiveElements.animWiggleDuration;
  }

  set animWiggleDuration(value: number) {
    this.cfgFiveElements.animWiggleDuration = value;
    this.saveSharedData();
  }

  get animShowAnimation(): boolean {
    return this.cfgFiveElements.animShowAnimation;
  }

  set animShowAnimation(value: boolean) {
    this.cfgFiveElements.animShowAnimation = value;
    this.saveSharedData();
  }

  _timeLeft: string;

  get timeLeft(): string {
    return this._timeLeft;
  }

  get nextElement(): string {
    return this.getElement(this.currElement, 'creates');
  }

  durationText(duration: number): string {
    if (duration === 0) {
      return null;
    }
    let ret = `${duration / 1000} Sekunden`;
    if (duration % 60000 === 0) {
      ret = Utils.plural(duration / 60000, {
        1: `1 Minute`,
        other: `${duration / 60000} Minuten`
      });
    }
    return ret;
  }

  clickPlay(doInit: boolean, onElemChange?: (elem: string) => void) {
    if (doInit) {
      this._nextChange = new Date().getTime() + this.cfgFiveElements.animDuration;
      this.progress = 0;
      this._timeLeft = '';
    }
    this._timeoutHandle = setTimeout(() => this.doStep(onElemChange), 900);
  }

  doStep(onElemChange?: (elem: string) => void) {
    if (this.elem5Page != null) {
      return;
    }
    const timeout = 900;
    const now = new Date().getTime();
    this.progress = (1 - (this._nextChange - now - timeout) / this.cfgFiveElements.animDuration) * 100;
    const left = Math.floor(Math.max(0, (this._nextChange - now) / 1000));
    const m = Math.floor(left / 60);
    const s = `${left % 60}`.padStart(2, '0');
    this._timeLeft = `${m}:${s}`;
    if (now >= this._nextChange) {
      this.activateNextElement(null, onElemChange);
      this._nextChange = new Date().getTime() + this.cfgFiveElements.animDuration;
      this.progress = 0;
    }
    this.clickPlay(false, onElemChange);
  }

  activateNextElement(evt: MouseEvent, onElemChange?: (elem: string) => void) {
    evt?.stopPropagation();
    onElemChange?.(null);
    this.activate('creates', onElemChange);
  }

  toggleElemView() {
    let view = this.elemView + 1;
    if (view > 2) {
      view = 0;
    }
    this.elemView = view;
  }

  activate(idx: string, onElemChange?: (elem: string) => void) {
    const nextElement = this.getElement(this.currElement, idx);
    if (this.elemView === 2) {
      if (+nextElement === 4) {
        this.currElement = null;
        onElemChange?.('prolog');
        return;
      }
      const duration = 2;
      this.currElemStyle = `fadeOut ${duration}s ease-in-out normal`;
      this.nextElemStyle = `fadeIn ${duration}s ease-in-out normal`;
      this.viewElemStyle = `--ad:${duration / 2}s;animation:fadeColor ${duration}s ease-in-out normal;--bf:var(--elem-${this.currElement}-back);--bt:var(--elem-${nextElement}-back);--ff:var(--elem-${this.currElement}-fore);--ft:var(--elem-${nextElement}-fore)`;
      setTimeout(() => {
        this.currElement = nextElement;
        onElemChange?.(this.currElement);
        this.viewElemStyle = '';
        this.currElemStyle = '';
        this.nextElemStyle = '';
      }, duration * 1000);
    } else {
      this.currElement = nextElement;
      onElemChange?.(this.currElement);
    }
  }

  setCurrentPage(page: string): void {
    if (page.startsWith('@')) {
      this.router.navigate([page.substring(1)]);
      return;
    }
    this.currentPage = page;
    this.saveSharedData();
  }

  clickStop(evt: MouseEvent) {
    evt?.stopPropagation();
    this.currElement = null;
    clearTimeout(this._timeoutHandle);
    this._timeoutHandle = null;
    this._timeLeft = '';
  }

  changeAnimDuration(evt: MouseEvent) {
    evt?.stopPropagation();
    const list = [5, 10, 60, 90, 120, 300];
    const idx = list.findIndex(l => l === this.cfgFiveElements.animDuration / 1000);
    if (idx < 0) {
      this.animDuration = list[0] * 1000;
    } else {
      this.animDuration = list[idx >= list.length - 1 ? 0 : idx + 1] * 1000;
    }
  }

  changePrologDuration(evt: MouseEvent) {
    evt?.stopPropagation();
    const list = [0, 10, 15, 20, 25, 30];
    const idx = list.findIndex(l => l === this.cfgFiveElements.prologDuration / 1000);
    if (idx < 0) {
      this.prologDuration = list[0] * 1000;
    } else {
      this.prologDuration = list[idx >= list.length - 1 ? 0 : idx + 1] * 1000;
    }
  }

  getElement(element: string, idx: string): string {
    const elem = this.zodiacData?.elements?.[element];
    return elem?.[idx] ?? element;
  }

  markedProp(element: string, value: string) {
    const ret = this.propsForElement(element)?.find(p => p.name === value);
    if (ret != null) {
      const parts = ret.property.split(',');
      if (parts.length > 1) {
        return {name: ret.name, property: parts[0]};
      }
    }
    return ret ?? {};
  }

  imgForElement(baseElement: string, idx: string): string {
    let key = baseElement;
    if (idx !== 'curr') {
      key = this.zodiacData?.elements?.[baseElement]?.[idx] ?? baseElement;
    }
    return `assets/images/elements/clear/${key}.png`;
  }

  public propsForElement(id: string | number): any[] {
    return this.zodiacData?.props?.filter((p: any) => p.type === 'element' && +p.typeId === +id);
  }

  public nameForElement(id: string | number): string {
    return this.zodiacData?.elements?.[id]?.name;
  }

  async loadSharedData() {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('sharedData')) ?? {};
    } catch {
    }
    let syncData: any = await this.sync.downloadFile(this.env.settingsFilename);
    if (syncData != null) {
      try {
        if (+syncData.s0 > +storage.s0) {
          storage = syncData;
        }
      } catch {
      }
    }

    this.storageVersion = storage.s1;
    this.currentPage = storage.s2 ?? 'elements';
    this.cfgFiveElements = FiveElementsData.fromJson(storage.s3 ?? {});
    // validate values
    if (this.svgCollection == null) {
      this.svgCollection = {};
      this.request('assets/images/images.svg', {options: {responseType: 'text'}}).then(result => {
        this.svgCollection = this.sanitizer.bypassSecurityTrustHtml(result.body);
      });
    }
    if (this.zodiacData == null) {
      this.zodiacData = {};
      this.request('assets/zodiac.json').then(result => {
        const data = result.body;
        for (const key of Object.keys(data['years'])) {
          const value = data.years[key].start;
          data.years[key].start = new Date(+key, +value.substring(0, 2) - 1, +value.substring(2, 4));
        }
        this.zodiacData = data;
        const list = [];
        for (const key of Object.keys(data?.animals ?? {})) {
          list.push({...data?.animals[key], key: key});
        }
        this.listAnimals = list;
      });
    }
  }

  saveSharedData(): void {
    const storage: any = {
      s0: Date.now(),
      s1: this.version,
      s2: this.currentPage,
      s3: this.cfgFiveElements?.asJson
    };
    const data = JSON.stringify(storage);
    localStorage.setItem('sharedData', data);
    if (this.sync.hasSync) {
      this.sync.uploadFile(this.env.settingsFilename, data);
    }
  }

  loadWebData(): void {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('webData')) ?? {};
    } catch {
    }

    const code = storage.w0 ?? 'en-GB';
    this.language = this.ls.languageList.find((lang) => lang.code === code);
    this._syncType = storage.w1 ?? oauth2SyncType.none;
    this.oauth2AccessToken = storage.w2;
    this.theme = storage.w3 ?? 'standard';

    // validate values
    if (this.oauth2AccessToken == null) {
      this._syncType = oauth2SyncType.none;
    }
  }

  saveWebData(): void {
    const storage: any = {
      w0: this.language.code ?? 'de_DE',
      w1: this._syncType,
      w2: this.oauth2AccessToken,
      w3: this.theme
    };
    localStorage.setItem('webData', JSON.stringify(storage));
  }

  async requestJson(url: string, params?: { method?: string, options?: any, body?: any, showError?: boolean, asJson?: boolean, timeout?: number }) {
    return this.request(url, params).then(response => {
      return response?.body;
    });
  }

  async request(url: string, params?: { method?: string, options?: any, body?: any, showError?: boolean, asJson?: boolean, timeout?: number }) {
    params ??= {};
    params.method ??= 'get';
    params.showError ??= true;
    params.asJson ??= false;
    params.timeout ??= 1000;
    let response;
    const req = new HttpRequest(
      params.method,
      url,
      null,
      params.options);
    try {
      switch (params.method.toLowerCase()) {
        case 'post':
          response = await lastValueFrom(this.http.post(url, params.body, params.options).pipe(timeout({
            each: params.timeout,
            with: () => throwError(() => new CustomTimeoutError())
          })));
          break;
        default:
          response = await lastValueFrom(this.http.request(req).pipe(timeout({
            each: params.timeout,
            with: () => throwError(() => new CustomTimeoutError())
          })));
          break;
      }
    } catch (ex: any) {
      if (ex instanceof CustomTimeoutError) {
        response = `There was no answer within ${params.timeout / 1000} seconds at ${url}`;
      } else if (ex?.messge != null) {
        response = ex.message;
      } else {
        response = ex;
      }
    }
    return params.asJson ? response.body : response;
  }

  meaningHtmlFor(type: string, lookup: number): SafeHtml {
    const meaning: any = this.zodiacData?.meanings?.find((m: any) => m.type === type && +m.lookup === +lookup);
    if (meaning == null) {
      return `Es sind noch keine Daten verfügbar.`;
    }
    let ret = `<span>${meaning.info}</span>`;
    return this.sanitizer.bypassSecurityTrustHtml(ret);
  }

  activityIdFor(date: Date, idAnimal: number | string): number {
//    date = new Date(2023, 0, 2);

    const dayanimal = this.getDayAnimal(date);

    const m = date.getMonth() + 1;
    const d = date.getDate();
    const month = this.zodiacData.months.find((month: any) =>
      (month.begmonth <= m && month.endmonth > m)
      || (month.begmonth === m &&
        (month.begday <= d || month.endday >= d)));

    console.log(month, dayanimal, idAnimal);

    let ret = ((+month.idx - 1) + (+dayanimal - 1) - (+idAnimal - 1)) % 12;
    while (ret >= 12) {
      ret -= 12;
    }
    while (ret < 0) {
      ret += 12;
    }
    return ret + 1;
  }

  /**
   * gets the animal for the given date.
   * @param date date to retrieve the animal for
   * @returns the animal for the given date (1 - 12)
   */
  getDayAnimal(date: Date): number {
    // Das Tagestier am 1.1.1583 war Schlange
    const days = Utils.differenceInDays(date, new Date(1583, 0, 1));
    const dayanimal = 6;
    const ret = (days + dayanimal - 1) % 12 + 1;
    console.log('dayanimal', ret, days, Utils.fmtDate(date), date);
    return ret <= 0 ? 12 + ret : ret;
  }

  styleForElement(idx: string, def: string, anim?: string): any {
    const elem = this.zodiacData?.elements?.[def];
    let key = elem?.[idx] ?? def;
    const prop = this.propsForElement(key)?.find((p: any) => p.name === 'Farbe');
    const color = this.colors[prop?.['property']] ?? {fill: 'initial', text: 'black'};
    const ret: any = {'--hand-fill': color.fill, '--fist-fill': color.fill, '--text': color.text};
    if (!Utils.isEmpty(anim)) {
      ret['animation'] = anim;
    }
    return ret;
  }

  elementForAnimal(_animal: any): string {
    return '';
  }

  getAnimalElement(key: string): string {
    return this.listAnimals.find(a => +a.key === +key)?.element;
  }

  private may(key: string): boolean {
    return this.flags.indexOf(`|${key}|`) >= 0;
  }
}
