"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
  //Creating session so that we can attatch to our client
  const session = cookies().get("appwrite-session");

  //Check if the session exist and value.
  //return Error if No session.
  if (!session || !session.value) {
    throw new Error("No session");
  }
  //Attatch the session to this client(setSession predefined appwrite method,is used to attatch session to client )
  client.setSession(session.value);
   
  //Use getter method to extract it from client.
  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);//permission is needed to attach the session to admin client
    //Admin client will have acess to all functionality  through the APPWRITE_KEY
    //The API key as full permission for databases ,Autheticatio,Storage

    //Extract account,database,user using the session and API key through get method.
    //new keyword is used to create instance
  return {
    get account() {
      return new Account(client); 
    },
    get database() {
      return new Databases(client);
    },
    get user() {
      return new Users(client);
    }
  };
}
