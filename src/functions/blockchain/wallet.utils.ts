"use server";
import { prisma } from "@/lib/db";
import { ethers, formatUnits } from "ethers";
import { completetrans } from "../user";
/* eslint-disable */

const adminWallet = "0xd8c8223d43F6AD2af6D5c6399C6Fc63aF42253B6";
const usdtcontractaddress = "0x55d398326f99059ff775485246999027b3197955";
const atokcontractaddress = "0x900650C66c8D317DF5CaCc2Ea0D2F39549bA8632";
const provider = new ethers.JsonRpcProvider(
  `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
);
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

const atokabi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "AccessControlBadConfirmation", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "bytes32", name: "neededRole", type: "bytes32" },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "allowance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "balance", type: "uint256" },
      { internalType: "uint256", name: "needed", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "approver", type: "address" }],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "receiver", type: "address" }],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "sender", type: "address" }],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "spender", type: "address" }],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  { inputs: [], name: "EnforcedPause", type: "error" },
  { inputs: [], name: "ExpectedPause", type: "error" },
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
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
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
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MODERATOR_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PAUSER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "blackListWallet",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_tokenAddress", type: "address" },
    ],
    name: "clearUnknownToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
    name: "getRoleAdmin",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "hasRole",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "callerConfirmation", type: "address" },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "_address", type: "address[]" },
      { internalType: "bool", name: "result", type: "bool" },
    ],
    name: "setBlackListWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

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
  const usdt = "0x55d398326f99059ff775485246999027b3197955";
  const usdtresponse = await fetch(
    `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokenbalance&contractaddress=${usdt}&address=${address}&tag=latest&apikey=${process.env.ETHER_API_KEY}`
  );
  const data = await usdtresponse.json();
  const balance = ethers.formatEther(data.result); // Assuming the API returns the balance in the 'result' field

  return { success: true, message: balance };
  //return {success: true, message: balance};
}
export async function getBnbBalance(address: string) {
  //(address: string) {
  const usdtresponse = await fetch(
    `https://api.etherscan.io/v2/api?chainid=56&module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHER_API_KEY}`
  );
  const data = await usdtresponse.json();
  const balance = ethers.formatEther(data.result); // Assuming the API returns the balance in the 'result' field

  return { success: true, message: balance };
  //return {success: true, message: balance};
}
export async function getPrice() {
  const urls = {
    usdt: `https://api.coingecko.com/api/v3/simple/price?ids=binance-bridged-usdt-bnb-smart-chain&vs_currencies=usd`,
    eth: `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`,
    btc: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`,
    sol: `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`,
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
    const [usdtRes, ethRes, btcRes, solRes, tonRes, piRes] = await Promise.all([
      fetch(urls.usdt, options),
      fetch(urls.eth, options),
      fetch(urls.btc, options),
      fetch(urls.sol, options),
      fetch(urls.ton, options),
      fetch(urls.pi, options),
    ]);

    if (
      !usdtRes.ok ||
      !ethRes.ok ||
      !btcRes.ok ||
      !solRes.ok ||
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
      tonData,
      piData,
    ] = await Promise.all([
      usdtRes.json(),
      ethRes.json(),
      btcRes.json(),
      solRes.json(),
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
      `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&contractaddress=0x55d398326f99059ff775485246999027b3197955&address=${address}&page=0&offset=5&startblock=0&endblock=999999999&sort=desc&apikey=${process.env.ETHER_API_KEY}`
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

export async function sendtest(
  amount: string,
  recipient: string,
  email: string
) {
  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid amount provided.");
  }

  if (!recipient) {
    throw new Error("Recipient address is required.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  console.log("user from sendtest", user);
  if (!user) {
    return { success: false, message: "failed to get user info" };
  }
  const wallets = await prisma.wallets.findUnique({
    where: { userId: user.id },
    select: { address: true, encrypted_key: true, private_key: true },
  });

  const provider = new ethers.JsonRpcProvider(
    `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
  );
  // const decrypt_private_key = await ethers.Wallet.fromEncryptedJson(privateK.private_key, password);
  const wallet = new ethers.Wallet(wallets?.private_key as string, provider);

  //if (!decrypt_private_key) {
  //    throw new Error("Invalid password or wallet not found");
  //}

  // Optional: Check sender's BNB balance for gas fees
  const senderBNBBalance = await getBnbBalance(wallets?.address as string);
  // You might want to estimate gas for the transaction more precisely here.
  // For a simple transfer, a rough estimate is okay, but it's crucial for users to have enough BNB.
  const estimatedGasLimit = ethers.formatEther("60000"); // A common estimate for token transfer
  const gasPrice = await estimateGas(
    wallets?.address as string,
    recipient,
    amount
  );
  const gaspriceconvert = parseInt(gasPrice?.gasPrice, 16);
  const requiredBNB = gaspriceconvert * Number(estimatedGasLimit);
  if (Number(senderBNBBalance.message) < Number(requiredBNB)) {
    return {
      success: false,
      message: `Insufficient BNB for gas fees in wallet ${wallets?.address}. Needs approx. ${requiredBNB} BNB.`,
    };
  }

  // 4. Send the Transaction
  console.log(
    `Attempting to transfer ${amount} USDT from ${wallets?.address} to ${recipient}`
  );
  if (wallet) {
    const tx = await wallet.sendTransaction({
      to: recipient,
      value: ethers.parseEther(amount),
      gasLimit: ethers.parseEther(estimatedGasLimit),
    });
    console.log("error sending a getting user detials", wallet);
    console.log("Transaction Hash:", tx.hash);
    console.log(tx);
    await tx.wait(); // Wait for the transaction to be mined
    return { success: true, message: "BNB sent successfully" };
  }
  return { success: false, message: wallet };

  //const data = await wallet; // Assuming the API returns the balance in the 'result' field
  //return ethers.formatEther(balance);
}

export async function estimateGas(
  senderwallet: string,
  recipient: string,
  amount: string
) {
  try {
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

export async function checkTransactionByHash(
  txHash: string,
  expectedSender: string,
  expectedRecipient: string,
  expectedAmount: string,
  minConfirmations: number = 6 // Common standard for reasonable finality
) {
  try {
    const provider = new ethers.JsonRpcProvider(
      `https://bsc-mainnet.infura.io/v3/${process.env.INFRUA_API_KEY}`
    );
    const atokContract: ethers.Contract = new ethers.Contract(
      atokcontractaddress,
      atokabi,
      provider
    );

    if (!ethers.isHexString(txHash, 32)) {
      return { success: false, message: "Invalid transaction hash format." };
    }

    console.log(`Checking transaction hash: ${txHash}`);

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        success: false,
        message: "Transaction not found or not yet mined.",
      };
    }

    if (receipt.status === 0) {
      return {
        success: false,
        message: "Transaction failed on-chain (status 0).",
      };
    }

    // Get current block number to calculate confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;

    if (confirmations < minConfirmations) {
      return {
        success: false,
        message: `Transaction found, but only has ${confirmations} confirmations (needs ${minConfirmations}).`,
      };
    }

    // Dynamically get decimals from the contract
    const decimals = 18;
    const expectedAmountWei = ethers.parseUnits(expectedAmount, decimals);

    // Filter for the specific Transfer event in the transaction logs
    let foundTransfer = false;
    for (const log of receipt.logs) {
      // Check if the log is from our USDT contract
      if (
        ethers.getAddress(log.address) ===
        ethers.getAddress(atokcontractaddress)
      ) {
        try {
          // Decode the log using the ERC20 ABI
          const parsedLog = atokContract.interface.parseLog(log);

          if (parsedLog && parsedLog.name === "Transfer") {
            const from = parsedLog.args.from;
            const to = parsedLog.args.to;
            const value = parsedLog.args.value;

            // Compare addresses (case-insensitive) and value
            if (
              (console.log("this is the from address", from),
              console.log("this is the to address", to),
              console.log("this is the value", value),
              ethers.getAddress(from) === ethers.getAddress(expectedSender) &&
                ethers.getAddress(to) ===
                  ethers.getAddress(expectedRecipient) &&
                value.eq(expectedAmountWei)) // BigNumber comparison
            ) {
              foundTransfer = true;
              break; // Found the matching transfer event
            }
          }
        } catch (decodeError: any) {
          // This log might not be an ERC20 Transfer event, ignore it
          console.warn(`Could not parse log: ${decodeError.message}`);
        }
      }
    }

    if (foundTransfer) {
      return {
        success: true,
        message: "USDT transfer confirmed successfully!",
        transactionHash: txHash,
        blockNumber: receipt.blockNumber,
        confirmations: confirmations,
        sender: expectedSender,
        recipient: expectedRecipient,
        amount: expectedAmount,
      };
    } else {
      return {
        success: false,
        message:
          "Transaction found, but no matching USDT transfer event was detected. " +
          ethers.getAddress(expectedSender) +
          "reciepieint:" +
          ethers.getAddress(expectedRecipient) +
          " and amount: " +
          expectedAmount,
      };
    }
  } catch (error: any) {
    console.error("Error checking transaction by hash:", error);
    return { success: false, message: `An error occurred: ${error.message}` };
  }
}

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
