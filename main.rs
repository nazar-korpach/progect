#![feature(proc_macro_hygiene, decl_macro)]
#![feature(core_intrinsics)]

#[macro_use] extern crate rocket;

use rocket::response::content;
use serde::Deserialize;
use rocket_contrib::json::Json;

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
    if cheak(&connection, user){
        content::Json("{'status': 'True'}".to_string())
    }
    else {
        content::Json("{status: 'False'}".to_string())
    }
}

fn cheak(connection: &sqlite::Connection, user: Json<Member>) -> bool {
    use sqlite::Value;
    let mut cursor = connection
        .prepare("SELECT * FROM user WHERE name = ? AND password = ?")
        .unwrap().cursor();
    let name = &user.name;
    let password = &user.password;
    cursor.
        bind(&[Value::String(name.to_string()),
            Value::String(password.to_string())])
        .unwrap();
    let mut i = 0;
    while let Some(row) = cursor.next().unwrap() {
        println!("name = {}", row[0].as_string().unwrap());
        println!("password = {}", row[1].as_string().unwrap());
        println!("emeil = {}", row[2].as_string().unwrap());
        i += 1
    }
    println!("{}", i);
    if i > 0 {
        true
    }
    else{
        false
    }
}

#[get("/")]
fn get() -> String {
    let connection  = sqlite::open("memory.db").unwrap();
    got(&connection)
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
    let password = &user.password;
    let email = &user.email;
    cursor.
        bind(&[Value::String(name.to_string()),
            Value::String(password.to_string()), 
            Value::String(email.to_string())])
        .unwrap();
    while let Some(row) = cursor.next().unwrap() {
        println!("name = {}", row[0].as_string().unwrap());
        println!("age = {}", row[1].as_integer().unwrap());
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
        names[i] =  (statement.read::<String>(0).unwrap() +&" " 
        + &statement.read::<String>(1).unwrap() 
        + &" " + &statement.read::<String>(2).unwrap());
        i += 1;
    }  
    println!("{:?}", &names[0..i]);
    let mut st: String = "".to_string();
    for j in 0..i {
        st += &names[j];
        st += "\n";
    }
    st 
}