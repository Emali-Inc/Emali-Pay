'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const SignIn = async ({ email,password }: signInProps) => {
    try {
       //Mutation /Modify the database  Make fetch
       const { account } = await createAdminClient();

       const response = await account.createEmailPasswordSession(email,password);
       return parseStringify(response);
    }  catch (error) {
        console.error(error);
    }
}

export const SignUp = async (userData: SignUpParams) => {
    //Destructuring the user data syntax
    const { email,password,firstName,lastName } = userData;
    try {
       //Mutation /Modify the database  Make fetch /Create user account
       const { account } = await createAdminClient();

       const newUser = await account.create(
        ID.unique(), 
        email, 
        password,
         `${firstName} ${lastName}`
        );
        //creating the session by awing the email and password
       const session = await account.createEmailPasswordSession(email, password);
        
       //import the cookies from next-headers library of nextjs
       cookies().set("emali-appwrite-session", session.secret, {
         path: "/",
         httpOnly: true,
         sameSite: "strict",
         secure: true,
       });
       //in nextjs we cannot pass large object such as entire user object
       //through server actions rather we have to stringify and call the function from utils.ts file 
       return parseStringify(newUser);
     
    } catch (error) {
        console.error(error);
    }
}

// ... your initilization functions
export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const user = await account.get();

      return parseStringify(user);
    } catch (error) {
      return null;
    }
  }
  