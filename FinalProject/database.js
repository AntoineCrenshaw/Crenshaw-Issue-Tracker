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
  return await db.collection('bugs').find({}).toArray();
}

async function GetBugById(bugId){
  const db = await connect();
  const data = await db.collection('bugs').findOne({ _id: new ObjectId(bugId)});
  return data;
}

async function createBug(bug){
  const db = await connect();
  const dbResult = await db.collection('bugs').insertOne(bug);
  return dbResult;
}

async function updateBug(updatedBug){
  const db = await connect();
  const dbResult = await db.collection('bugs').updateOne({ _id: new ObjectId(updatedBug._id) }, { $set: updatedBug });
  return dbResult;
}

async function updateBugClassification(newClassification){
  const db = await connect();
  const dbResult = await db.collection('bugs').updateOne({ _id: new ObjectId(newClassification._id) }, { $set: { classification: newClassification.classification } });
  return dbResult;
}

async function closeBug(updatedBug){
  const db = await connect();
  const dbResult = await db.collection('bugs').updateOne(
    { _id: new ObjectId(updatedBug._id) }, 
    { $set: { 
      closed: updatedBug.closed,
      closedOn: updatedBug.closedOn,
      lastUpdated: updatedBug.lastUpdated
}});
debugDb(`Bug: ${JSON.stringify(dbResult)}`);
  return dbResult;
}

//Users CRUD operations

async function GetAllUsers(){
  const db = await connect();
  return db.collection('users').find({}).toArray();
}

async function GetAllUsersByRole(role) {
  const db = await connect();
  return db.collection('users').find({ role }).toArray();
}

async function GetAllUsersByAge(maxAge){
  const db = await connect();
  return db.collection('users').find({ createdDate: { $gte: maxAge }}).toArray();
}

async function GetUserById(userId){
  const db = await connect();
  
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  debugDb(`User: ${JSON.stringify(user)}`);
  return user;
  
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

async function updateAssignTo(bug){
  const db = await connect();
  debugDb(`Bug: ${JSON.stringify(bug)}`);
  const dbResult = await db.collection('bugs').updateOne(
    { _id: new ObjectId(bug._id) }, 
    { $set: { 
    assignedToUserId: bug.assignedToUserId,
    assignedToUserName: bug.assignedToUserName,
    assignedOn: bug.assignedOn,
    lastUpdated: bug.lastUpdated
   } 
  }
);
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

//comments CRUD operations

async function GetComment(commentId){
  const db = await connect();
  debugDb(`Comment id: ${JSON.stringify(commentId)}`);
  return db.collection('comments').findOne({ _id: new ObjectId(commentId) });
}

async function createComment(comment){
  const db = await connect();
  const dbResult = db.collection('comments').insertOne(comment);
  return dbResult;
}

//Tests CRUD operations
async function GetTests(testsId){
  const db = await connect();
  debugDb(`Tests id: ${JSON.stringify(testsId)}`);
  return db.collection('testCases').findOne({ _id: new ObjectId(testsId) });
}

async function CreateTests(tests){
  const db = await connect();
  const dbResult = db.collection('testCases').insertOne(tests);
  return dbResult;
}

async function updateTests(updatedTests){
  const db = await connect();
  const dbResult = await db.collection('testCases').updateOne({ _id: new ObjectId(updatedTests._id) }, { $set: updatedTests });
  return dbResult;
};

async function deleteTests(testsId){
  const db = await connect();
  debugDb(`Tests id: ${JSON.stringify(testsId)}`);
  const dbResult = db.collection('testCases').deleteOne({ _id: new ObjectId(testsId) });
  return dbResult;
}
  


// test the database connection
ping();

// export functions
export { GetAllBugs, GetBugById, GetAllUsersByRole, GetAllUsersByAge, createBug, updateBug, closeBug, GetAllUsers, GetUserByEmail, GetUserById, createUser, updateUser, updateBugClassification, updateAssignTo, updateTests, deleteUser, deleteTests, loginUser, GetComment, createComment, GetTests, CreateTests};