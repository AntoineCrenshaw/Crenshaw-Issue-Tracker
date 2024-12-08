import {MongoClient, ObjectId} from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

import debug from 'debug';
const debugDB = debug('app:db');

// Generate/Parse an ObjectId
const newId = (str) => new ObjectId(str);

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
  debugDB(`Ping: ${JSON.stringify(pong)}`);
}

async function getAllProducts(){
  const db = await connect();
  return await db.collection('Products').find({}).toArray();
}

async function getProductById(productId){
  const db = await connect();
  const results = await db.collection('Products').findOne({_id: new ObjectId(productId)});
  return results;
}

async function getProductByName(productName){
  const db = await connect();
  const results = await db.collection('Products').findOne({name: productName});
  return results;
}

async function createProduct(newProduct){
  const db = await connect();
  const results = await db.collection('Products').insertOne(newProduct);
  return results;
}

async function updateProduct(productId, updatedProduct){
  const db = await connect();
  const results = await db.collection('Products').updateOne({_id: new ObjectId(productId)}, {$set: updatedProduct});
  return results;
}

async function deleteProduct(productId){
  const db = await connect();
  const results = await db.collection('Products').deleteOne({_id: new ObjectId(productId)});
  return results;
}

/* Users */

async function getAllUsers(){
  const db = await connect();
  const results = await db.collection('Users').find({}).toArray();
  return results;
}

async function createUser(newUser){
  const db = await connect();
  debugDB(`Creating new user: ${JSON.stringify(newUser)}`);
  const results = await db.collection('Users').insertOne(newUser);
  return results;
}

async function getUserById(userId){
  const db = await connect();
  const results = await db.collection('Users').findOne({_id: new ObjectId(userId)});
  return results;
}

async function getUserByEmail(email){
  const db = await connect();
  const results = await db.collection('Users').findOne({email: email});
  return results;
}

async function deleteUser(userId){
  const db = await connect();
  const results = await db.collection('Users').deleteOne({_id: new ObjectId(userId)});
  return results;
}

async function updateUser(userId, updatedUser){
  const db = await connect();
  const results = await db.collection('Users').updateOne({_id: new ObjectId(userId)}, {$set: updatedUser});
  return results;
}

async function saveAuditLog(log){
  const db = await connect();
  const results = await db.collection('AuditLog').insertOne(log);
  return results;
}

async function findRoleByName(roleName){
  try {
    const db = await connect();
    const results = await db.collection('Roles').findOne({ name: roleName });
    
    if (!results) {
      console.log(`No role found for name: ${roleName}`);
    }

    return results;
  } catch (error) {
    console.error("Error finding role by name:", error);
}
}

ping();

export {getAllProducts, deleteProduct, getProductById, createProduct, getProductByName, updateProduct, getAllUsers, createUser, getUserById, saveAuditLog, updateUser, getUserByEmail, findRoleByName, deleteUser};