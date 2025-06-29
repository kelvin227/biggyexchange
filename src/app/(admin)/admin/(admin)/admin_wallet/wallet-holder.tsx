"use client";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getBalance, getBnbBalance, getBnbPrice, sendtest } from '@/functions/blockchain/wallet.utils';
import { getPrice } from '../../../../../functions/blockchain/wallet.utils';

export default function Wallet({email, address} : {email: string, address: string}) {
  const [balances, setBalance] = useState<string | null>(null); // State to store the balance
  const [price, setPrice] = useState<string |null>("");
  const [gasBal, setGasBal] = useState<string | null>("");
  const [gasPrice, setGasPrice] = useState<string | null>("")
  const [showTransfer, setshowTransfer] = useState(false); // State to control the visibility of the transfer dialog
  const walletAddress = address; // Replace with actual wallet address

  const [bnbshow, SetBnbShow] = useState(false);
  const [show, setshow] = useState(false); // State to control the visibility of the deposit dialog
  const [recipientAddress, setRecipientAddress] = useState(""); // State for recipient address
  const [transferAmount, setTransferAmount] = useState(""); // State for transfer amount
  const [loading, setLoading] = useState(false); // State for transfer loading

  // Function to handle the transfer
  const handleTransfer = async () => {
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      toast("Invalid recipient address");
      return;
    }

    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
      toast("Invalid transfer amount");
      return;
    }

    try {
      setLoading(true);

      const provider = await sendtest(transferAmount, recipientAddress, email);

      // Send the transaction
      console.log(provider)
      
    } catch (error) {
      console.error("Error during transfer:", error);
      toast("Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Call the fetchBalance function when the component mounts
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceData = await getBalance(address);
        const priceData = await getPrice();
        const gasBalData = await getBnbBalance(address);
        const gasPriceData = await getBnbPrice();
        if (balanceData.success) {
          setBalance(balanceData.message);
          const cal = Number(priceData.message) * Number(balanceData.message)
          setPrice(`$${cal.toString()}`);
        } else {
          setBalance("Error fetching balance");
        }
        if(gasBalData.success){
          setGasBal(gasBalData.message);
          const cal = Number(gasPriceData.message) * Number(gasBalData.message)
          setGasPrice(`$${cal.toString()}`) 
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("Error fetching balance");
      }
    };

    fetchBalance();
  }, [address]);

  return (
    <div>
    <Card>
      <CardContent className={show || showTransfer ? "hidden" : "flex flex-col gap-4"}>
        <div className="flex flex-box gap-4 w-full justify-center items-center">
          USDT
        </div>

        <div className="flex flex-box">
          <div className="flex flex-col w-full gap-4">
            <div className="flex flex-row justify-between items-center">
              <div className="text-sm font-medium light:text-gray-700">Total Balance</div>
              <div className="text-lg font-bold light:text-gray-900">{balances}</div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="text-sm font-medium light:text-gray-700">Available Balance</div>
              <div className="text-lg font-bold light:text-gray-900">{price}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-cols-4 mt-2 w-full gap-4">
          {/* Deposit Dialog */}
          <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>

                      <Button
            variant="outline"
            className=""
            onClick={() => setshow(!show)}
          >
            <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                  Deposit
                </div>
                
            </div>
          </Button>
          </div>


            

          {/* Transfer Section */}
          <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
            <Button
          variant="outline"
          className=''
          onClick ={() => setshowTransfer(!showTransfer)}
          >
          <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
            <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
              Transfer
            </div>
          </div>
          </Button>
          </div>
          
          
        </div>
      </CardContent>
      
<CardContent className={!show ? "flex flex-col gap-4 hidden": "flex flex-col gap-4"}>
<div className="flex flex-col gap-4">
<h2 className="text-lg font-bold text-center">Deposit USDT</h2>
<p className="text-sm light:text-gray-700 text-center">
  Network: <span className="font-medium">BSC(BEP20)</span>
</p>
<div className="flex flex-col items-center gap-2">
  <p className="text-sm font-medium light:text-gray-700">Wallet Address:</p>
  <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
    <span className="text-sm light:text-gray-900 truncate">{walletAddress}</span>
    <Button
      variant="outline"
      size="sm"
      className="ml-auto"
      onClick={() => {
        navigator.clipboard.writeText(walletAddress);
        toast.success("Wallet address copied to clipboard!");
      }}
    >
      Copy
    </Button>
  </div>
</div>
<p className="text-xs light:text-gray-500 text-center">
  Please ensure you are sending USDT on the Binance Smart Chain(BEP20) Network. Sending funds on the wrong network may result in loss of funds.
</p>
</div>
</CardContent>

<CardContent className={showTransfer ? "flex flex-col gap-4" : "hidden"}>
<div className="flex flex-col gap-4">
<h2 className="text-lg font-bold text-center">Transfer USDT</h2>
<p className="text-sm light:text-gray-700 text-center">
  Network: <span className="font-medium">BSC(BEP20)</span>
</p>
<div className="flex flex-col items-center gap-2">
  <p className="text-sm font-medium light:text-gray-700">Recipient Address:</p>
  <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
    <input
      type="text"
      placeholder="Enter recipient address"
      value={recipientAddress} // Bind the input value to the state
      onChange={(e) => setRecipientAddress(e.target.value)} // Update state on input change
      className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
    />
    <Button
      variant="outline"
      size="sm"
      className="ml-auto"
      onClick={async () => {
        try {
          const clipboardText = await navigator.clipboard.readText(); // Read text from clipboard
          setRecipientAddress(clipboardText); // Update the input field with the pasted content
          toast.success("Recipient address pasted from clipboard!");
        } catch (error) {
          console.error("Failed to read clipboard content:", error);
          toast.error("Failed to paste content from clipboard.");
        }
      }}
    >
      Paste
    </Button>
  </div>
</div>
<div className="flex flex-col items-center gap-2">
  <p className="text-sm font-medium light:text-gray-700">Amount:</p>
  <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
    <input
      type="text"
      placeholder="Enter amount to transfer"
      value={transferAmount} // Bind the input value to the state
      onChange={(e) => setTransferAmount(e.target.value)} // Update state on input change
      className="flex-grow border outline-none text-sm light:text-gray-900"
    />
  </div>
  </div>
  <div className="flex flex-col items-center gap-2">
    <Button
      variant="outline"
      className="w-full"
      onClick={handleTransfer}
      disabled={loading} // Disable button while loading
    >
      {loading ? "Processing..." : "Transfer"}
    </Button>
  </div>
  <p className="text-xs light:text-gray-500 text-center">
    Please ensure you are sending USDT on the Binance Smart Chain(BEP20) Network. Sending funds on the wrong network may result in loss of funds.
  </p>
</div>
</CardContent>
    </Card>

      <Card className='mt-5 mb-5'>
      <CardContent className={bnbshow || showTransfer ? "hidden" : "flex flex-col gap-4"}>
        <div className="flex flex-box gap-4 w-full justify-center items-center">
          Gas Tank(BNB)
        </div>

        <div className="flex flex-box">
          <div className="flex flex-col w-full gap-4">
            <div className="flex flex-row justify-between items-center">
              <div className="text-sm font-medium light:text-gray-700">Total Balance(BNB)</div>
              <div className="text-lg font-bold light:text-gray-900">{gasBal}</div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="text-sm font-medium light:text-gray-700">Available Balance</div>
              <div className="text-lg font-bold light:text-gray-900">{gasPrice}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-cols-4 mt-2 w-full gap-4">
          {/* Deposit Dialog */}
          <div className={bnbshow ? "hidden" : "flex flex-col gap-4 w-full"}>

                      <Button
            variant="outline"
            className=""
            onClick={() => SetBnbShow(!bnbshow)}
          >
            <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                  Deposit
                </div>
                
            </div>
          </Button>
          </div>


            

          {/* Transfer Section
          <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
            <Button
          variant="outline"
          className=''
          onClick ={() => setshowTransfer(!showTransfer)}
          >
          <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
            <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
              Transfer
            </div>
          </div>
          </Button>
          </div> */}
          
          
        </div>
      </CardContent>
      
<CardContent className={!bnbshow ? "flex flex-col gap-4 hidden": "flex flex-col gap-4"}>
<div className="flex flex-col gap-4">
<h2 className="text-lg font-bold text-center">Deposit BNB</h2>
<p className="text-sm light:text-gray-700 text-center">
  Network: <span className="font-medium">BSC(BEP20)</span>
</p>
<div className="flex flex-col items-center gap-2">
  <p className="text-sm font-medium light:text-gray-700">Wallet Address:</p>
  <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
    <span className="text-sm light:text-gray-900 truncate">{walletAddress}</span>
    <Button
      variant="outline"
      size="sm"
      className="ml-auto"
      onClick={() => {
        navigator.clipboard.writeText(walletAddress);
        toast.success("Wallet address copied to clipboard!");
      }}
    >
      Copy
    </Button>
  </div>
</div>
<p className="text-xs light:text-gray-500 text-center">
  Please ensure you are sending BNB on the Binance Smart Chain Network. Sending funds on the wrong network may result in loss of funds.
</p>
</div>
</CardContent>

{/* <CardContent className={showTransfer ? "flex flex-col gap-4" : "hidden"}>
<div className="flex flex-col gap-4">
<h2 className="text-lg font-bold text-center">Transfer USDT</h2>
<p className="text-sm light:text-gray-700 text-center">
  Network: <span className="font-medium">BSC(BEP20)</span>
</p>
<div className="flex flex-col items-center gap-2">
  <p className="text-sm font-medium light:text-gray-700">Recipient Address:</p>
  <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
    <input
      type="text"
      placeholder="Enter recipient address"
      value={recipientAddress} // Bind the input value to the state
      onChange={(e) => setRecipientAddress(e.target.value)} // Update state on input change
      className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
    />
    <Button
      variant="outline"
      size="sm"
      className="ml-auto"
      onClick={async () => {
        try {
          const clipboardText = await navigator.clipboard.readText(); // Read text from clipboard
          setRecipientAddress(clipboardText); // Update the input field with the pasted content
          toast.success("Recipient address pasted from clipboard!");
        } catch (error) {
          console.error("Failed to read clipboard content:", error);
          toast.error("Failed to paste content from clipboard.");
        }
      }}
    >
      Paste
    </Button>
  </div>
</div>
<div className="flex flex-col items-center gap-2">
  <p className="text-sm font-medium light:text-gray-700">Amount:</p>
  <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
    <input
      type="text"
      placeholder="Enter amount to transfer"
      value={transferAmount} // Bind the input value to the state
      onChange={(e) => setTransferAmount(e.target.value)} // Update state on input change
      className="flex-grow border outline-none text-sm light:text-gray-900"
    />
  </div>
  </div>
  <div className="flex flex-col items-center gap-2">
    <Button
      variant="outline"
      className="w-full"
      onClick={handleTransfer}
      disabled={loading} // Disable button while loading
    >
      {loading ? "Processing..." : "Transfer"}
    </Button>
  </div>
  <p className="text-xs light:text-gray-500 text-center">
    Please ensure you are sending USDT on the Binance Smart Chain(BEP20) Network. Sending funds on the wrong network may result in loss of funds.
  </p>
</div>
</CardContent> */}
    </Card>

</div>
  );
}