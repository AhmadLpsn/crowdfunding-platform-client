import { Connection, Keypair, PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, SystemInstruction, SystemProgram, Transaction } from "@solana/web3.js"
import fs from 'fs'
require('source-map-support').install();
let keyPairs: Keypair;
let programId = new PublicKey("F7KqwYK8eGQjMVRM4aicYkGUgyo5YJrZZTrPfkr6fepL");

const loadKeyPairs = (path: string) => {
    const content = fs.readFileSync(path, { encoding: 'utf8' })
    const secretKey = Uint8Array.from(JSON.parse(content))
    keyPairs = Keypair.fromSecretKey(secretKey);
}

const establishConnection = async (rpcUrl: string) => {
    const connection = new Connection(rpcUrl, 'confirmed');

    const version = await connection.getVersion();

    console.log('Connection to cluster established:', rpcUrl, version);
    return connection
}

const createAccount = async (seed: string, space: number, connection: Connection) => {
    const pubKey = await PublicKey.createWithSeed(keyPairs.publicKey, seed, programId);
    console.log("pubKey",pubKey)
    const lamports = await connection.getMinimumBalanceForRentExemption(space);
    console.log("lamports",lamports)
    const instruction = SystemProgram.createAccountWithSeed({
        basePubkey: keyPairs.publicKey,
        fromPubkey: keyPairs.publicKey,
        newAccountPubkey: pubKey,
        programId,
        seed,
        space,
        lamports
    })

    const transaction = new Transaction().add(instruction)

    const result = await sendAndConfirmTransaction(connection, transaction, [keyPairs])
    console.log(result)
}
loadKeyPairs('./keys.json')
establishConnection("https://8899-ahmadlpsn-crowdfundingpl-h8n7fc3l7t3.ws-eu39a.gitpod.io/")
    .then(connection => createAccount("campaign 2", 1024, connection))
    .catch(console.log)
