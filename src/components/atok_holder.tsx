"use client";
/* eslint-disable */
import { Skeleton } from "@/components/ui/skeleton"; // Make sure you have a Skeleton component
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft, Clock } from "lucide-react";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { addtraderequest, createads, deletead } from "@/functions/user";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PutBlobResult } from "@vercel/blob";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { checkbalance } from "@/functions/blockchain/wallet.utils";

// Translation object
const translations = {
  En: {
    advertisement: "Advertisement",
    buy: "Buy",
    sell: "Sell",
    createAds: "Create Ads",
    createAdvertisement: "Create Advertisement",
    proof: "Proof",
    price: "Price",
    minQty: "Minimum Quantity",
    maxQty: "Maximum Quantity",
    type: "Type",
    paymentMethod: "Payment Method",
    submit: "Submit",
    myAds: "My Ads",
    officialWeb: "Official Web",
    activeTrades: "Active trades",
    adsList: "Ads List",
    username: "Username",
    availableLimits: "Available|limits",
    noAdsFound: "No ads found",
    delete: "Delete",
    usdtToSend: "USDT to send:",
    usdtToReceive: "USDT to receive:",
    afterFeeSend: "What you wil send after addition of processing fees",
    afterFeeReceive: "What you will receive after deduction of processing fee:",
    waitingForConfirmation: "Waiting For Confirmation",
    tradePending: "Trade Pending",
    thankYou: "Thank you,",
    chooseToBuy: "for choose to buy from me. Your trade request has been sent to the buyer.",
    pleaseWait: "please wait while the",
    seller: "Seller",
    buyer: "Buyer",
    isContacted: "is being contacted if the buyer does not response in the next 5 hours your request will be automatically be canceled",
    startTrading: "Start Trading",
    lastTradedPrice: "Last Traded Price:",
    fee: "2% fee",
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
    submitSuccess: "Ads created successfully!",
    submitFail: "Failed to create ad.",
    tradeSuccess: "Trade created successfully!",
    tradeFail: "Failed to create trade request.",
    adDeleteSuccess: "ad deleted successfully",
    adDeleteFail: "unable to delete ad",
  },
  Chi: {
    advertisement: "廣告",
    buy: "買入",
    sell: "賣出",
    createAds: "創建廣告",
    createAdvertisement: "創建廣告",
    proof: "證明",
    price: "價格",
    minQty: "最小數量",
    maxQty: "最大數量",
    type: "類型",
    paymentMethod: "支付方式",
    submit: "提交",
    myAds: "我的廣告",
    officialWeb: "官方網站",
    activeTrades: "進行中的交易",
    adsList: "廣告列表",
    username: "用戶名",
    availableLimits: "可用/限額",
    noAdsFound: "暫無廣告",
    delete: "刪除",
    usdtToSend: "需發送 USDT：",
    usdtToReceive: "將收到 USDT：",
    afterFeeSend: "加上手續費後需發送金額",
    afterFeeReceive: "扣除手續費後將收到金額：",
    waitingForConfirmation: "等待確認",
    tradePending: "交易待處理",
    thankYou: "感謝，",
    chooseToBuy: "選擇向我購買。您的交易請求已發送給買家。",
    pleaseWait: "請稍候，",
    seller: "賣家",
    buyer: "買家",
    isContacted: "正在聯繫，如買家 5 小時內未響應，請求將自動取消。",
    startTrading: "開始交易",
    lastTradedPrice: "最新成交價：",
    fee: "2% 手續費",
    page: "頁",
    of: "共",
    previous: "上一頁",
    next: "下一頁",
    submitSuccess: "廣告創建成功！",
    submitFail: "創建廣告失敗。",
    tradeSuccess: "交易創建成功！",
    tradeFail: "創建交易請求失敗。",
    adDeleteSuccess: "廣告刪除成功",
    adDeleteFail: "無法刪除廣告",
  }
};

export default function AtokHolder({
  email,
  name,
  data,
  userads,
  atokPrice,
  wowPrice,
  sidraPrice,
  rubyPrice,
  opincurPrice,
  starPrice,
  socioPrice,
}: {
  email: string;
  name: string;
  data: any[];
  userads: any[];
  atokPrice: string;
  wowPrice: string;
  sidraPrice: string;
  rubyPrice: string;
  opincurPrice: string;
  starPrice: string;
  socioPrice: string;
}) {
  const [Lang, setLang] = useState('En');
  const t = translations[Lang as "En" | "Chi"];
  const [myad, setmyads] = useState(false);
  const [showads, setshowads] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string | null>("buy");
  const [showdialog, setshowdialog] = useState(false);
  const [showModal, setshowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgproof, setimgproof] = useState<PutBlobResult | null>(null);
  const idCardFrontRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  let filteredData = data.filter((item) => item.type === selectedType);
  let filteredcoin = filteredData.filter((item) => item.coin === selectedCoin);
  if (myad) {
    filteredData = userads.filter((item) => item.type === selectedType);
    filteredcoin = filteredData.filter((item) => item.coin === selectedCoin);
  }
  const totalPages = Math.ceil(filteredcoin.length / itemsPerPage);
  const paginatedAds = filteredcoin.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [btn, setBtn] = useState(false);
  const [formData, setFormData] = useState({
    proof: "",
    price: "",
    minQty: 0,
    maxQty: 0,
    payment: "",
    amount: 0,
    toreceive: 0,
    toreceiveprocessing: 0,
    adId: "",
    pricee: "",
    merchantusername: "",
    type: "buy",
  });

  const handlesell = () => {
    setSelectedType("sell");
    setBtn(true);
  };
  const handlebuy = () => {
    setBtn(false);
    setSelectedType("buy");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "minQty" || name === "maxQty" ? Number(value) : value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "idCardFront" | "idCardBack"
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!idCardFrontRef.current?.files) {
        throw new Error("no image selected");
      }
      const frontFile = idCardFrontRef.current.files[0];
      const frontResponse = await fetch(`/api/kyc?filename=${frontFile.name}`, {
        method: "POST",
        body: frontFile,
      });
      if (!frontResponse.ok) {
        throw new Error("Failed to upload image");
      }
      const newBlobFront = (await frontResponse.json()) as PutBlobResult;
      setimgproof(newBlobFront);

      const response = await createads(
        email,
        selectedCoin,
        formData.price,
        formData.minQty,
        formData.maxQty,
        imgproof?.url || "",
        formData.type
      );
      if (response.success) {
        toast(t.submitSuccess, {
          className: "bg-green-500 text-white",
        });
        setFormData({
          proof: "",
          price: "",
          minQty: 0,
          maxQty: 0,
          payment: "",
          amount: 0,
          toreceive: 0,
          toreceiveprocessing: 0,
          adId: "",
          pricee: "",
          merchantusername: "",
          type: "buy",
        });
      }
      toast(response.message, {
        className: "bg-red-500 text-white",
      });
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handlepurchase = async (e: any) => {
    e.preventDefault();
    let balance;
    try {
      if (selectedType === "sell") {
        const response = await addtraderequest(
          email,
          formData.merchantusername,
          formData.adId,
          formData.amount,
          Number(formData.pricee),
          selectedCoin,
          "sell"
        );
        if (response.success) {
          setshowModal(true);
          toast(t.tradeSuccess);
        } else {
          toast(response.message || t.tradeFail);
        }
      } else {
        const checkbalanc = await checkbalance(
          email,
          formData.amount.toString(),
          formData.pricee
        );
        if (!checkbalanc.success) {
          toast.error(checkbalanc.message);
        } else {
          const response = await addtraderequest(
            email,
            formData.merchantusername,
            formData.adId,
            formData.amount,
            Number(formData.pricee),
            selectedCoin,
            "buy"
          );
          if (response.success) {
            setshowModal(true);
            toast.success(t.tradeSuccess);
          } else {
            toast(response.message || t.tradeFail);
          }
        }
      }
    } catch (error) {
      console.error("Error creating trade:", error);
      toast("An unexpected error occurred.");
    }
  };

  const handleAdSelection = (ad: any) => {
    setFormData((prev) => ({
      ...prev,
      price: ad.price,
      minQty: ad.minQty,
      maxQty: ad.maxQty,
      payment: ad.payment,
      adId: ad.id,
      pricee: ad.price,
      status: "",
      merchantusername: ad.userName,
      amount: 0,
    }));
    setshowdialog(true);
  };

  const handledelete = async (ad: any) => {
    setFormData((prev) => ({
      ...prev,
      adId: ad.id,
    }));
    const del = await deletead(ad.id);
    if (!del.success) {
      toast.error(t.adDeleteFail);
    } else {
      toast.success(t.adDeleteSuccess);
      router.refresh();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = Number(e.target.value);
    const toReceive = amount * Number(formData.price);
    const toReceiveProcessing =
      selectedType === "sell"
        ? toReceive - toReceive * 0.02
        : toReceive + toReceive * 0.02;

    setFormData((prev) => ({
      ...prev,
      amount,
      toreceive: toReceive,
      toreceiveprocessing: toReceiveProcessing,
    }));
  };

  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('userLanguage');
      if (storedValue) {
        setLang(storedValue);
      }
    }
    // Simulate loading for demonstration, replace with your real data loading logic
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  

  if (loading) {
    // Skeleton Loader for coin cards
    return (
      <div className="p-6">
        {[1, 2, 3, 4, 5, 6, 7].map((_, idx) => (
          <div className="pb-4" key={idx}>
            <div className="flex flex-box w-full p-2 border rounded-lg shadow light:bg-white">
              <div className="mr-4">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex flex-col items-end justify-between ml-auto">
                <Skeleton className="h-6 w-24 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } 
 else {return !showads ? (
    <div>
      <div
        className="flex flex-box cursor-pointer"
        onClick={() => {
          setSelectedCoin(""),
            setshowads(true),
            setSelectedType("buy"),
            setshowdialog(false),
            setshowModal(false),
            setBtn(false),
            setmyads(false);
        }}
      >
        <ArrowBigLeft />
        {t.advertisement}
      </div>
      <DropdownMenuSeparator />
      <div className="grid grid-box sm:flex sm:flex-box lg:flex md:flex lg:flex-box md:flex-box lg:gap-4 md:gap-4 sm:gap-6 w-full">
        <div className="flex flex-row w-full pb-3 gap-3">
          <div className="w-full">
            <Button
              className={btn ? "w-full" : "w-full bg-green-500"}
              onClick={handlebuy}
            >
              {t.buy}
            </Button>
          </div>
          <div className="w-full">
            <Button
              className={btn ? "bg-red-500 w-full" : "w-full"}
              onClick={handlesell}
            >
              {t.sell}
            </Button>
          </div>
        </div>
        <div className="w-full pb-3">
          <Dialog>
            <DialogTrigger
              className="w-full bg-blue-500 p-1 rounded"
              disabled={myad ? true : false}
            >
              {t.createAds}
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{t.createAdvertisement}</DialogTitle>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.proof}
                  </label>
                  <input
                    id="idCardFront"
                    name="idCardFront"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "idCardFront")}
                    className="mt-1 block w-full"
                    ref={idCardFrontRef}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.price}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.minQty}
                  </label>
                  <input
                    type="number"
                    name="minQty"
                    value={formData.minQty}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.maxQty}
                  </label>
                  <input
                    type="number"
                    name="maxQty"
                    value={formData.maxQty}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-grey-700">
                    {t.type}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="buy">{t.buy}</option>
                    <option value="sell">{t.sell}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t.paymentMethod}
                  </label>
                  <select
                    name="payment"
                    value={formData.payment}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-blue-500">
                  {t.submit}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-box w-full gap-3 pb-3">
          <div className="w-full">
            <Button
              className="w-full"
              onClick={() => {
                setmyads(true);
              }}
            >
              {t.myAds}
            </Button>
          </div>
          <div className="w-full">
            <Button className="w-full">{t.officialWeb}</Button>
          </div>
        </div>
        <div className="w-full pb-3">
          <Button
            className="w-full"
            onClick={() => {
              router.replace("/otc/advertisement/trades");
            }}
          >
            {t.activeTrades}
          </Button>
        </div>
      </div>
      <div className="container mx-auto py-10">
        {/* Ads Table */}
        <div className={showdialog ? "hidden" : ""}>
          <h2 className="text-2xl font-bold mb-4">{t.adsList}</h2>
          <table className="min-w-full border border-gray-300 rounded-lg shadow-md hidden sm:table">
            <thead>
              <tr className="light:bg-gray-100">
                <th className="p-4 text-left">{t.username}</th>
                <th className="p-4 text-left">{t.price}</th>
                <th className="p-4 text-left">{t.availableLimits}</th>
                <th className="p-4 text-left" colSpan={2}>
                  {t.paymentMethod}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredcoin.length > 0 ? (
                paginatedAds.map((ad: any) => (
                  <tr key={ad.id} className="border-b">
                    <td className="p-4">{ad.userName}</td>
                    <td className="p-4">{ad.price} USDT</td>
                    <td className="p-4">
                      {ad.minQty}-{ad.maxQty} {ad.coin}
                    </td>
                    <td className="p-4">Wallet</td>
                    <td>
                      {myad ? (
                        <Button
                          className="bg-red-500 w-full"
                          onClick={() => handledelete(ad)}
                        >
                          {t.delete}
                        </Button>
                      ) : (
                        <Button
                          className={
                            selectedType === "buy"
                              ? "bg-blue-500 text-white"
                              : "bg-red-500 text-white"
                          }
                          disabled={name == ad.userName ? true : false}
                          onClick={() => {
                            handleAdSelection(ad);
                          }}
                        >
                          {selectedType === "buy" ? t.buy : t.sell}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    {t.noAdsFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {filteredcoin.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button
                className="px-4 py-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                {t.previous}
              </Button>
              <span>
                {t.page} {currentPage} {t.of} {totalPages}
              </span>
              <Button
                className="px-4 py-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                {t.next}
              </Button>
            </div>
          )}
        </div>
        {/* hiddem dialog */}
        <div className={showdialog && !showModal ? "" : "hidden"}>
          <form onSubmit={handlepurchase} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium light:text-gray-700">
                {selectedType === "buy" ? t.usdtToSend : t.usdtToReceive}
              </label>
              <input
                type="number"
                name="toreceive"
                value={formData.toreceive || 0}
                readOnly
                className="mt-1 block w-full light:border-gray-300 rounded-md shadow-sm light:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium light:text-gray-700">
                {selectedType === "buy"
                  ? t.afterFeeSend
                  : t.afterFeeReceive}
              </label>
              <input
                type="number"
                name="toreceiveprocessing"
                value={formData.toreceiveprocessing || 0}
                readOnly
                className="mt-1 block w-full light:border-gray-300 rounded-md shadow-sm light:bg-gray-100"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-500">
              {t.submit}
            </Button>
          </form>
        </div>
        {/* Mobile View */}
        <div className="block sm:hidden border p-4 rounded-lg shadow-md">
          <div className="gap-4">
            {filteredcoin.length > 0 ? (
              paginatedAds.map((ad: any) => (
                <div key={ad.id}>
                  <div className={showdialog ? "hidden" : ""}>
                    <div className="flex flex-cols-2 gap-4">
                      <div className="col-span-1">
                        <h3 className="text-lg font-bold">{ad.userName}</h3>
                        <p>{t.price}: {ad.price} USDT</p>
                        <p>
                          {t.availableLimits}: {ad.minQty}-{ad.maxQty} {ad.coin}
                        </p>
                        <p>{t.paymentMethod}: Wallet</p>
                      </div>
                      <div className="col-span-1">
                        {myad ? (
                          <Button
                            className="bg-red-500 w-full"
                            onClick={() => handledelete(ad)}
                          >
                            {t.delete}
                          </Button>
                        ) : (
                          <Button
                            className={
                              selectedType === "buy"
                                ? "bg-blue-500 text-white"
                                : "bg-red-500 text-white"
                            }
                            disabled={name == ad.userName ? true : false}
                            onClick={() => {
                              handleAdSelection(ad);
                            }}
                          >
                            {selectedType === "buy" ? t.buy : t.sell}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">{t.noAdsFound}</div>
            )}
            {/* Pagination Controls */}
            {filteredcoin.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <Button
                  className="px-4 py-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  {t.previous}
                </Button>
                <span>
                  {t.page} {currentPage} {t.of} {totalPages}
                </span>
                <Button
                  className="px-4 py-2"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  {t.next}
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Modal for Purchase Confirmation */}
        <div className={showModal ? "" : "hidden"}>
          {t.waitingForConfirmation}
          <div className="max-w-md mx-auto p-6 bg-yellow-50 border border-yellow-300 shadow-lg rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <Clock className="text-yellow-500 w-16 h-16" />
            </div>
            <h1 className="text-2xl font-bold text-yellow-700 mb-2">
              {t.tradePending}
            </h1>
            <p className="text-gray-700 mb-4">
              {t.thankYou} <span className="font-semibold">{name}</span>, {t.chooseToBuy}
            </p>
            <p className="text-gray-600">
              {t.pleaseWait}
              {selectedType === "buy" ? t.seller : t.buyer} {t.isContacted}
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    // ...existing coin selection cards (unchanged, can be translated similarly if needed)...
    <div>
     <div>

      {/* Atok */}
      <div
        className="pb-4"
        onClick={() => {
          setSelectedCoin("atok"), setshowads(false);
        }}
      >
        <Card>
          <div className="flex flex-box w-full p-2">
            <CardContent>
              <div>
                <Avatar>
                  <AvatarImage
                    src="https://atok.ai/_next/image?url=%2Fatok-token%2Ftoken.png&w=1920&q=100"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>

            <div>
              <CardContent>Atok/USDT</CardContent>
              <div className="lg:flex lg:flex-box">
                <CardContent>{t.lastTradedPrice}</CardContent>
                <CardContent>{atokPrice}USDT</CardContent>
              </div>
            </div>

            <div className="absolute right-0">
              <div className="grid grid-box">
                <CardContent>{t.startTrading}</CardContent>

                <CardContent>
                  <div className="flex flex-box">
                    {t.fee}
                    <TrendingUp />
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Wow */}

      <div
        className="pb-4"
        onClick={() => {
          setSelectedCoin("wow"), setshowads(false);
        }}
      >
        <Card>
          <div className="flex flex-box w-full p-2">
            <CardContent>
              <div>
                <Avatar>
                  <AvatarImage
                    src="https://school.codegator.com.ng/image/ajavyk7p.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>

            <div>
              <CardContent>WOW/USDT</CardContent>
              <div className="lg:flex lg:flex-box">
                <CardContent>{t.lastTradedPrice}</CardContent>
                <CardContent>{wowPrice} USDT</CardContent>
              </div>
            </div>

            <div className="absolute right-0">
              <div className="grid grid-box">
                <CardContent>{t.startTrading}</CardContent>

                <CardContent>
                  <div className="flex flex-box">
                  {t.fee}
                    <TrendingUp />
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidra */}

      <div
        className="pb-4"
        onClick={() => {
          setSelectedCoin("sidra"), setshowads(false);
        }}
      >
        <Card>
          <div className="flex flex-box w-full p-2">
            <CardContent>
              <div>
                <Avatar>
                  <AvatarImage
                    src="https://play-lh.googleusercontent.com/NLwEmyxzTKqtR2bvRSugma35UBn-6x-zRNNwHykjV9wVDS3ACezJg-al6A-4W2oWnw"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>

            <div className="">
              <CardContent>SDA/USDT</CardContent>
              <div className="lg:flex lg:flex-box">
                <CardContent>{t.lastTradedPrice}</CardContent>
                <CardContent>{sidraPrice} USDT</CardContent>
              </div>
            </div>

            <div className="absolute right-0">
              <div className="grid grid-box">
                <CardContent>{t.startTrading}</CardContent>

                <CardContent>
                  <div className="flex flex-box">
                    {t.fee}
                    <TrendingUp />
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Ruby */}
      <div
        className="pb-4"
        onClick={() => {
          setSelectedCoin("ruby"), setshowads(false);
        }}
      >
        <Card>
          <div className="flex flex-box w-full p-2">
            <CardContent>
              <div>
                <Avatar>
                  <AvatarImage
                    src="https://play-lh.googleusercontent.com/OVJjGaAQNzEBJXeqi8RLvDHKHb-be2bbF95iKsrhltNDSOAYXO-qJKJexTV-OT9h-A=w480-h960-rw"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>

            <div className="">
              <CardContent>RBL/USDT</CardContent>
              <div className="lg:flex lg:flex-box">
                <CardContent>{t.lastTradedPrice}</CardContent>
                <CardContent>{rubyPrice} USDT</CardContent>
              </div>
            </div>

            <div className="absolute right-0">
              <div className="grid grid-box">
                <CardContent>{t.startTrading}</CardContent>

                <CardContent>
                  <div className="flex flex-box">
                    {t.fee}
                    <TrendingUp />
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Opincur */}
      <div
        className="pb-4"
        onClick={() => {
          setSelectedCoin("Opincur"), setshowads(false);
        }}
      >
        <Card>
          <div className="flex flex-box w-full p-2">
            <CardContent>
              <div>
                <Avatar>
                  <AvatarImage
                    src="https://opincur.com/img/logo.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>

            <div className="">
              <CardContent>Opincur/USDT</CardContent>
              <div className="lg:flex lg:flex-box">
                <CardContent>{t.lastTradedPrice}</CardContent>
                <CardContent>{opincurPrice} USDT</CardContent>
              </div>
            </div>

            <div className="absolute right-0">
              <div className="grid grid-box">
                <CardContent>{t.startTrading}</CardContent>

                <CardContent>
                  <div className="flex flex-box">
                    {t.fee}
                    <TrendingUp />
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Star Network */}
      <div
        className="pb-4"
        onClick={() => {
          setSelectedCoin("star"), setshowads(false);
        }}
      >
        <Card>
          <div className="flex flex-box w-full p-2">
            <CardContent>
              <div>
                <Avatar>
                  <AvatarImage
                    src="https://miro.medium.com/v2/resize:fit:394/1*dC5IusZmsnRzCxEVdN5Z_A.jpeg"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>

            <div className="">
              <CardContent>Star Network/USDT</CardContent>
              <div className="lg:flex lg:flex-box">
                <CardContent>{t.lastTradedPrice}</CardContent>
                <CardContent>{starPrice} USDT</CardContent>
              </div>
            </div>

            <div className="absolute right-0">
              <div className="grid grid-box">
                <CardContent>{t.startTrading}</CardContent>

                <CardContent>
                  <div className="flex flex-box">
                  {t.fee}
                    <TrendingUp />
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* socio coin */}
      <div
        className="pb-4"
        onClick={() => {
          setSelectedCoin("socio"), setshowads(false);
        }}
      >
        <Card>
          <div className="flex flex-box w-full p-2">
            <CardContent>
              <div>
                <Avatar>
                  <AvatarImage
                    src="https://kalajtomdzamxvkl.public.blob.vercel-storage.com/logo2-6X2L1QaE3Zc3GrRsCHvW0JY0kcA7bx.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>

            <div className="">
              <CardContent>Socio/USDT</CardContent>
              <div className="lg:flex lg:flex-box">
                <CardContent>{t.lastTradedPrice}</CardContent>
                <CardContent>{socioPrice}USDT</CardContent>
              </div>
            </div>

            <div className="absolute right-0">
              <div className="grid grid-box">
                <CardContent>{t.startTrading}</CardContent>

                <CardContent>
                  <div className="flex flex-box">
                    {t.fee}
                    <TrendingUp />
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </div>
  );}
}