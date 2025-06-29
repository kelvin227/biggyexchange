'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { updatewallet } from "@/functions/user";
import React, { useState } from "react";
import { toast } from "sonner";

export default function OTC_handler({email} :{email: string}){
  const [walletAddresses, setWalletAddresses] = useState<Record<string, string>>({});

  const handleWalletChange = (coin: string, address: string) => {
    setWalletAddresses((prev) => ({
      ...prev,
      [coin]: address,
    }));
  };

  const handleSaveWallet = async (coin: string) => {
    const address = walletAddresses[coin];
    let coins;
    if (address) {
      if(coin === "Atok Wallet address"){
       coins = "atok";
      }else if(coin === "WOW Wallet address"){
        coins = "wow";
      }else if(coin === "Sidra wallet address"){
        coins = "sda";
      }else if(coin === "Ruby Wallet address"){
        coins = "rbl";
      } else if(coin === "Opincur Wallet address"){
        coins = "opincur";
      }else if(coin === "Star Network Wallet address"){
        coins = "star";
      } else if(coin === "Socio Wallet address"){
        coins = "socio";
      }
      const submitWallet = await updatewallet(email, address, coins as string)
      if(!submitWallet?.success){
      toast.error(submitWallet?.message);
      }
      else{
        toast.success("address updated successfully")
      }
      alert(`Wallet address for ${coin} saved: ${address}`);
    } else {
      alert(`Please enter a wallet address for ${coin}`);
    }
  };

  const coins = [
    {
      name: "Atok Wallet address",
      image: "https://atok.ai/_next/image?url=%2Fatok-token%2Ftoken.png&w=1920&q=100",
    },
    {
      name: "WOW Wallet address",
      image: "https://school.codegator.com.ng/image/ajavyk7p.png",
    },
    {
      name: "Sidra wallet address",
      image: "https://play-lh.googleusercontent.com/NLwEmyxzTKqtR2bvRSugma35UBn-6x-zRNNwHykjV9wVDS3ACezJg-al6A-4W2oWnw",
    },
    {
      name: "Ruby Wallet address",
      image: "https://play-lh.googleusercontent.com/OVJjGaAQNzEBJXeqi8RLvDHKHb-be2bbF95iKsrhltNDSOAYXO-qJKJexTV-OT9h-A=w480-h960-rw",
    },
    {
      name: "Opincur Wallet address",
      image: "https://opincur.com/img/logo.png",
    },
    {
      name: "Star Network Wallet address",
      image: "https://miro.medium.com/v2/resize:fit:394/1*dC5IusZmsnRzCxEVdN5Z_A.jpeg",
    },
    {
      name: "Socio Wallet address",
      image: "https://kalajtomdzamxvkl.public.blob.vercel-storage.com/logo2-6X2L1QaE3Zc3GrRsCHvW0JY0kcA7bx.png",
    }
  ];

  return (
    <div>
      {coins.map((coin) => (
        <div key={coin.name} className="pb-4">
            <Card>
              <div className="flex flex-box w-full p-2">
                <CardContent>
                  <div>
                    <Avatar>
                      <AvatarImage src={coin.image} alt={coin.name} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>

                <div>
                  <CardContent>{coin.name}</CardContent>
                </div>
              </div>
            </Card>

          {/* Wallet Address Input */}
          <div className="mt-4">
            <input
              type="text"
              placeholder={`Enter wallet address for ${coin.name}`}
              value={walletAddresses[coin.name] || ""}
              onChange={(e) => handleWalletChange(coin.name, e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
            <button
              onClick={() => handleSaveWallet(coin.name)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Save Wallet Address
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};