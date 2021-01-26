const { Client, Hbar, TokenCreateTransaction, PrivateKey, AccountId } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    let adminKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY) //Changed: Converted from String to PrivateKey type.
    let treasuryAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID) //Changed: This is an account ID which you are using your testnet account ID. Converted from String to PrivateKey type.
    let treasuryKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY) // Changed: Since the treasury account is your testnet account the treasury private key is the corresponding private key to your testnet account. Converted from String to AccountID type

    console.log(adminKey.toString()) //Changed to print in string format for better readability 
    console.log(treasuryAccountId.toString()) //Changed to print in string format for better readability 

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null ||
        myPrivateKey == null) {
        throw new Error("Environment variables myAccountId, myPrivateKey, treasuryKey, adminKey must be present");
    }
    // Create our connection to the Hedera network
    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    //Create the transaction and freeze for manual signing
    const transaction = await new TokenCreateTransaction()
    .setTokenName("Alba")
    .setTokenSymbol("S")
    .setTreasuryAccountId(treasuryAccountId) //Changed to treasury account ID variable
    .setInitialSupply(5000)
    .setAdminKey(adminKey)
    .setMaxTransactionFee(new Hbar(100)) //Change the default max transaction fee
    .freezeWith(client);

    //Sign the transaction with the token adminKey and the token treasury account private key
    const signTx =  await (await transaction.sign(adminKey)).sign(treasuryKey);//Changed so you are signing with private keys. Since the client signs the transaction has has your private key already set and you chose to use the same keys for your admin key and treasury account, you do not need to explicity sign with those keys since they are all the same.

    //Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the token ID from the receipt
    const tokenId = receipt.tokenId;

    console.log("The new token ID is " + tokenId);
}

main();