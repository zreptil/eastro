import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';

@Component({
  selector: 'app-five-elements',
  templateUrl: './five-elements.component.html',
  styleUrls: ['./five-elements.component.scss']
})
export class FiveElementsComponent {

  markProps: string[] = [];

  constructor() {
    this.load();
  }

  get globals(): GlobalsService {
    return GLOBALS;
  }

  load(): void {
    try {
      const data = JSON.parse(localStorage.getItem('elemProps'));
      this.markProps = data.m;
    } catch (ex) {
    }
  }
}
