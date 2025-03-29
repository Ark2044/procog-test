import env from "@/app/env";
import { Client, Databases, Storage, Users, Messaging } from "node-appwrite";

const client = new Client();

client
  .setEndpoint(env.appwrite.endpoint)
  .setProject(env.appwrite.projectId)
  .setKey(env.appwrite.apikey);

const databases = new Databases(client);
const storage = new Storage(client);
const users = new Users(client);
const messages = new Messaging(client);

export { client, storage, users, databases, messages };
