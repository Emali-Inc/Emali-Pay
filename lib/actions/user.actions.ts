'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
} = process.env;

/**
 * Retrieves user information based on the provided user ID.
 * 
 * @param {Object} param - Parameters for the function.
 * @param {string} param.userId - The ID of the user to retrieve information for.
 * @returns {Promise<Object>} - The user information.
 */
export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
}


/**
 * Signs up a new user.
 * 
 * @param {Object} param - Parameters for the function.
 * @param {string} param.password - The user's password.
 * @param {Object} param.userData - Additional user data.
 * @param {string} param.userData.email - The user's email.
 * @param {string} param.userData.firstName - The user's first name.
 * @param {string} param.userData.lastName - The user's last name.
 * @returns {Promise<Object>} - The newly created user information.
 */
export const signUp = async ({ password, ...userData }: SignUpParams) => {
  //Destructure sythax of userData
  const { email, firstName, lastName } = userData;

  let newUserAccount;

  try {
    const { account, database } = await createAdminClient();
    //create new user by passing to appwrite account
    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    if (!newUserAccount) throw new Error('Error creating user');

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
      }
    );
     //Create session by awaiting account and Calling creatEmailPasswordSession from appwrite.
    const session = await account.createEmailPasswordSession(email, password);

    //Get the cookies by importing from next-header and attatch it to session.
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    //stringify the object since we cannot pass large object to server action.
    return parseStringify(newUser);
  } catch (error) {
    console.error('Error', error);
  }
}

/**
 * Signs in a user using their email and password.
 * 
 * @param {Object} param - Parameters for the function.
 * @param {string} param.email - The user's email.
 * @param {string} param.password - The user's password.
 * @returns {Promise<Object>} - The signed-in user information.
 */
export const signIn = async ({ email, password }: signInProps) => {
  try {
    //extract account from acreateAdminClient
    const { account } = await createAdminClient();
    
    //Create session email and password using predefine method.
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId });

    return parseStringify(user);
  } catch (error) {
    console.error('Error', error);
  }
}

/**
 * Retrieves the currently logged-in user's information.
 * 
 * @returns {Promise<Object|null>} - The logged-in user information or null if not logged in.
 */
export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();

    const user = await getUserInfo({ userId: result.$id });

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Logs out the currently logged-in user.
 * 
 * @returns {Promise<null>} - Returns null on successful logout or error.
 */
export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    cookies().delete('appwrite-session');

    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
}
