import {EventData} from '@/_model/event-data';

export class ZodiacEventData extends EventData {
  event: EventData;
  type: string;

  constructor(event: EventData, type: string) {
    super();
    this.event = event;
    this.type = type;
  }
}
