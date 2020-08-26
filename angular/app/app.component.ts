import { Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { stringify } from '@angular/compiler/src/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  home: boolean = true

  homeChange(){
    this.home = !this.home
  }
}


