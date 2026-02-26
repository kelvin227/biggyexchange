"use server";
import { prisma } from "@/lib/db";
import { ethers, formatUnits } from "ethers";
import { completetrans } from "../user";
import crypto from "crypto";
import * as bip39 from "bip39";
import { Keypair, Connection, PublicKey, Transaction, SystemProgram, clusterApiUrl  } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import bcrypt from "bcryptjs";
/* eslint-disable */

const adminWallet = "0xd8c8223d43F6AD2af6D5c6399C6Fc63aF42253B6";
const usdtcontractaddress = "0x55d398326f99059ff775485246999027b3197955";
const Networks = {
  eth:`https://mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`,
  bsc:`https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`,
  ethsepolia:`https://sepolia.infura.io/v3/${process.env.INFRUA_API_KEY}`,
  solana:`https://api.mainnet-beta.solana.com`,
  solanaDevnet:`https://api.devnet.solana.com`,
  solanaTestnet:`https://api.testnet.solana.com`
  
}
  

const abi = [
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    constant: true,
    inputs: [],
    name: "_decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "_name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "_symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "burn",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "mint",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

// simple AES encryption helper
function encrypt(text: string, password: string) {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  const encrypted =
    cipher.update(text, "utf8", "hex") + cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText: string, password: string) {
  const [ivHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(password, "salt", 32);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  const decrypted =
    decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");

  return decrypted;
}

export async function createSolanaWallet(
  password: string,
  email: string,
  index = 0
) {
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // 2. Generate Solana mnemonic
  const mnemonic = bip39.generateMnemonic(256);

  // 3. Derive seed
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // 4. Solana derivation path
  const path = `m/44'/501'/${index}'/0'`;
  const derived = derivePath(path, seed.toString("hex"));

  // 5. Create Solana keypair
  const keypair = Keypair.fromSeed(derived.key.slice(0, 32));

  const publicKey = keypair.publicKey.toBase58();
  const secretKey = Buffer.from(keypair.secretKey).toString("hex");

  // 6. Encrypt sensitive data
  const encryptedSecretKey = encrypt(secretKey, password);
  const encryptedMnemonic = encrypt(mnemonic, password);

  // 7. Store in DB
  const wallet = await prisma.solanaWallets.create({
    data: {
      address: publicKey,
      encrypted_key: encryptedSecretKey,
      mnemonic: encryptedMnemonic,
      network: "SOLANA",
      userId: user.id,
      private_key: encryptedSecretKey,
    },
  });

  return {
    id: wallet.id,
    address: publicKey,
  };
}



export async function createWallet(password: string, email: string) {
  const getuser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!getuser) {
    throw new Error("User not found");
  }
  const userId = getuser.id;

  const wallet = ethers.Wallet.createRandom();
  const private_key = wallet.privateKey;
  const encryptedJson = await wallet.encrypt(password);
  const newWallet = await prisma.wallets.create({
    data: {
      address: wallet.address,
      private_key: private_key,
      network: "BEP20",
      mnemonic: wallet.mnemonic?.phrase as string,
      encrypted_key: encryptedJson,
      userId,
    },
  });
  if (newWallet){

  }
  return newWallet;
}

export async function checkbalance(
  email: string,
  amount: string,
  price: string
) {
  //(address: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    return { success: false, message: "unable able to fecth user details" };
  }
  const getaddress = await prisma.wallets.findUnique({
    where: { userId: user.id },
    select: { address: true },
  });
  if (!getaddress) {
    return { success: false, message: "unable able to fecth wallet address" };
  }
  const address = getaddress?.address;

  const usdt = "0x55d398326f99059ff775485246999027b3197955";
  const usdtresponse = await fetch(
    `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokenbalance&contractaddress=${usdt}&address=${address}&tag=latest&apikey=${process.env.ETHER_API_KEY}`
  );

  const data = await usdtresponse.json();
  const balance = ethers.formatEther(data.result); // Assuming the API returns the balance in the 'result' field
  let cal = Number(amount) * Number(price);
  let cal2 = cal * 0.02 + cal;
  if (Number(balance) < cal2) {
    return {
      success: false,
      message: `insufficient balance, you need ${cal2}"USDT`,
    };
  }
  const fee = Number(amount) * 0.02;
  // Optional: Check sender's BNB balance for gas fees
  const senderBNBBalance = await getBnbBalance(address);
  // You might want to estimate gas for the transaction more precisely here.
  // For a simple transfer, a rough estimate is okay, but it's crucial for users to have enough BNB.
  const estimatedGasLimit = ethers.formatEther("60000"); // A common estimate for token transfer
  const gasPrice = await estimateGas(address, adminWallet, amount);
  const gasPriceForFee = await estimateGas(
    address,
    adminWallet,
    fee.toString()
  );
  const gaspriceconvert = gasPrice?.totalGasWei ?? 0 * gasPrice?.gasPrice;
  console.log("this is gaspriceconvert", formatUnits(gaspriceconvert));
  const gasPriceConvertForFee = gasPriceForFee?.totalGasWei ?? 0 * gasPrice?.gasPrice;
  console.log("this is gasPriceconvertforfee", formatUnits(gasPriceConvertForFee))
//   const requiredBNBForFee = Number(gasPriceConvertForFee) * Number(estimatedGasLimit);
//   console.log("this is requiredBNBforFee", requiredBNBForFee)
//   const requiredBNB = Number(gaspriceconvert) * Number(estimatedGasLimit);
//   console.log("this is the reuiredbnb",requiredBNB)
  const requiredBNBBalance = formatUnits(gasPriceConvertForFee) + formatUnits(gaspriceconvert);
  console.log("this is the required bnb balance", requiredBNBBalance)

  console.log(senderBNBBalance.message)

  if (Number(senderBNBBalance.message) < Number(requiredBNBBalance)) {
    return {
      success: false,
      message: `Insufficient BNB for gas fees in wallet ${address}. Needs approx. ${requiredBNBBalance} BNB.`,
    };
  }
  return { success: true, message: "" };
  //return {success: true, message: balance};
}

export async function getBalance(address: string) {
  //(address: string) {
  const usdtContract = "0x55d398326f99059ff775485246999027b3197955";
  const url = `https://bsc-mainnet.nodereal.io/v1/${process.env.NODEREAL_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'nr_getTokenBalance20',
      params: [usdtContract, address, 'latest'],
      id: 1,
    }),
  });

  const data = await response.json();
  if (data.result) {
    // USDT uses 18 decimals on BSC
    const balance = BigInt(data.result) / BigInt(1e18);
    return { success: true, message: balance.toString() };
  }else{
    throw new Error('Failed to fetch USDT balance');
  }
  
  //return {success: true, message: balance};
}
export async function getBnbBalance(address: string) {
  const url = `https://bsc-mainnet.nodereal.io/v1/${process.env.NODEREAL_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    }),
  });

  const data = await response.json();
  
  if (data.result) {
    // Convert hex wei to decimal BNB
    const wei = BigInt(data.result);
    const bnbBalance = Number(wei) / 1e18;
    return { success: true, message: bnbBalance.toFixed(6) };
  }else{
    throw new Error('Failed to fetch BNB balance');
  }
  
  //return {success: true, message: balance};
}
export async function getEthBalance(
  address: string
) {
  //(address: string) {
  const usdtresponse = await fetch(
    `https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHER_API_KEY}`
  );
  const data = await usdtresponse.json();
  const balance = ethers.formatEther(data.result); // Assuming the API returns the balance in the 'result' field

  return { success: true, message: balance };
  //return {success: true, message: balance};
}
export async function getSolBalance(address: string, net: string) {
  try {
    let rpcUrl;
    switch (net) {
      case "mainnet":
        rpcUrl = Networks.solana;
        break;
      case "testnet":
        rpcUrl = Networks.solanaTestnet;
        break;
      case "devnet":
        rpcUrl = Networks.solanaDevnet;
        break;
      default:
        throw new Error("Invalid Solana network");
    }

    const connection = new Connection(
      rpcUrl,
      "confirmed"
    );

    const pubKey = new PublicKey(address);

    const balanceLamports = await connection.getBalance(pubKey);
    const balanceSOL = balanceLamports / 1e9;

    return Number(balanceSOL.toFixed(6));
  } catch (err) {
    throw new Error("Invalid Solana address or RPC error");
  }
}
export async function sendSol(
  email: string, // Uint8Array format
  recipientAddress: string,
  amountSol: number,
  network: "mainnet-beta" | "devnet" | "testnet",
  password: string
) {
  try {
    // 1️⃣ Connect to network
    const connection = new Connection(clusterApiUrl(network), "confirmed");


    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

      if (!user) {
          return { success: false, error: "User not found" };
      }
      const confirmPassword = bcrypt.compareSync(password, user.password);

      if (!confirmPassword) {
          return { success: false, error: "Incorrect password" };
      }

      const solanaWallet = await prisma.solanaWallets.findUnique({
          where: { userId: user.id },
      });
      if (!solanaWallet) {
          return { success: false, error: "Solana wallet not found" };
      }

    const decrypted = decrypt(solanaWallet.private_key, password);

    // 2️⃣ Create sender keypair
    const sender = Keypair.fromSecretKey(
      Uint8Array.from(Buffer.from(decrypted, "hex"))
    );

    // 3️⃣ Create recipient public key
    const recipient = new PublicKey(recipientAddress);

    // 4️⃣ Convert SOL to lamports
    const lamports = amountSol * 1_000_000_000;

    // 5️⃣ Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: recipient,
        lamports,
      })
    );

    // 6️⃣ Send transaction
    const signature = await connection.sendTransaction(
      transaction,
      [sender]
    );

    return {
      success: true,
      signature,
      explorer: `https://explorer.solana.com/tx/${signature}?cluster=${network}`,
    };
  } catch (error) {
    console.error("Error in sendSol:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",};
  }
}

export async function getPrice() {
  const urls = {
    usdt: `https://api.coingecko.com/api/v3/simple/price?ids=binance-bridged-usdt-bnb-smart-chain&vs_currencies=usd`,
    eth: `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`,
    btc: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`,
    sol: `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`,
    bnb: `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`,
    ton: `https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd`,
    pi: `https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd`,
  };
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": `${process.env.COIN_GECKO_KEY}`,
    },
  };

  try {
    const [usdtRes, ethRes, btcRes, solRes, bnbRes, tonRes, piRes] = await Promise.all([
      fetch(urls.usdt, options),
      fetch(urls.eth, options),
      fetch(urls.btc, options),
      fetch(urls.sol, options),
      fetch(urls.bnb, options),
      fetch(urls.ton, options),
      fetch(urls.pi, options),
    ]);

    if (
      !usdtRes.ok ||
      !ethRes.ok ||
      !btcRes.ok ||
      !solRes.ok ||
      !bnbRes.ok ||
      !tonRes.ok ||
      !piRes.ok
    ) {
      throw new Error("Failed to fetch one or more prices from CoinGecko");
    }

    const [
      usdtData,
      ethData,
      btcData,
      solData,
      bnbData,
      tonData,
      piData,
    ] = await Promise.all([
      usdtRes.json(),
      ethRes.json(),
      btcRes.json(),
      solRes.json(),
      bnbRes.json(),
      tonRes.json(),
      piRes.json(),
    ]);

    return {
      success: true,
      prices: {
        usdt: usdtData["binance-bridged-usdt-bnb-smart-chain"]?.usd ?? null,
        eth: ethData["ethereum"]?.usd ?? null,
        btc: btcData["bitcoin"]?.usd ?? null,
        sol: solData["solana"]?.usd ?? null,
        bnb: bnbData["binancecoin"]?.usd ?? null,
        ton: tonData["the-open-network"]?.usd ?? null,
        pi: piData["pi-network"]?.usd ?? null,
      },
    };
  } catch (error) {
    console.error("getPrice error:", error);
    return { success: false, message: error };
  }
}
export async function getBnbPrice() {
  const url2 = `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": `${process.env.COIN_GECKO_KEY}`,
    },
  };

  try {
    const response = await fetch(url2, options);
    if (!response.ok) {
      throw new Error("Failed to fetch price from CoinGecko");
    }
    const data = await response.json();
    const price = data["binancecoin"]?.usd;
    if (typeof price !== "number") {
      throw new Error("Unexpected response structure from CoinGecko");
    }
    return { success: true, message: price };
  } catch (error) {
    console.error("getPrice error:", error);
    return { success: false, message: error };
  }
}
export async function gettransaction(address: string) {
  try {
    const responses = await fetch(
      `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokentx&contractaddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&address=${address}&page=0&offset=5&startblock=0&endblock=999999999&sort=desc&apikey=${process.env.ETHER_API_KEY}`
    );

    return responses.json();
  } catch (error) {
    console.error("Error fetching transaction data:", error);
  }
}

export async function sendusdt(
  amount: string,
  recipient: string,
  email: string
) {
  if (!amount || Number(amount) === 0) {
    throw new Error("Invalid amount provided.");
  }

  if (!recipient) {
    throw new Error("Recipient address is required.");
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      return { success: false, message: "unable to get userId" };
    }
    const id = user.id;
    const wallets = await prisma.wallets.findUnique({
      where: { userId: id },
      select: { address: true, encrypted_key: true, private_key: true },
    });

    // 1. Setup Provider and Wallet
    const provider = new ethers.JsonRpcProvider(
      `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
    );
    const wallet = new ethers.Wallet(wallets?.private_key as string, provider);

    // Get the sender's address (for logging/checking)
    const senderAddress = wallet.address;
    console.log(`Transfer initiated by ${senderAddress}`);

    // 2. Instantiate USDT Contract
    const usdtContract = new ethers.Contract(usdtcontractaddress, abi, wallet);

    // 3. Get USDT decimals to format the amount correctly
    const decimals = await usdtContract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);

    // Optional: Check sender's balance before sending
    const senderUSDTBalance = await usdtContract.balanceOf(senderAddress);
    if (senderUSDTBalance <= amountInWei) {
      return {
        success: false,
        message: `Insufficient USDT balance for ${senderAddress}. Has ${ethers.formatUnits(senderUSDTBalance, decimals)} USDT, needs ${amount} USDT.`,
      };
    }

    // Optional: Check sender's BNB balance for gas fees
    const senderBNBBalance = await getBnbBalance(senderAddress);
    // You might want to estimate gas for the transaction more precisely here.
    // For a simple transfer, a rough estimate is okay, but it's crucial for users to have enough BNB.
    const estimatedGasLimit = ethers.formatEther("60000"); // A common estimate for token transfer
    const gasPrice = await estimateGas(senderAddress, recipient, amount);
    const gaspriceconvert = parseInt(gasPrice?.gasPrice, 16);
    const requiredBNB = gaspriceconvert * Number(estimatedGasLimit);
    console.log(requiredBNB);
    if (Number(senderBNBBalance.message) < Number(requiredBNB)) {
      return {
        success: false,
        message: `Insufficient BNB for gas fees in wallet ${senderAddress}. Needs approx. ${requiredBNB} BNB.`,
      };
    }

    // 4. Send the Transaction
    console.log(
      `Attempting to transfer ${amount} USDT from ${senderAddress} to ${recipient}`
    );
    const tx = await usdtContract.transfer(recipient, amountInWei, {
      gasLimit: ethers.parseEther(estimatedGasLimit), // Explicitly set gas limit or let ethers estimate
    });

    console.log(`Transaction submitted! Hash: ${tx.hash}`);

    // 5. Wait for Transaction Confirmation (important for reliability)
    const receipt = await tx.wait(); // Waits for 1 block confirmation by default

    if (receipt.status === 1) {
      console.log(`Transaction successfull! Block: ${receipt.blockNumber}`);
      // Here you would update your database for the P2P order status
      console.log("this is the tx:", tx);
      console.log("this is the receipt:", receipt);
      return {
        success: true,
        message: "USDT transfer successful",
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        recipient,
        amount: amount,
        sender: senderAddress,
      };
    } else {
      console.error(`Transaction failed! Receipt:`, receipt);
      return {
        success: false,
        message: "USDT transfer failed on blockchain",
        transactionHash: tx.hash,
        receipt: receipt,
      };
    }
  } catch (error: any) {
    console.log("Error during USDT transfer:", error);
    let errorMessage = "An unexpected error occurred during the transfer.";

    // Try to get more specific error messages from the blockchain or Ethers.js
    if (error.reason) {
      errorMessage = `Blockchain Error: ${error.reason}`;
    } else if (
      error.message &&
      error.message.includes("insufficient funds for gas")
    ) {
      errorMessage = "Insufficient BNB for gas fees in the sender's wallet.";
    } else if (error.code === "CALL_EXCEPTION") {
      errorMessage =
        "Smart contract call failed. Check recipient address and amount.";
    }
  }
}
export async function getTestEthBal(
  address: string
) {
  //(address: string) {
  const usdtresponse = await fetch(
    `https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHER_API_KEY}`
  );
  const data = await usdtresponse.json();
  const balance = ethers.formatEther(data.result); // Assuming the API returns the balance in the 'result' field

  return { success: true, message: balance };
  //return {success: true, message: balance};
}
export async function sendtestEth(
   amount: string,
  recipient: string,
  email: string
) {
  try {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Invalid amount provided.");
    }

    if (!recipient) {
      throw new Error("Recipient address is required.");
    }

    // Convert amount to wei (BigInt)
    const amountInWei = ethers.parseEther(amount);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, message: "Failed to get user info" };
    }

    const wallets = await prisma.wallets.findUnique({
      where: { userId: user.id },
      select: { address: true, private_key: true },
    });

    if (!wallets?.private_key || !wallets?.address) {
      return { success: false, message: "Wallet not found" };
    }

    // Setup provider
    const provider = new ethers.JsonRpcProvider(Networks.ethsepolia);

    const wallet = new ethers.Wallet(wallets.private_key, provider);

    // 1️⃣ Estimate Gas
    const gasLimit = await provider.estimateGas({
      from: wallets.address,
      to: recipient,
      value: amountInWei,
    });

    // Add 20% safety buffer
    const bufferedGasLimit = (gasLimit * 12n) / 10n;

    // 2️⃣ Get Gas Price
    const feeData = await provider.getFeeData();
      if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("Failed to fetch EIP-1559 fee data");
    }


    // 3️⃣ Calculate Total Gas Cost
    const totalGasCostWei = bufferedGasLimit * feeData.maxFeePerGas;

    // 4️⃣ Get Sender Balance
    const senderBalanceWei = await provider.getBalance(wallets.address);

    // 5️⃣ Check if sender has enough for amount + gas
    if (senderBalanceWei < amountInWei + totalGasCostWei) {
      return {
        success: false,
        message: "Insufficient ETH for amount + gas fees",
      };
    }

    console.log("Gas Limit:", bufferedGasLimit.toString());
    console.log("max fee per gas:", feeData.maxFeePerGas.toString());
    console.log(
      "Max Priority Fee Per Gas:",
      feeData.maxPriorityFeePerGas.toString()
    );
    console.log("Gas Cost (Eth):", ethers.formatEther(totalGasCostWei));

    // 6️⃣ Send Transaction
    const tx = await wallet.sendTransaction({
      to: recipient,
      value: amountInWei,
      gasLimit: bufferedGasLimit,
      maxFeePerGas: feeData.maxFeePerGas!,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
    });





    ///remove the tx.wait and replace with something that doesn'y hold server execution time
    await tx.wait();

    return { success: true, message: "ETH sent successfully", Txhash: tx.hash };

  } catch (error: any) {
    console.error("Transaction error:", error);
    return { success: false, message: error.message };
  }
}

export async function sendEth(
  amount: string,
  recipient: string,
  email: string
) {
  try {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Invalid amount provided.");
    }

    if (!recipient) {
      throw new Error("Recipient address is required.");
    }

    // Convert amount to wei (BigInt)
    const amountInWei = ethers.parseEther(amount);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, message: "Failed to get user info" };
    }

    const wallets = await prisma.wallets.findUnique({
      where: { userId: user.id },
      select: { address: true, private_key: true },
    });

    if (!wallets?.private_key || !wallets?.address) {
      return { success: false, message: "Wallet not found" };
    }

    // Setup provider
    const provider = new ethers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
    );

    const wallet = new ethers.Wallet(wallets.private_key, provider);

    // 1️⃣ Estimate Gas
    const gasLimit = await provider.estimateGas({
      from: wallets.address,
      to: recipient,
      value: amountInWei,
    });

    // Add 20% safety buffer
    const bufferedGasLimit = (gasLimit * 12n) / 10n;

    // 2️⃣ Get Gas Price
    const feeData = await provider.getFeeData();
      if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
      throw new Error("Failed to fetch EIP-1559 fee data");
    }


    // 3️⃣ Calculate Total Gas Cost
    const totalGasCostWei = bufferedGasLimit * feeData.maxFeePerGas;

    // 4️⃣ Get Sender Balance
    const senderBalanceWei = await provider.getBalance(wallets.address);

    // 5️⃣ Check if sender has enough for amount + gas
    if (senderBalanceWei < amountInWei + totalGasCostWei) {
      return {
        success: false,
        message: "Insufficient ETH for amount + gas fees",
      };
    }

    console.log("Gas Limit:", bufferedGasLimit.toString());
    console.log("max fee per gas:", feeData.maxFeePerGas.toString());
    console.log(
      "Max Priority Fee Per Gas:",
      feeData.maxPriorityFeePerGas.toString()
    );
    console.log("Gas Cost (Eth):", ethers.formatEther(totalGasCostWei));

    // 6️⃣ Send Transaction
    const tx = await wallet.sendTransaction({
      to: recipient,
      value: amountInWei,
      gasLimit: bufferedGasLimit,
      maxFeePerGas: feeData.maxFeePerGas!,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
    });


    console.log("Transaction Hash:", tx.hash);

    await tx.wait();

    return { success: true, message: "ETH sent successfully" };

  } catch (error: any) {
    console.error("Transaction error:", error);
    return { success: false, message: error.message };
  }
}

export async function sendtest(
  amount: string,
  recipient: string,
  email: string
) {
  try {
    if (!amount || Number(amount) <= 0) {
      throw new Error("Invalid amount provided.");
    }

    if (!recipient) {
      throw new Error("Recipient address is required.");
    }

    // Convert amount to wei (BigInt)
    const amountInWei = ethers.parseEther(amount);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return { success: false, message: "Failed to get user info" };
    }

    const wallets = await prisma.wallets.findUnique({
      where: { userId: user.id },
      select: { address: true, private_key: true },
    });

    if (!wallets?.private_key || !wallets?.address) {
      return { success: false, message: "Wallet not found" };
    }

    // Setup provider
    const provider = new ethers.JsonRpcProvider(
      `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
    );

    const wallet = new ethers.Wallet(wallets.private_key, provider);

    // 1️⃣ Estimate Gas
    const gasLimit = await provider.estimateGas({
      from: wallets.address,
      to: recipient,
      value: amountInWei,
    });

    // Add 20% safety buffer
    const bufferedGasLimit = (gasLimit * 12n) / 10n;

    // 2️⃣ Get Gas Price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) {
      throw new Error("Failed to fetch gas price");
    }

    // 3️⃣ Calculate Total Gas Cost
    const totalGasCostWei = bufferedGasLimit * gasPrice;

    // 4️⃣ Get Sender Balance
    const senderBalanceWei = await provider.getBalance(wallets.address);

    // 5️⃣ Check if sender has enough for amount + gas
    if (senderBalanceWei < amountInWei + totalGasCostWei) {
      return {
        success: false,
        message: "Insufficient BNB for amount + gas fees",
      };
    }

    console.log("Gas Limit:", bufferedGasLimit.toString());
    console.log("Gas Price:", gasPrice.toString());
    console.log("Gas Cost (BNB):", ethers.formatEther(totalGasCostWei));

    // 6️⃣ Send Transaction
    const tx = await wallet.sendTransaction({
      to: recipient,
      value: amountInWei,
      gasLimit: bufferedGasLimit,
      gasPrice: gasPrice,
    });

    console.log("Transaction Hash:", tx.hash);

    await tx.wait();

    return { success: true, message: "BNB sent successfully" };

  } catch (error: any) {
    console.error("Transaction error:", error);
    return { success: false, message: error.message };
  }
}

export async function estimateGas(
  senderwallet: string,
  recipient: string,
  amount: string
) {
  try {
    
  const provider = new ethers.JsonRpcProvider(
    `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
  );

    const usdtContractAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT on BSC
    // 2. Instantiate USDT Contract
    const usdtContract = new ethers.Contract(
      usdtcontractaddress,
      abi,
      provider
    );
    // Estimate gas limit directly using the contract instance or provider
    const estimatedGasLimit = await usdtContract.transfer.estimateGas(
      senderwallet,
      ethers.parseUnits(amount, 6),
      { from: senderwallet } // Important for accurate estimation
    );
    // Create Interface for ERC20 transfer
    // const erc20Interface = new ethers.Interface([
    //   "function transfer(address to, uint256 amount)",
    // ]);

    // Encode the transfer data
    // const encodedData = erc20Interface.encodeFunctionData("transfer", [
    //   senderwallet,
    //   ethers.parseUnits(amount, 6), // USDT has 6 decimals
    // ]);

    // Send fetch request to estimate gas
    // const response = await fetch(
    //   `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       jsonrpc: "2.0",
    //       method: "eth_estimateGas",
    //       params: [
    //         {
    //           from: senderwallet,
    //           to: usdtContractAddress,
    //           data: encodedData,
    //         },
    //       ],
    //       id: 1,
    //     }),
    //   }
    // );

    const getGasPrice = await fetch(
      `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_gasPrice",
          params: [],
          id: 1,
        }),
      }
    );

  
    const gasPriceresult = await getGasPrice.json();
    if (gasPriceresult.error) {
      console.error("Gas estimation error:");
      return null;
    }

    // Fetch current gas price (in wei)
    const gasPrice = gasPriceresult.result; // Returns a bigint
    //parseInt()

    console.log("this is the estimated gas limit", estimatedGasLimit);
    console.log("this is the estimated gas price", gasPrice);

    // Calculate total gas cost in wei
    const totalGasWei = estimatedGasLimit * BigInt(gasPrice);
    console.log("this is the totalgaswei", totalGasWei)

    // Convert to BNB (divide by 1e18 to go from wei to BNB)
    const totalGasBNB = ethers.formatEther(totalGasWei);
    console.log(totalGasBNB)

    //the gasPrice is in hexdecimal, the totalGasWei is in bigint, 

    return { success: true, message: totalGasBNB, gasPrice, totalGasWei };
  } catch (err) {
    console.error("Error estimating gas:", err);
    return null;
  }
}

export async function sendusdttrade(
  amount: string,
  recipientid: string,
  id: string
) {
  if (!amount || Number(amount) === 0) {
    throw new Error("Invalid amount provided.");
  }

  if (!recipientid) {
    throw new Error("Recipient address is required.");
  }

  const wallets = await prisma.wallets.findUnique({
    where: { userId: id },
    select: { address: true, encrypted_key: true, private_key: true },
  });
  const walletss = await prisma.wallets.findUnique({
    where: { userId: recipientid },
    select: { address: true },
  });

  // Connect to the Ethereum Sepolia network
  if (!walletss) {
    //return{success: true, message: "unable to get wallet info"};
    return { success: false, message: walletss };
  }
  const recipient = walletss.address;

  try {
    // 1. Setup Provider and Wallet
    const provider = new ethers.JsonRpcProvider(
      `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
    );
    const wallet = new ethers.Wallet(wallets?.private_key as string, provider);

    // Get the sender's address (for logging/checking)
    const senderAddress = wallet.address;
    console.log(`Transfer initiated by ${senderAddress}`);

// 2. Get USDT decimals to format the amount correctly
    const fee = Number(amount) * 0.02;
    const decimalNumber = fee * 2;
    const roundedNumber = decimalNumber.toFixed(6);
    // // 3. Instantiate USDT Contract
     const usdtContract = new ethers.Contract(usdtcontractaddress, abi, wallet);

    const amountfee =  Number(amount) - 2;
    // // Optional: Check sender's balance before sending
    // console.log("checking usdt balance before sending usdt")
    // const senderUSDTBalance = await usdtContract.balanceOf(senderAddress);
    // if (senderUSDTBalance <= amountInWei) {
    //   return {
    //     success: false,
    //     message: `Insufficient USDT balance for ${senderAddress}. Has ${ethers.formatUnits(senderUSDTBalance, 6)} USDT, needs ${amount} USDT.`,
    //   };
    // }
    

    // // Optional: Check sender's BNB balance for gas fees
    // console.log("checking sender for gas fee")
    // const senderBNBBalance = await getBnbBalance(senderAddress);
    // // You might want to estimate gas for the transaction more precisely here.
    // // For a simple transfer, a rough estimate is okay, but it's crucial for users to have enough BNB.
    // const estimatedGasLimit = ethers.formatEther("60000"); // A common estimate for token transfer
    // console.log(estimatedGasLimit)
    // console.log(ethers.formatEther("180000000000000"));
    // console.log(ethers.formatEther("63807675000000"))
    // const gasPrice = await estimateGas(senderAddress, recipient, amount);
    // const gasPriceForFee = await estimateGas(
    //   senderAddress,
    //   adminWallet,
    //   feetostring
    // );
    // const gaspriceconvert = ethers.formatUnits(gasPrice?.totalGasWei ?? 0);
    // const gasPriceConvertForFee = ethers.formatUnits(gasPriceForFee?.totalGasWei ?? 0);
    // const requiredBNBForFee = Number(gasPriceConvertForFee);
    // const requiredBNB = Number(gaspriceconvert);
    // const requiredBNBBalance = requiredBNB + requiredBNBForFee;
    // if (Number(senderBNBBalance.message) < requiredBNBBalance) {
    //   return {
    //     success: false,
    //     message: `Insufficient BNB for gas fees in wallet ${senderAddress}. Needs approx. ${requiredBNB} BNB.`,
    //   };
    // }
    const decimalNumberBigInt = ethers.parseUnits(roundedNumber.toString());

    // 4. Send the Transaction
    console.log(
      `Attempting to transfer ${amount} USDT from ${senderAddress} to ${recipient}`
    );
    const gaslimit = 60000;
    const tx = await usdtContract.transfer(
      recipient,
      ethers.parseUnits(amountfee.toString()),
       {
         gasLimit: gaslimit, // Explicitly set gas limit or let ethers estimate
       }
    );
    console.log(
      `Attempting to transfer fee ${roundedNumber} USDT from ${senderAddress} to ${adminWallet}`
    );
    const currentNonce = await provider.getTransactionCount(wallet.address, 'latest');
    const feetx = await usdtContract.transfer(
      adminWallet,
      decimalNumberBigInt,
       {
         nonce: currentNonce + 1,
         gasLimit: gaslimit,
       }
    );

    return { transactionhash: tx.hash, feetransactionhash: feetx.hash };

    // 5. Wait for Transaction Confirmation (important for reliability)
    // const receipt = await tx.wait(); // Waits for 1 block confirmation by default
    // const feereceipt = await feetx.wait(); // Waits for 1 block confirmation by default

    // if (receipt.status === 1) {
    //     // Here you would update your database for the P2P order status
    //     return {
    //         success: true,
    //         message: 'USDT transfer successful',
    //         transactionHash: tx.hash,
    //     };
    // } else {
    //     return {
    //         success: false,
    //         message: 'USDT transfer failed on blockchain',
    //         transactionHash: tx.hash,
    //     };
    // }
  } catch (error: any) {
    console.log("Error during USDT transfer:", error);
    let errorMessage = "An unexpected error occurred during the transfer.";

    // Try to get more specific error messages from the blockchain or Ethers.js
    if (error.reason) {
      errorMessage = `Blockchain Error: ${error.reason}`;
    } else if (
      error.message &&
      error.message.includes("insufficient funds for gas")
    ) {
      errorMessage = "Insufficient BNB for gas fees in the sender's wallet.";
    } else if (error.code === "CALL_EXCEPTION") {
      errorMessage =
        "Smart contract call failed. Check recipient address and amount.";
    }
  }
}

// export async function sendusdttradefee(amount: string, id: string) {
//   if (!amount || Number(amount) === 0) {
//     throw new Error("Invalid amount provided.");
//   }

//   const wallets = await prisma.wallets.findUnique({
//     where: { userId: id },
//     select: { address: true, encrypted_key: true, private_key: true },
//   });

//   try {
//     // 1. Setup Provider and Wallet
//     const provider = new ethers.JsonRpcProvider(
//       `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
//     );
//     const wallet = new ethers.Wallet(wallets?.private_key as string, provider);

//     // Get the sender's address (for logging/checking)
//     const senderAddress = wallet.address;
//     console.log(`Transfer initiated by ${senderAddress}`);

//     // 2. Instantiate USDT Contract
//     const usdtContract = new ethers.Contract(usdtcontractaddress, abi, wallet);

//     // 3. Get USDT decimals to format the amount correctly
//     const fee = Number(amount);
//     const decimalNumber = fee;
//     const roundedNumber = decimalNumber.toFixed(6);
//     const feetostring = roundedNumber.toString();
//     const decimalNumberBigInt = ethers.parseUnits(roundedNumber.toString());

//     // Optional: Check sender's BNB balance for gas fees
//     const senderBNBBalance = await getBnbBalance(senderAddress);
//     // You might want to estimate gas for the transaction more precisely here.
//     // For a simple transfer, a rough estimate is okay, but it's crucial for users to have enough BNB.
//     const estimatedGasLimit = ethers.formatEther("60000"); // A common estimate for token transfer
//     const gasPriceForFee = await estimateGas(
//       senderAddress,
//       adminWallet,
//       feetostring
//     );

//     const gasPriceConvertForFee = parseInt(gasPriceForFee?.gasPrice, 16);
//     const requiredBNBForFee = gasPriceConvertForFee * Number(estimatedGasLimit);

//     if (Number(senderBNBBalance.message) < requiredBNBForFee) {
//       return {
//         success: false,
//         message: `Insufficient BNB for gas fees in wallet ${senderAddress}. Needs approx. ${requiredBNBForFee} BNB.`,
//       };
//     }

//     return { success: true, fee: feetx.hash };
//   } catch (error: any) {
//     let errorMessage = "An unexpected error occurred during the transfer.";

//     // Try to get more specific error messages from the blockchain or Ethers.js
//     if (error.reason) {
//       errorMessage = `Blockchain Error: ${error.reason}`;
//     } else if (
//       error.message &&
//       error.message.includes("insufficient funds for gas")
//     ) {
//       errorMessage = "Insufficient BNB for gas fees in the sender's wallet.";
//     } else if (error.code === "CALL_EXCEPTION") {
//       errorMessage =
//         "Smart contract call failed. Check recipient address and amount.";
//     }
//   }
// }

// export async function checkTransactionByHash(
//   txHash: string,
//   expectedSender: string,
//   expectedRecipient: string,
//   expectedAmount: string,
//   minConfirmations: number = 6 // Common standard for reasonable finality
// ) {
//   try {
//     const provider = new ethers.JsonRpcProvider(
//       `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
//     );
//     const atokContract: ethers.Contract = new ethers.Contract(
//       atokcontractaddress,
//       atokabi,
//       provider
//     );

//     if (!ethers.isHexString(txHash, 32)) {
//       return { success: false, message: "Invalid transaction hash format." };
//     }

//     console.log(`Checking transaction hash: ${txHash}`);

//     // Get transaction receipt
//     const receipt = await provider.getTransactionReceipt(txHash);

//     if (!receipt) {
//       return {
//         success: false,
//         message: "Transaction not found or not yet mined.",
//       };
//     }

//     if (receipt.status === 0) {
//       return {
//         success: false,
//         message: "Transaction failed on-chain (status 0).",
//       };
//     }

//     // Get current block number to calculate confirmations
//     const currentBlock = await provider.getBlockNumber();
//     const confirmations = currentBlock - receipt.blockNumber + 1;

//     if (confirmations < minConfirmations) {
//       return {
//         success: false,
//         message: `Transaction found, but only has ${confirmations} confirmations (needs ${minConfirmations}).`,
//       };
//     }

//     // Dynamically get decimals from the contract
//     const decimals = 18;
//     const expectedAmountWei = ethers.parseUnits(expectedAmount, decimals);

//     // Filter for the specific Transfer event in the transaction logs
//     let foundTransfer = false;
//     for (const log of receipt.logs) {
//       // Check if the log is from our USDT contract
//       if (
//         ethers.getAddress(log.address) ===
//         ethers.getAddress(atokcontractaddress)
//       ) {
//         try {
//           // Decode the log using the ERC20 ABI
//           const parsedLog = atokContract.interface.parseLog(log);

//           if (parsedLog && parsedLog.name === "Transfer") {
//             const from = parsedLog.args.from;
//             const to = parsedLog.args.to;
//             const value = parsedLog.args.value;

//             // Compare addresses (case-insensitive) and value
//             if (
//               (console.log("this is the from address", from),
//               console.log("this is the to address", to),
//               console.log("this is the value", value),
//               ethers.getAddress(from) === ethers.getAddress(expectedSender) &&
//                 ethers.getAddress(to) ===
//                   ethers.getAddress(expectedRecipient) &&
//                 value.eq(expectedAmountWei)) // BigNumber comparison
//             ) {
//               foundTransfer = true;
//               break; // Found the matching transfer event
//             }
//           }
//         } catch (decodeError: any) {
//           // This log might not be an ERC20 Transfer event, ignore it
//           console.warn(`Could not parse log: ${decodeError.message}`);
//         }
//       }
//     }

//     if (foundTransfer) {
//       return {
//         success: true,
//         message: "USDT transfer confirmed successfully!",
//         transactionHash: txHash,
//         blockNumber: receipt.blockNumber,
//         confirmations: confirmations,
//         sender: expectedSender,
//         recipient: expectedRecipient,
//         amount: expectedAmount,
//       };
//     } else {
//       return {
//         success: false,
//         message:
//           "Transaction found, but no matching USDT transfer event was detected. " +
//           ethers.getAddress(expectedSender) +
//           "reciepieint:" +
//           ethers.getAddress(expectedRecipient) +
//           " and amount: " +
//           expectedAmount,
//       };
//     }
//   } catch (error: any) {
//     console.error("Error checking transaction by hash:", error);
//     return { success: false, message: `An error occurred: ${error.message}` };
//   }
// }

export async function checktranStatus(
  hash: string,
  type: string,
  orderid: string
) {
  try {
    if (!ethers.isHexString(hash, 32)) {
      return { success: false, message: "Invalid transaction hash format." };
    }
    if (type === "fee") {
      await prisma.tradeprocess.update({
        where: { orderid },
        data: { checkusdtfeesent: "checking" },
      });
    } else {
      await prisma.tradeprocess.update({
        where: { orderid },
        data: { checkusdtsent: "checking" },
      });
    }
    console.log(`Checking transaction hash: ${hash}`);
    const check = await fetch(`https://api.bscscan.com/api
   ?module=transaction
   &action=gettxreceiptstatus
   &txhash=${hash}
   &apikey=${process.env.BSC_API_KEY}`);

    if (!check) {
      return {
        success: false,
        message: "Transaction not found or not yet mined.",
      };
    }

    if (check.status === 0) {
      if (type === "fee") {
        await prisma.tradeprocess.update({
          where: { orderid },
          data: { sendfeeusdt: "failed", checkusdtfeesent: "completed" },
        });
      } else {
        await prisma.tradeprocess.update({
          where: { orderid },
          data: { sendusdt: "failed", checkusdtfeesent: "completed" },
        });
      }
      return {
        success: false,
        message: "Transaction failed on-chain (status 0).",
      };
    }

    if (type === "fee") {
      await prisma.tradeprocess.update({
        where: { orderid },
        data: { sendfeeusdt: "sent", checkusdtfeesent: "completed" },
      });
      await completetrans(orderid);
    } else {
      await prisma.tradeprocess.update({
        where: { orderid },
        data: { sendusdt: "sent", checkusdtsent: "completed" },
      });
    }

    return {
      success: true,
      message: "USDT transfer confirmed successfully!",
    };
  } catch (error: any) {
    console.error("Error checking transaction by hash:", error);
    return { success: false, message: `An error occurred: ${error.message}` };
  }
}
