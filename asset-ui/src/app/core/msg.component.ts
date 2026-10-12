import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-msg',
  standalone: true,
  template: `
    @if (error) { <div class="alert error">{{ error }}</div> }
    @if (info) { <div class="alert ok">{{ info }}</div> }
  `,
})
export class MsgComponent {
  @Input() error = '';
  @Input() info = '';
}
