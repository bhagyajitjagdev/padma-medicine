import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css'],
})
export class TabsComponent implements OnInit {
  constructor(private clipboard: Clipboard) {}

  @Input() items: any = [];
  @Input() itemsIncome: number | null = 0;
  @Input() firstTitle: string = '';
  @Input() secondTitle: string = '';

  ngOnInit(): void {}

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }
}
