import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css']
})
export class FindComponent implements OnInit {
  response: any;
  tableMode: boolean = false



  buttonName(name: string){
    if (name==='search') return this.response? 'reload table'  : 'search'
    return this.tableMode? 'close table'  : 'open table'
  }

  changeMode(){
    this.tableMode = !this.tableMode
  }

  constructor(private http: HttpClient){}
 
  search(){
    this.http.get('https://immense-fortress-17915.herokuapp.com').subscribe((response) => {
      alert('request success')
      this.response = response
    })
  }

  ngOnInit(): void {
  }

}
