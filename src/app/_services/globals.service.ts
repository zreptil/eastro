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
  private flags = '';

  constructor(public http: HttpClient,
              public sync: SyncService,
              public ls: LanguageService,
              public env: EnvironmentService,
              public sanitizer: DomSanitizer) {

    GLOBALS = this;
    this.loadWebData();
    this.loadSharedData().then(_ => {
      if (Utils.isEmpty(this.storageVersion)) {
        this.currentPage = 'welcome';
      } else if (this.storageVersion !== this.version) {
        this.currentPage = 'news';
      } else {
        this.currentPage = 'main';
      }
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

  styleForElement(idx: string, def: string): any {
    const elem = GLOBALS.zodiacData?.elements?.[def];
    let key = elem?.[idx] ?? def;
    const prop = GLOBALS.propsForElement(key)?.find((p: any) => p.name === 'Farbe');
    const color = this.colors[prop?.['property']] ?? {fill: 'initial', text: 'black'};
    const ret: any = {'--hand-fill': color.fill, '--fist-fill': color.fill, '--text': color.text};
    return ret;
  }

  elementForAnimal(animal: any): string {
    return '';
  }

  getAnimalElement(key: string): string {
    return this.listAnimals.find(a => +a.key === +key)?.element;
  }

  private may(key: string): boolean {
    return this.flags.indexOf(`|${key}|`) >= 0;
  }
}
