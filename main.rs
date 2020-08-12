#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;

use rocket_contrib::databases::rusqlite;
use rocket::response::content;
use serde::Deserialize;
use rocket_contrib::json::Json;
use sha2::{Sha256, Digest};
use std::fmt::Write;

#[derive(Deserialize)]
struct User{
    name: String,
    password: String,
    email: String
}

#[derive(Deserialize)]
struct Member {
    name: String,
    password: String
}


#[database("sqlite_logs")]
struct LogsDbConn(rusqlite::Connection);

fn main() {
    //let a = LogsDbConn("aa");
    //strange(a);
    rocket::ignite()
       .attach(LogsDbConn::fairing())
       .mount("/", routes![get, new_user, delete, login])
       .launch();
}

#[delete("/?<name>")]
fn delete(name: String, connection: LogsDbConn){
    println!("{}", name);
    del(&connection, name);
}

fn del(connection: &LogsDbConn, name: String){
    connection.execute("DELETE FROM users WHERE name = ? ", &[&name]).unwrap();
}

#[post("/login", format = "application/json", data = "<user>")]
fn login(user: Json<Member>, connection: LogsDbConn) -> content::Json<String>{
    match cheak(&connection, user){
        true => content::Json("{'status': 'True'}".to_string()),
        false => content::Json("{status: 'False'}".to_string())
    }
}

fn cheak(connection: &LogsDbConn, user: Json<Member>) -> bool {
    let name = &user.name;
    let password = hashing(&user.password) + "oBI$Xg(Z?3w]SyE_UW2n";
    let query = format!("SELECT * FROM users WHERE name = '{}' AND password = '{}'", name, password);
    println!("{}", query);
    let mut data = connection
        .prepare(&query).unwrap();

    let mut is: bool = false;
    let person_iter = data.query_map(&[], |row| {
        User {
            name: row.get(0),
            password: row.get(1),
            email: row.get(2)
        }
    }).unwrap();
    for person in person_iter {
        is = true;
        break
    }
    println!("{}", is);
    is
}

#[get("/")]
fn get(connection: LogsDbConn) -> content::Json<String> {
    content::Json(got(&connection))
}

fn got (connection: &LogsDbConn) -> String {
    let mut statement = connection
        .prepare("SELECT * FROM users")
        .unwrap();
    let mut names: [String; 32] = Default::default();
    let mut i = 0;

    let person_iter = statement.query_map(&[], |row| {
        User {
            name: row.get(0),
            password: row.get(1),
            email: row.get(2),
        }
    }).unwrap();
    for person in person_iter {
        let a = person.unwrap();
        names[i] = format!("name: {}, password {}, emeil {}", a.name, a.password, a.email);
        println!("{}", names[i]);
        i += 1
    }
    let mut st: String = String::from("");
    st += "{\n";
    for j in 0..i {
        st += "user";
        st += &(j+1).to_string();
        st += ": {";
        st += &names[j];
        match j == i-1 {
        true => st += "}\n",
        false => st += "},\n"
        }
    }
    st +="}";
    st 
}

#[post("/", format = "application/json", data = "<user>")]
fn new_user(user: Json<User>, connection: LogsDbConn) {
    insert(&connection, user);
}

fn insert(connection: &LogsDbConn, user: Json<User>) {
    let name = &user.name;
    let password = hashing(&user.password) + "oBI$Xg(Z?3w]SyE_UW2n";
    let email = &user.email;    
    connection.execute("INSERT INTO users VALUES (?, ?, ?)", &[name, &password, email]).unwrap();
}

fn hashing(st: &str) -> String{
    let mut hasher = Sha256::new();
    hasher.update(st);
    let result = hasher.finalize();
    encode_hex(&result)
}

fn encode_hex(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for &b in bytes {
        write!(&mut s, "{:02x}", b);
    }
    s
}
