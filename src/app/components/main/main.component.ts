import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  toolbarButtons = [
    {label: 'Elemente', page: 'elements'},
    {label: 'Tiere', page: 'animals'}
  ];

  constructor(public globals: GlobalsService,
              public sync: SyncService) {
  }

  get classForHeader(): string[] {
    const ret = ['mat-elevation-z4'];
    if (GLOBALS.isDebug) {
      ret.push('debug');
    }
    return ret;
  }

  setCurrentPage(page: string): void {
    GLOBALS.currentPage = page;
    GLOBALS.saveSharedData();
  }

  classForToolbarbutton(btn: any): string[] {
    const ret = [];
    if (GLOBALS.currentPage === btn.page) {
      ret.push('current');
    }
    return ret;
  }

  clickLocalTitle() {
    GLOBALS.isLocal = !GLOBALS.isLocal;
  }
}
