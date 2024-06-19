'use server';

import { Databases, ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "@/lib/plaid";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";
import { revalidatePath } from "next/cache";

//Getting the database env varible from Appwrite and destucture it.
const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
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
     
    console.log("New User Account:",newUserAccount);
    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: 'personal'
    });

    if (! dwollaCustomerUrl) throw new Error('Error creating Dwolla customer');

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
       
    console.log("DwollaCustomerId:",dwollaCustomerId);
    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl
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
    //Extract account from createSesssionClient
    const { account } = await createSessionClient();

    //Call the cookies and delete appwrite-session
    cookies().delete('appwrite-session');

    //call the awit and delete current session
    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
}

//createLinkToken
export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
    }

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token })
  } catch (error) {
    console.log(error);
  }
}

//createBankAccount server action
export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        shareableId,
      }
    )
    return parseStringify(bankAccount);
  } catch (error) {
    
  }
}

//Create exchangePublicToken
export const exchangePublicToken = async ({ publicToken,user }: exchangePublicTokenProps) => {
  try {
    //Exchange public token for access token and item ID
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account information from Plaid using the access token
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

     // Create a processor token for Dwolla using the access token and account ID
     const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

     // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
     const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    // If the funding source URL is not created, throw an error
    if (!fundingSourceUrl) throw Error;

    // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
    //createBankAccount is srver.action which we will create together
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id),
    });

     // Revalidate the path to reflect the changes from next/cache
     revalidatePath("/");

     // Return a success message
     return parseStringify({
       publicTokenExchange: "complete",
     });

  } catch (error) {
    console.error("An error occurred while creating exchange token:",error);
  }
}