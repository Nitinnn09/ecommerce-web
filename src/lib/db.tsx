import mongoose from "mongoose";

function getMongoUri() {
  const direct = process.env.MONGODB_URI;
  if (direct) return direct;

  const user = process.env.MUSERNAME;
  const pass = process.env.MPASSWORD;
  if (user && pass) {
    return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
      pass
    )}@cluster1.z51gnzd.mongodb.net/products?retryWrites=true&w=majority`;
  }

  throw new Error("Missing MongoDB env. Set MONGODB_URI (recommended) or MUSERNAME and MPASSWORD.");
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn:
    | {
        conn: any;
        promise: any;
      }
    | undefined;
}

let cached = global.mongooseConn;

if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

export async function connectdb() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    const uri = getMongoUri();
    cached!.promise = mongoose.connect(uri).then((m) => {
      console.log("MongoDB Connected");
      return m;
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

