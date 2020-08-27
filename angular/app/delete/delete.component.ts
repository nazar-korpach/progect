import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent implements OnInit {
  deleteName: string

  constructor(private http: HttpClient){}

  delete(){
    if (this.deleteName)
      this.http.delete('https://immense-fortress-17915.herokuapp.com/?name='+this.deleteName).subscribe((response)=> alert('request success'))
    else alert("wrong input")
  }

  ngOnInit(): void {
  }

}
