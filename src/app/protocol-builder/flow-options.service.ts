import { Injectable } from '@angular/core';

@Injectable()
export class FlowOptionsService {
  options: { value: string; label: string }[] = [];
}
