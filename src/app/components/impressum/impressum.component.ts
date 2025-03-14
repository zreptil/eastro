import {Component} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';

@Component({
    selector: 'app-impressum',
    templateUrl: './impressum.component.html',
    styleUrls: ['./impressum.component.scss'],
    standalone: false
})
export class ImpressumComponent {
  constructor(public globals: GlobalsService) {
  }
}
