import {Injectable} from '@angular/core';
import {EventData} from '@/_model/event-data';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  events: EventData[] = [];

  constructor() {
  }

  private _partnerList: EventData[][] = [];

  get partnerList(): EventData[][] {
    return this._partnerList;
  }

  get markedEvents(): EventData[] {
    return this.events.filter(e => e.marked);
  }

  markEvent(event: EventData, value: boolean) {
    event._marked = value;
    this.fillPartnerList();
  }

  fillPartnerList() {
    const ret: EventData[][] = [];
    if (this.markedEvents.length > 1) {
      for (var i = 0; i < this.markedEvents.length - 1; i++) {
        for (var j = i + 1; j < this.markedEvents.length; j++) {
          ret.push([this.markedEvents[i], this.markedEvents[j]]);
        }
      }
    }
    this._partnerList = ret;
  }

}
