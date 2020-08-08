#![feature(proc_macro_hygiene, decl_macro)]
#![feature(core_intrinsics)]

#[macro_use] extern crate rocket;

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

#[delete("/?<name>")]
fn delete(name: String){
    let connection  = sqlite::open("memory.db").unwrap();
    println!("{}", name);
    del(connection, name);
}

fn del(connection: sqlite::Connection, name: String){
    use sqlite::Value;
    let mut cursor =  connection.prepare("DELETE FROM user WHERE name = ? ").unwrap().cursor();
    cursor.
        bind(&[Value::String(name)])
        .unwrap();
    while let Some(row) = cursor.next().unwrap() {
        println!("name = {}", row[0].as_string().unwrap());
        println!("password = {}", row[1].as_string().unwrap());
        println!("emeil = {}", row[2].as_string().unwrap());
    }
}


#[post("/login", format = "application/json", data = "<user>")]
fn login(user: Json<Member>) -> content::Json<String>{
    let connection  = sqlite::open("memory.db").unwrap();
    match cheak(&connection, user){
        true => content::Json("{'status': 'True'}".to_string()),
        false => content::Json("{status: 'False'}".to_string())
    }
}

fn cheak(connection: &sqlite::Connection, user: Json<Member>) -> bool {
    use sqlite::Value;
    let mut cursor = connection
        .prepare("SELECT * FROM user WHERE name = ? AND password = ?")
        .unwrap().cursor();
    let name = &user.name;
    let password = hashing(&user.password) + "oBI$Xg(Z?3w]SyE_UW2n";
    cursor.
        bind(&[Value::String(name.to_string()),
            Value::String(password.to_string())])
        .unwrap();
    let mut is: bool = false;
    while let Some(row) = cursor.next().unwrap() {
        println!("name = {}", row[0].as_string().unwrap());
        println!("password = {}", row[1].as_string().unwrap());
        println!("emeil = {}", row[2].as_string().unwrap());
        is = true;
    }
    println!("{}", is);
    is
}

#[get("/")]
fn get() -> content::Json<String> {
    let connection  = sqlite::open("memory.db").unwrap();
    content::Json(got(&connection))
}

#[post("/", format = "application/json", data = "<user>")]
fn new_user(user: Json<User>) {
    let connection  = sqlite::open("memory.db").unwrap();
    insert(connection, user);
}

fn main() {
    let connection: sqlite::Connection  = sqlite::open("memory.db").unwrap();
    got(&connection);
    rocket::ignite().mount("/", routes![get, new_user, delete, login]).launch();
}

fn insert(connection: sqlite::Connection, user: Json<User>) {
    use sqlite::Value;
    let mut cursor =  connection.prepare("INSERT INTO user VALUES (?, ?, ?)" ).unwrap().cursor();
    let name = &user.name;
    let password = hashing(&user.password) + "oBI$Xg(Z?3w]SyE_UW2n";
    let email = &user.email;
    cursor.
        bind(&[Value::String(name.to_string()),
            Value::String(password.to_string()), 
            Value::String(email.to_string())])
        .unwrap();
    while let Some(row) = cursor.next().unwrap() {
        println!("name = {}", row[0].as_string().unwrap());
        println!("password {}", row[1].as_string().unwrap());
        println!("emeil {}", row[2].as_string().unwrap());
    }
}

fn got (connection: &sqlite::Connection) -> String {
    use sqlite::State;
    let mut statement = connection
        .prepare("SELECT * FROM user")
        .unwrap();
    let mut names: [String; 32] = Default::default();
    let mut i = 0;
    while let State::Row = statement.next().unwrap() {
        println!("name = {}", statement.read::<String>(0).unwrap());
        println!("password = {}", statement.read::<String>(1).unwrap());
        println!("emeil= {}", statement.read::<String>(2).unwrap());
        names[i] =  format!("name: {}, password: {}, emeil: {}", statement.read::<String>(0).unwrap(),
        &statement.read::<String>(1).unwrap(),
        &statement.read::<String>(2).unwrap());
        i += 1;
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