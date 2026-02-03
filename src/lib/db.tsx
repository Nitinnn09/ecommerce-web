import mongoose from "mongoose";

const MUSERNAME = process.env.MUSERNAME;
const MPASSWORD = process.env.MPASSWORD;

if (!MUSERNAME || !MPASSWORD) {
  throw new Error("Please define MUSERNAME and MPASSWORD in .env.local");
}

const MONGODB_URI = `mongodb+srv://${MUSERNAME}:${MPASSWORD}@cluster1.z51gnzd.mongodb.net/products?retryWrites=true&w=majority`;

declare global {
  var mongooseConn: {
    conn: any;
    promise: any;
  } | undefined;
}

let cached = global.mongooseConn;

if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

export async function connectdb() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("✅ MongoDB Connected");
      return mongoose;
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
