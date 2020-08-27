import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-insert',
  templateUrl: './insert.component.html',
  styleUrls: ['./insert.component.css']
})
export class InsertComponent implements OnInit {
  userName: string
  userPassword: string
  userEmail: string

  constructor(private http: HttpClient){}

  send(){
    if (this.userName && this.userPassword && this.userEmail){
      this.http.post('https://immense-fortress-17915.herokuapp.com/', {name: this.userName, password: this.userPassword, email: this.userEmail}).subscribe((response)=>
      alert('input success'))
    }
    else {
      alert("wrong input")
    }
  }

  ngOnInit(): void {
  }

}
