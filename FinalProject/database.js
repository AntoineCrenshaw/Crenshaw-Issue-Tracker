import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from 'dotenv';
dotenv.config();

import debug from 'debug';
const debugDb = debug('app:Database');

/** Generate/Parse an ObjectId */
const newId = (str) => new ObjectId(str);

/** Global variable storing the open connection, do not use it directly */
let _db = null;

async function connect() {
  if(!_db){
   const dbUrl = process.env.DB_URL;
   const dbName = process.env.DB_NAME;
   const client = await MongoClient.connect(dbUrl);
   _db = client.db(dbName);
  }
  return _db;
}

/** Connect to the database and verify the connection */
async function ping(){
  const db = await connect();
  const pong = await db.command({ ping: 1 });
  debugDb(`Ping:, ${JSON.stringify(pong)}`);
}

// Bugs CRUD operations
async function GetAllBugs(){
  const db = await connect();
  return db.collection('bugs').find({}).toArray();
}

async function GetBugById(bugId){
  const db = await connect();
  return db.collection('bugs').findOne({ _id: newId(bugId) });
}

async function createBug(bug){
  const db = await connect();
  const dbResult = db.collection('bugs').insertOne(bug);
  return dbResult;
}

async function updateBug(bugId){
  const db = await connect();
  const dbResult = db.collection('bugs').updateOne({ _id: new ObjectId(bugId) }, { $set: bugId });
  return dbResult;
}

async function deleteBug(bugId){
  const db = await connect();
  const dbResult = db.collection('bugs').deleteOne({ _id: new ObjectId(bugId) });
  return dbResult;
}

//Users CRUD operations

async function GetAllUsers(){
  const db = await connect();
  return db.collection('users').find({}).toArray();
}

async function GetUserById(userId){
    debugDb(`User id: ${userId}`);
  const db = await connect();
  if(userId.length !== 24){
    debugDb(`Invalid user id: ${userId}`);
    return {}
  } else {
  const user = db.collection('users').findOne({ _id: new ObjectId(userId) });
  debugDb(`User: ${JSON.stringify(user)}`);
  return user;
    }
}

async function GetUserByEmail(email){
  const db = await connect();
  const user = db.collection('users').findOne({ email: email });
  return user;
}

async function createUser(newUser){
  const db = await connect();
  const dbResult = db.collection('users').insertOne(newUser);
  return dbResult;
}

async function updateUser(userId, user){
  const db = await connect();
  const dbResult = db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: user });
  return dbResult;
}

async function deleteUser(userId){
  const db = await connect();
  const dbResult = db.collection('users').deleteOne({ _id: new ObjectId(userId) });
  return dbResult;
}

async function loginUser(email, password){
  const db = await connect();
  const user = await db.collection('users').findOne({ email: email, password: password });
  debugDb(`User: ${JSON.stringify(user)}`);
  return user;
}

// test the database connection
ping();

// export functions
export { GetAllBugs, GetBugById, createBug, updateBug, deleteBug, GetAllUsers, GetUserByEmail, GetUserById, createUser, updateUser, deleteUser, loginUser };