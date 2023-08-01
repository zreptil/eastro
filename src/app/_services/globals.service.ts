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
    gruen: {fill: 'var(--elem-1-back)', text: 'var(--elem-1-fore)'},
    rot: {fill: 'var(--elem-2-back)', text: 'var(--elem-2-fore)'},
    gelb: {fill: 'var(--elem-3-back)', text: 'var(--elem-3-fore)'},
    weiss: {fill: 'var(--elem-4-back)', text: 'var(--elem-4-fore)'},
    blau: {fill: 'var(--elem-5-back)', text: 'var(--elem-5-fore)'}
  };
  _timeoutHandle: number;
  _nextChange: number;
  progress: number;
  elemView: number = 2;
  currElemStyle: string;
  nextElemStyle: string;
  viewElemStyle: string;
  currElement = '4';
  private flags = '';

  constructor(public http: HttpClient,
              public sync: SyncService,
              public ls: LanguageService,
              public env: EnvironmentService,
              public sanitizer: DomSanitizer) {

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

  _duration = 10000;

  get duration(): string {
    if (this._duration % 60000 === 0) {
      return Utils.plural(this._duration / 60000, {
        1: `1 Minute`,
        other: `${this._duration / 60000} Minuten`
      });
    }
    return `${this._duration / 1000} Sekunden`;
  }

  _timeLeft: string;

  get timeLeft(): string {
    return this._timeLeft;
  }

  get nextElement(): string {
    return this.getElement(this.currElement, 'creates');
  }

  clickPlay(evt: MouseEvent) {
    evt?.stopPropagation();
    if (evt != null) {
      this._nextChange = new Date().getTime() + GLOBALS._duration;
      this.progress = 0;
      this._timeLeft = '';
    }
    this._timeoutHandle = setTimeout(() => this.doStep(), 900);
  }

  doStep() {
    const timeout = 900;
    const now = new Date().getTime();
    this.progress = (1 - (this._nextChange - now - timeout) / GLOBALS._duration) * 100;
    const left = Math.floor(Math.max(0, (this._nextChange - now) / 1000));
    const m = Math.floor(left / 60);
    const s = `${left % 60}`.padStart(2, '0');
    this._timeLeft = `${m}:${s}`;
    if (now >= this._nextChange) {
      this.activateNextElement(null);
      this._nextChange = new Date().getTime() + GLOBALS._duration;
      this.progress = 0;
    }
    this.clickPlay(null);
  }

  activateNextElement(evt: MouseEvent) {
    evt?.stopPropagation();
    this.activate('creates');
  }

  toggleElemView() {
    let view = this.elemView + 1;
    if (view > 2) {
      view = 0;
    }
    this.elemView = view;
  }

  activate(idx: string) {
    const nextElement = this.getElement(this.currElement, idx);
    if (this.elemView === 2) {
      const duration = 2;
      this.currElemStyle = `fadeOut ${duration}s ease-in-out normal`;
      this.nextElemStyle = `fadeIn ${duration}s ease-in-out normal`;
      this.viewElemStyle = `--ad:${duration / 2}s;animation:fadeColor ${duration}s ease-in-out normal;--bf:var(--elem-${this.currElement}-back);--bt:var(--elem-${nextElement}-back);--ff:var(--elem-${this.currElement}-fore);--ft:var(--elem-${nextElement}-fore)`;
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

  clickStop(evt: MouseEvent) {
    evt?.stopPropagation();
    clearTimeout(this._timeoutHandle);
    this._timeoutHandle = null;
    this._timeLeft = '';
  }

  changeDuration(evt: MouseEvent) {
    evt?.stopPropagation();
    const list = [10, 60, 90, 120, 300];
    const idx = list.findIndex(l => l === GLOBALS._duration / 1000);
    if (idx < 0) {
      GLOBALS._duration = list[0] * 1000;
    } else {
      GLOBALS._duration = list[idx >= list.length - 1 ? 0 : idx + 1] * 1000;
    }
  }

  getElement(element: string, idx: string): string {
    const elem = GLOBALS.zodiacData?.elements?.[element];
    return elem?.[idx] ?? element;
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

  imgForElement(baseElement: string, idx: string): string {
    let key = baseElement;
    if (idx !== 'curr') {
      key = GLOBALS.zodiacData?.elements?.[baseElement]?.[idx] ?? baseElement;
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
        console.log(this.zodiacData);
      });
    }
  }

  saveSharedData(): void {
    const storage: any = {
      s0: Date.now(),
      s1: this.version,
      s2: this.currentPage
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
    const elem = GLOBALS.zodiacData?.elements?.[def];
    let key = elem?.[idx] ?? def;
    const prop = GLOBALS.propsForElement(key)?.find((p: any) => p.name === 'Farbe');
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
