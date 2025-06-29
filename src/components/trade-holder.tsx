"use client";
/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptTrade, Canceltrade, completetrans, confirmbuyer, confirmseen, createdispute } from "@/functions/user";
import { BadgeCheck, BadgeX, Clock, Loader2 } from "lucide-react";
import { checkTransactionByHash, checktranStatus } from "@/functions/blockchain/wallet.utils";
import { PutBlobResult } from "@vercel/blob";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

// Translation object
const translations = {
  En: {
    pendingTrades: "Pending Trades",
    loading: "Loading pending trades...",
    noPending: "No pending trades found.",
    tradeId: "Trade ID",
    amount: "Amount",
    price: "Price",
    status: "Status",
    action: "Action",
    view: "View",
    acceptAndView: "Accept and View",
    cancel: "Cancel",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    disputeRequest: "Dispute Request",
    disputeDesc: "Please provide the transaction hash for the coin you transferred",
    transactionHash: "Transaction Hash",
    senderWallet: "Sender's Wallet Address",
    receiverWallet: "Receiver's Wallet Address",
    amountSent: "Amount Sent",
    submit: "Submit",
    disputeSuccess: "Dispute created successfully, Please wait for admin to review your dispute",
    disputeError: "An error occurred while creating your dispute please try again",
    transactionCompleted: "Transaction completed",
    transactionCancelled: "Transaction Cancelled",
    contactMerchant: "If you have any questions, feel free to reach out to the merchant.",
    thankYou: "Thank you for using our trading platform!",
    contactSupport: "For any issues, please contact support.",
    viewAsset: "View Asset",
    back: "Back",
    sendCoin: "Send {coin} to user wallet Address",
    sendCoinDesc: "To complete the trade, please send the agreed amount of {coin} to the user's wallet address. Once the payment is confirmed, the trade will be finalized.",
    userWallet: "User Wallet Address",
    amountToSend: "Amount to send",
    transactionID: "Transaction ID",
    orderTime: "Order Time",
    doubleCheckWallet: "Please ensure to double-check the wallet address before sending.",
    reachUser: "If you have any questions, feel free to reach out to the user.",
    waitingBuyer: "waiting for buyer to confirm the coin",
    iHaveSent: "I have Sent The Coin",
    waitingMerchant: "Waiting for merchant to accept trade",
    orderDispute: "Order dispute",
    completed: "completed",
    willBeSent: "{coin} will be sent to your wallet address",
    confirmDeposit: "To complete the trade, please confirm that agreed amount of {coin} has been sent to your wallet. Once the Deposit is confirmed, the trade will be finalized.",
    amountSentLabel: "Amount sent",
    doubleCheckAmount: "Please ensure to double-check the amount before releasing your USDT.",
    iHaveSeen: "I have seen coin",
    processing: "Processing...",
    sending: "Sending...",
    acceptSuccess: "Trade accepted successfully.",
    acceptFail: "Failed to accept trade.",
    cancelSuccess: "Trade cancelled successfully.",
    cancelFail: "Failed to Cancel trade.",
  },
  Chi: {
    pendingTrades: "待處理交易",
    loading: "正在加載待處理交易...",
    noPending: "未找到待處理交易。",
    tradeId: "交易編號",
    amount: "金額",
    price: "價格",
    status: "狀態",
    action: "操作",
    view: "查看",
    acceptAndView: "接受並查看",
    cancel: "取消",
    previous: "上一頁",
    next: "下一頁",
    page: "頁",
    of: "共",
    disputeRequest: "爭議申請",
    disputeDesc: "請提供您轉賬的交易哈希",
    transactionHash: "交易哈希",
    senderWallet: "發送方錢包地址",
    receiverWallet: "接收方錢包地址",
    amountSent: "發送金額",
    submit: "提交",
    disputeSuccess: "爭議已成功創建，請等待管理員審核",
    disputeError: "創建爭議時發生錯誤，請重試",
    transactionCompleted: "交易已完成",
    transactionCancelled: "Transaction Cancelled",
    contactMerchant: "如有疑問，請聯繫商家。",
    thankYou: "感謝您使用我們的交易平台！",
    contactSupport: "如有問題，請聯繫客服。",
    viewAsset: "查看資產",
    back: "返回",
    sendCoin: "將{coin}發送到用戶錢包地址",
    sendCoinDesc: "為完成交易，請將約定數量的{coin}發送到用戶錢包地址。確認付款後，交易將完成。",
    userWallet: "用戶錢包地址",
    amountToSend: "發送金額",
    transactionID: "交易編號",
    orderTime: "下單時間",
    doubleCheckWallet: "請在發送前仔細核對錢包地址。",
    reachUser: "如有疑問，請聯繫用戶。",
    waitingBuyer: "等待買家確認收幣",
    iHaveSent: "我已發送幣",
    waitingMerchant: "等待商家接受交易",
    orderDispute: "訂單爭議",
    completed: "已完成",
    willBeSent: "{coin}將發送到您的錢包地址",
    confirmDeposit: "為完成交易，請確認約定數量的{coin}已發送到您的錢包。確認存款後，交易將完成。",
    amountSentLabel: "已發送金額",
    doubleCheckAmount: "請在釋放USDT前仔細核對金額。",
    iHaveSeen: "我已收到幣",
    processing: "處理中...",
    sending: "發送中...",
    acceptSuccess: "交易接受成功。",
    acceptFail: "接受交易失敗。",
    cancelSuccess: "交易取消成功。",
    cancelFail: "取消交易失敗。",
  }
};

export default function PendingTrades({ email, id, trades, tradeinfo, adstrans }: { email: string, id: string, trades: any[], tradeinfo: any, adstrans: any[] }) {
 const [Lang, setLang] = useState('En');
  const t = translations[Lang as "En" | "Chi"];
  const [coin, setCoin] = useState<string>("");
  const [Price, setPrice] = useState<string>("");
  const [Amount, setAmount] = useState<string>("");
  const [userid, setuserId] = useState<string>("");
  const [show, setShow] = useState(false);
  const [ShowDisputeModal, setShowDisputeModal] = useState<boolean>(false);
  const [disputeReason, setDisputeReason] = useState<string>(""); // transaction hash
  const [senderwalletaddress, setSenderWalletAddress] = useState<string>("");
  const [recieverwalletaddress, setReceiverWalletAddress] = useState<string>("");
  const [AmountSent, setAmountSent] = useState<string>("");
  const [adsid, setadsid] = useState<string>("");
  const [tradeid, settradeid] = useState<string>("");
  const [status, setstatus] = useState<string>("");
  const [transStatus, setTransStatus] = useState<string>("");
  const [merchantid, setmerchantid] = useState<string>("");
  const [Wallet, setWallet] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [customerconfirm, setcustomerconfirm] = useState<string>("");
  const [merchantconfirm, setMerchantconfirm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [url, seturl] = useState<string>("null");
  const [viewLoading, setViewLoading] = useState<boolean>(false); // For loading spinner on view
  const [seenLoading, setSeenLoading] = useState(false); // <-- Add this state
  const [sendLoading, setSendLoading] = useState(false); // <-- Add this state
  const imgreceipt = useRef<HTMLInputElement>(null);
  const merchantconfirmRef = useRef(merchantconfirm);
  const customerconfirmRef = useRef(customerconfirm);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();

  const pendingtrades = tradeinfo || [];//Array.isArray(trades) ? trades : [];
  const tradeInfo = tradeinfo || [];
  const adstransactions = adstrans || [];
  
  const totalPages = Math.ceil(pendingtrades.length / itemsPerPage);
  const paginatedTrades = pendingtrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  let filteredData: any[] = [];
  let adstransfiltered:any[]= [];

const feepollTx = async (txHash: string) => {
  const intervalId = setInterval(async () => {
    // Call your API to check if the transaction has been confirmed
    const res = await checktranStatus(txHash, "fee", tradeid);
    toast("Paying trade fee please don't leave this page")


    if (res.success) {
      setTransStatus("completed")
      toast.success("Trade fee successfully paid");
      clearInterval(intervalId); // Stop polling once confirmed
    }else{
      toast.error("There was an error while sending fee to admin")
      clearInterval(intervalId)
    }
  }, 5000); // Poll every 5 seconds (adjust as needed)
};

  const pollTx = async (txHash: string) => {
  const intervalId = setInterval(async () => {
    // Call your API to check if the transaction has been confirmed
    const res = await checktranStatus(txHash, "normal", tradeid);

    if (res.success) {
      toast.success("usdt successfully sent to the seller")
      clearInterval(intervalId); // Stop polling once confirmed
    }else{
      toast.error("there was an error on the blockchain while sending usdt")
      clearInterval(intervalId)
    }
  }, 5000); // Poll every 5 seconds (adjust as needed)
};


  const accept = async (tradeId: string) => {
    try {
      const response = await acceptTrade(tradeId);
      if (response.success) {
        toast.success(t.acceptSuccess);
        router.refresh();
      } else {
        toast.success(response.message || t.acceptFail);
      }
    } catch (error) {
      console.error("Error accepting trade:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handlesent = async (tradeId: string) => {
    try {
      setSendLoading(true); // Start loading
      if (!imgreceipt.current?.files) {
        throw new Error("no image selected");
      }
      const details = imgreceipt.current.files[0];
      const detailsresponse = await fetch(`/api/kyc?filename=${details.name}`, {
        method: "POST",
        body: details,
      });
      if (!detailsresponse.ok) {
        throw new Error("Failed to upload image");
      }
      const receiptdetails = (await detailsresponse.json()) as PutBlobResult;

      if (!receiptdetails.url) {
        throw new Error("Receipt is null. Please upload a valid receipt.");
      }
      const response = await confirmbuyer(tradeId, receiptdetails.url, email, Amount, coin);
      if (response?.success) {
      router.refresh()
        toast.success("successfully updated merchant status plaese wait for the user to check");
        setMerchantconfirm("sent")
      } else {
        toast.error("An unexpected error occured");
      }
    } catch (error: any) {
      toast("Error message", error);
    } finally {
      setSendLoading(false); // Stop loading
    }
  };

  const handlerecieved = async (tradeId: string) => {
    try {
      setSeenLoading(true); // Start loading
      const response = await confirmseen(adsid, tradeId, Amount, Price, selectedType, userid, merchantid);
      if (response?.success) {
        // Start polling
      await pollTx(response.transactionhash);
      await feepollTx(response.feehash)
      
      } else {
        toast.error("an unexpected error occured");
      }
    } catch (error: any) {
      toast.error(error);
    } finally {
      setSeenLoading(false); // Stop loading
    }
  };

  // Add loading spinner for viewing trade details
  const handleView = async (type: string, Id: string, stat: string, amount: string, userid: string, coin: string, merchantID: string, Date: Date, wallet: string) => {
    setViewLoading(true);
    setShow(true);
    setSelectedType(type);
    settradeid(Id);
    setstatus(stat);
    setAmount(amount);
    setuserId(userid);
    setCoin(coin);
    setmerchantid(merchantID);
    setDate(Date);
    setWallet(wallet)
    filteredData = tradeInfo.filter((item: any) => item.id === Id)
    adstransfiltered = adstransactions.filter(item => item.orderid === Id)
    try{
      const trans = adstransactions.filter((item) => item.orderId === Id);
    if (trans) {
      trans.map((item: any
      )=> (
      setTransStatus(item.status as string),
      setcustomerconfirm(item.customerconfirm as string),
      setMerchantconfirm(item.merchantconfirm as string),
      setPrice(item.price as string),
      seturl(item.receipt || ""),
      setDate(item.createdAt),
      setadsid(item.id)
      ))
    }else{
      toast.error("Trade information not found.");
    }}catch (error) {
      console.error("Error fetching trade info:", error);
      toast.error("An unexpected error occurred while fetching trade info.");
    }finally{
      setViewLoading(false);
    }
   // setViewLoading(false);
  };
  const BackView = async() => {
    setShow(false);
    setSelectedType("");
    settradeid("");
    setstatus("");
    setAmount("");
    setuserId("");
    setCoin("");
  }

  const handledispute = () => {
    setShowDisputeModal(true);
    //await createdispute(id, email, tradeid, reason);
  };

  const handleDisputeSubmit = async () => {
    if (!tradeid) return;

    if(coin === "atok"){
      try {
      const response = await checkTransactionByHash(disputeReason, senderwalletaddress, recieverwalletaddress, AmountSent);
      if(response?.success){
      
      setDisputeReason("");
      toast.success(response.message);
      }else{
        toast.error(response?.message || "Failed to submit dispute request.");
      }
      
    } catch (error) {
      console.error("Error submitting rejection reason:", error);
    }}else{

      const dispute = await createdispute(id, email, tradeid, disputeReason);

      if(dispute?.success){
        toast.success(t.disputeSuccess)
      }else{
        toast.error(t.disputeError)
      }

    }
  };

  useEffect(() => {
     if (typeof window !== 'undefined') {
      // Get data from local storage
      const storedValue = localStorage.getItem('userLanguage');
      if (storedValue) {
        setLang(storedValue);
      }
        }
    merchantconfirmRef.current = merchantconfirm;
    customerconfirmRef.current = customerconfirm;
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [merchantconfirm, customerconfirm]);

  // Function to cancel a trade
  const cancelTrade = async (tradeId: string) => {
    try {
      const response = await Canceltrade(tradeId);
      if (response.success) {
        toast.success(t.cancelSuccess);
        router.refresh();
      } else {
        toast.error(response.message || t.cancelFail);
      }
    } catch (error) {
      console.error("Error cancelling trade:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">{t.pendingTrades}</h1>
      {/* Rejection Modal */}
      {ShowDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="dark:bg-gray-500 light:bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t.disputeRequest}</h2>
            <p className="mb-4">
              {t.disputeDesc}<br />
              {t.tradeId}: <strong>{tradeid}</strong>.
            </p>
            <p className="mb-2">{t.transactionHash}</p>
            <Input
              type="text"
              placeholder={t.transactionHash}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full mb-4 dark:bg-gray-200 dark:text-black"
            />
            <p className="mb-2">{t.senderWallet}</p>
            <Input
              type="text"
              placeholder={t.senderWallet}
              value={senderwalletaddress}
              onChange={(e) => setSenderWalletAddress(e.target.value)}
              className="w-full mb-4 dark:bg-gray-200 dark:text-black"
            />
            <p className="mb-2">{t.receiverWallet}</p>
            <Input
              type="text"
              placeholder={t.receiverWallet}
              value={recieverwalletaddress}
              onChange={(e) => setReceiverWalletAddress(e.target.value)}
              className="w-full mb-4 dark:bg-gray-200 dark:text-black"
            />
            <p className="mb-2 dark:text-white">{t.amountSent}</p>
            <Input
              type="text"
              placeholder={t.amountSent}
              value={AmountSent}
              onChange={(e) => setAmountSent(e.target.value)}
              className="w-full mb-4 dark:bg-gray-200 dark:text-black"
            />
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  setShowDisputeModal(false);
                  setDisputeReason("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleDisputeSubmit}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                disabled={!disputeReason.trim() || !senderwalletaddress.trim() || !recieverwalletaddress.trim() || !AmountSent.trim()}
              >
                {t.submit}
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">{t.loading}</p>
      ) : paginatedTrades.length > 0 ? (
        <>
          {/* Desktop Table */}
          <table className={`min-w-full lightbg-white border border-gray-300 rounded-lg shadow-md ${show ? "hidden" : "hidden sm:table"}`}>
            <thead>
              <tr className="light:bg-gray-100">
                <th className="p-4 text-left">{t.tradeId}</th>
                <th className="p-4 text-left">{t.amount}</th>
                <th className="p-4 text-left">{t.price}</th>
                <th className="p-4 text-left">{t.status}</th>
                <th className="p-4 text-left" colSpan={2}>{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade: any) => (
                <tr key={trade.id} className="border-b">
                  <td className="p-4">{trade.id}</td>
                  <td className="p-4">{trade.amount}</td>
                  <td className="p-4">{trade.price}</td>
                  <td className={trade.status === "pending" ? "p-4 text-yellow-500" : "p-4"}>{trade.status}</td>
                  <td className="p-4">
                    {id === trade.userId ? (
                      <Button
                        className="bg-blue-500 text-white"
                        onClick={() => handleView(trade.type, trade.id, trade.status, trade.amount, trade.userId, trade.coin, trade.merchantId, trade.createdAt, trade.walletAddress)}
                        disabled={viewLoading}
                      >
                        {viewLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin w-4 h-4" />
                            {t.loading}
                          </span>
                        ) : (
                          t.view
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="bg-blue-500 text-white"
                        onClick={() => {
                          if (trade.status === "Accepted" || trade.status === "Cancelled") {
                            handleView(trade.type, trade.id, trade.status, trade.amount, trade.userId, trade.coin, trade.merchantId, trade.createdAt, trade.walletAddress);
                          } else {
                            accept(trade.id);
                            settradeid(trade.id);
                          }
                        }}
                        disabled={viewLoading}
                      >
                        {viewLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin w-4 h-4" />
                            {t.loading}
                          </span>
                        ) : (
                          trade.status === "Accepted"|| trade.status === "Cancelled" ? t.view : t.acceptAndView
                        )}
                      </Button>
                    )}
                  </td>
                  <td className="p-4">
                    <Button
                      className={trade.status === "Cancelled" || trade.status === "Accepted" ? "hidden" :"bg-red-500 text-white"}
                      onClick={() => cancelTrade(trade.id)}
                    >
                      {t.cancel}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {pendingtrades.length > itemsPerPage && (
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

          {/* Mobile View */}
          <div className={`sm:hidden ${show ? "hidden" : ""}`}>
            {paginatedTrades.map((trade: any) => (
              <div key={trade.id} className="border-b border-gray-300 p-4 light:bg-white rounded-lg light:shadow-md mb-4">
                <p><strong>{t.tradeId}:</strong> {trade.id}</p>
                <p><strong>{t.amount}:</strong> {trade.amount}</p>
                <p><strong>{t.price}:</strong> {trade.price}</p>
                <p>
                  <strong>{t.status}:</strong>{" "}
                  <span className={trade.status === "pending" ? "text-yellow-500" : ""}>
                    {trade.status}
                  </span>
                </p>
                <div className="flex justify-between mt-4">
                  {id === trade.userId ? (
                    <Button
                      className="light:bg-blue-500 dark:text-white"
                      onClick={() => handleView(trade.type, trade.id, trade.status, trade.amount, trade.userId, trade.coin, trade.merchantId, trade.createdAt, trade.walletAddress)}
                      disabled={viewLoading}
                    >
                      {viewLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin w-4 h-4" />
                          {t.loading}
                        </span>
                      ) : (
                        t.view
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="light:bg-blue-500"
                      onClick={() => {
                        if (trade.status === "Accepted" || trade.status ===  "Cancelled") {
                          handleView(trade.type, trade.id, trade.status, trade.amount, trade.userId, trade.coin, trade.merchantId, trade.createdAt, trade.walletAddress);
                        } else {
                          accept(trade.id);
                        }
                      }}
                      disabled={viewLoading}
                    >
                      {viewLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin w-4 h-4" />
                          {t.loading}
                        </span>
                      ) : (
                        trade.status === "Cancelled" || trade.status === "Accepted"? t.view : t.acceptAndView
                      )}
                    </Button>
                  )}
                  <Button
                    className={trade.status === "Cancelled" || trade.status ===  "Accepted" ? "hidden" :"bg-red-500 text-white"}
                    onClick={() => cancelTrade(trade.id)}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Trade Details Section */}
          {viewLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin w-12 h-12 text-blue-500 mb-4" />
              <span className="text-lg text-gray-600 dark:text-gray-300">{t.loading}</span>
            </div>
          ) : (
            <div className={show ? "max-w-md mx-auto p-6 bg-yellow-50 border border-yellow-300 dark:bg-[#1a1a1a] dark:border dark:border-[#333333] shadow-lg rounded-lg text-center  dark:text-white text-gray-600" : "hidden"}>
              {transStatus === "completed" && status != "Cancelled" && status !== "pending" ? (
                <div>
                  <div className="flex justify-center mb-4">
                    <BadgeCheck className="text-green-500 w-16 h-16" />
                  </div>
                  <h1 className="text-2xl font-bold text-green-700 mb-2">{t.transactionCompleted}</h1>
                  <p className="mb-4">{t.contactMerchant}</p>
                  <p className="mb-4">{t.thankYou}</p>
                  <p className="mb-4">{t.contactSupport}</p>
                  <div className="w-full">
                    <div className="grid grid-box w-full gap-4">
                      <Button
                        className="w-full dark:bg-gray-400 light:text-green-300"
                        disabled={merchantconfirm === "pending"}
                        onClick={() => router.replace("/wallet")}
                      >
                        {t.viewAsset}
                      </Button>
                      <Button className="w-full dark:bg-gray-400" onClick={() => BackView()}>
                        {t.back}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : status === "Cancelled" ?
               <div>
                  <div className="flex justify-center mb-4">
                    <BadgeX className="text-red-500 w-16 h-16" />
                  </div>
                  <h1 className="text-2xl font-bold text-red-700 mb-2">{t.transactionCancelled}</h1>
                  <p className="mb-4">{t.contactMerchant}</p>
                  <p className="mb-4">{t.thankYou}</p>
                  <p className="mb-4">{t.contactSupport}</p>
                  <div className="w-full">
                    <div className="grid grid-box w-full gap-4">
                      <Button
                        className="w-full dark:bg-gray-400 light:text-green-300"
                        disabled={merchantconfirm === "pending"}
                        onClick={() => router.replace("/wallet")}
                      >
                        {t.viewAsset}
                      </Button>
                      <Button className="w-full dark:bg-gray-400" onClick={() => BackView()}>
                        {t.back}
                      </Button>
                    </div>
                  </div>
                </div> : 
                selectedType === "buy" ?
              merchantid === id ? (
                <div>
                  <div className="flex justify-center mb-4">
                    <Clock className="text-yellow-500 w-16 h-16" />
                  </div>
                  <h1 className="text-2xl font-bold text-yellow-700 mb-2">{t.sendCoin.replace("{coin}", coin)}</h1>
                  <p className="mb-4">
                    {t.sendCoinDesc.replace("{coin}", coin)}
                  </p>
                  <span className="mb-4">{t.userWallet}: <span className="font-bold">{Wallet}</span></span><br />
                  <span className="mb-4">{t.amountToSend}: <span className="font-bold">{Amount}</span></span><br />
                  <span className="mb-4">{t.transactionID}: <span className="font-bold">{tradeid}</span></span> <br />
                  <span className="mb-4">{t.orderTime}: <span className="font-bold">{new Date(date as Date).toLocaleString()}</span></span><br />
                  <span className="mb-4">{t.doubleCheckWallet}</span>
                  <p className="mb-4">{t.reachUser}</p>
                  <p className="mb-4">{t.thankYou}</p>
                  <p className="mb-4">{t.contactSupport}</p>
                  <input
                    id="img"
                    name="img"
                    type="file"
                    accept="image/*"
                    className={merchantconfirm === "sent" ? "hidden" : "mt-1 block w-full"}
                    ref={imgreceipt}
                    required
                  />
                  <div className="w-full">
                    <div className="grid grid-box w-full gap-4">
                      {status !== "pending" ? (
                        merchantconfirm === "sent" ?
                          <Button
                            className="w-full dark:bg-gray-400 light:text-green-300 text-white"
                            disabled={true}
                          >
                            {t.waitingBuyer}
                          </Button>
                          :
                          <Button
                            className="w-full dark:bg-gray-400 light:text-green-300"
                            onClick={() => handlesent(tradeid)}
                            disabled={sendLoading}
                          >
                            {sendLoading ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin w-4 h-4" />
                                {t.sending}
                              </span>
                            ) : (
                              t.iHaveSent
                            )}
                          </Button>
                      ) : (
                        <Button
                          className="w-full text-green-300"
                          onClick={() => router.refresh()}
                        >
                          {t.waitingMerchant}
                        </Button>
                      )}
                      {<Button className="w-full dark:bg-gray-400 text-blue-300" onClick={() => { setShowDisputeModal(true) }}>
                        {t.orderDispute}
                      </Button>}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-center mb-4">
                    <Clock className="text-yellow-500 w-16 h-16" />
                  </div>
                  <h1 className="text-2xl font-bold text-yellow-700 mb-2">{t.willBeSent.replace("{coin}", coin)}</h1>
                  <p className="mb-4">
                    {t.confirmDeposit.replace("{coin}", coin)}
                  </p>
                  <span className="mb-4">{t.userWallet}: <span className="font-bold">{Wallet}</span></span><br />
                  <span className="mb-4">{t.amountSentLabel}: <span className="font-bold">{Amount}</span></span><br />
                  <span className="mb-4">{t.transactionID}: <span className="font-bold">{tradeid}</span></span> <br />
                  <span className="mb-4">{t.orderTime}: <span className="font-bold">{new Date(date as Date).toLocaleString()}</span></span><br />
                  <span className="mb-4">{t.doubleCheckAmount}</span>
                  <p className="mb-4">{t.contactMerchant}</p>
                  <p className="mb-4">{t.thankYou}</p>
                  <p className="mb-4">{t.contactSupport}</p>
                  <div className="mb-4">
                    <Dialog>
                      <DialogTrigger>
                        <img src={url || "null"} width={200} height={100} alt="Receipt" />
                      </DialogTrigger>
                      <DialogContent>
                        <img src={url || "null"} width={500} height={500} alt="Receipt" />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="w-full">
                    <div className="grid grid-box w-full gap-4">
                      {status !== "pending" ? (
                        <Button
                          className="w-full dark:bg-gray-400 light:text-green-300"
                          disabled={merchantconfirm === "pending" || seenLoading}
                          onClick={() => handlerecieved(tradeid)}
                        >
                          {seenLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="animate-spin w-4 h-4" />
                              {t.processing}
                            </span>
                          ) : (
                            t.iHaveSeen
                          )}
                        </Button>
                      ) : (
                        <Button
                          className="w-full text-green-300"
                          onClick={() => router.refresh()}
                        >
                          {t.waitingMerchant}
                        </Button>
                      )}
                      { <Button className="w-full dark:bg-gray-400 text-blue-300" onClick={handledispute}>
                        {t.orderDispute}
                      </Button>}
                    </div>
                  </div>
                </div>
              )
                :   // NEW SELL logic:
                  // If current user is merchant (merchantid === id), they RECEIVE coin (Block B)
                  // If current user is customer (merchantid !== id), they SEND coin (Block A)
  merchantid === id ? (
    // BLOCK B: Current user is merchant, receiving coin (for a SELL trade)
    <div>
      <div className="flex justify-center mb-4">
        <Clock className="text-yellow-500 w-16 h-16" />
      </div>
      <h1 className="text-2xl font-bold text-yellow-700 mb-2">{t.willBeSent.replace("{coin}", coin)}</h1>
      <p className="mb-4">
        {t.confirmDeposit.replace("{coin}", coin)}
      </p>
      <span className="mb-4">{t.userWallet}: <span className="font-bold">{Wallet}</span></span><br />
      <span className="mb-4">{t.amountSentLabel}: <span className="font-bold">{Amount}</span></span><br />
      <span className="mb-4">{t.transactionID}: <span className="font-bold">{tradeid}</span></span> <br />
      <span className="mb-4">{t.orderTime}: <span className="font-bold">{new Date(date as Date).toLocaleString()}</span></span><br />
      <span className="mb-4">{t.doubleCheckAmount}</span>
      <p className="mb-4">{t.contactMerchant}</p>
      <p className="mb-4">{t.thankYou}</p>
      <p className="mb-4">{t.contactSupport}</p>
      <div className="mb-4">
        <Dialog>
          <DialogTrigger>
            <img src={url || "null"} width={200} height={100} alt="Receipt" />
          </DialogTrigger>
          <DialogContent>
            <img src={url || "null"} width={500} height={500} alt="Receipt" />
          </DialogContent>
        </Dialog>
      </div>
      <div className="w-full">
        <div className="grid grid-box w-full gap-4">
          {status !== "pending" ? (
            <Button
              className="w-full dark:bg-gray-400 light:text-green-300"
              disabled={merchantconfirm === "pending" || seenLoading}
              onClick={() => handlerecieved(tradeid)}
            >
              {seenLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  {t.processing}
                </span>
              ) : (
                t.iHaveSeen
              )}
            </Button>
          ) : (
            <Button
              className="w-full text-green-300"
              onClick={() => router.refresh()}
            >
              {t.waitingMerchant}
            </Button>
          )}
          {<Button className="w-full dark:bg-gray-400 text-blue-300" onClick={handledispute}>
            {t.orderDispute}
          </Button>}
        </div>
      </div>
    </div>
  ) : (
    // BLOCK A: Current user is customer, sending coin (for a SELL trade)
    <div>
      <div className="flex justify-center mb-4">
        <Clock className="text-yellow-500 w-16 h-16" />
      </div>
      <h1 className="text-2xl font-bold text-yellow-700 mb-2">{t.sendCoin.replace("{coin}", coin)}</h1>
      <p className="mb-4">
        {t.sendCoinDesc.replace("{coin}", coin)}
      </p>
      <span className="mb-4">{t.userWallet}: <span className="font-bold">{Wallet}</span></span><br />
      <span className="mb-4">{t.amountToSend}: <span className="font-bold">{Amount}</span></span><br />
      <span className="mb-4">{t.transactionID}: <span className="font-bold">{tradeid}</span></span> <br />
      <span className="mb-4">{t.orderTime}: <span className="font-bold">{new Date(date as Date).toLocaleString()}</span></span><br />
      <span className="mb-4">{t.doubleCheckWallet}</span>
      <p className="mb-4">{t.reachUser}</p>
      <p className="mb-4">{t.thankYou}</p>
      <p className="mb-4">{t.contactSupport}</p>
      <input
        id="img"
        name="img"
        type="file"
        accept="image/*"
        className={merchantconfirm === "sent" ? "hidden" : "mt-1 block w-full"}
        ref={imgreceipt}
        required
      />
      <div className="w-full">
        <div className="grid grid-box w-full gap-4">
          {status !== "pending" ? (
            merchantconfirm === "sent" ?
              <Button
                className="w-full dark:bg-gray-400 light:text-green-300 text-white"
                disabled={true}
              >
                {t.waitingBuyer}
              </Button>
              :
              <Button
                className="w-full dark:bg-gray-400 light:text-green-300"
                onClick={() => handlesent(tradeid)}
                disabled={sendLoading}
              >
                {sendLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    {t.sending}
                  </span>
                ) : (
                  t.iHaveSent
                )}
              </Button>
          ) : (
            <Button
              className="w-full text-green-300"
              onClick={() => router.refresh()}
            >
              {t.waitingMerchant}
            </Button>
          )}
          {<Button className="w-full dark:bg-gray-400 text-blue-300" onClick={() => setShowDisputeModal(true)}>
            {t.orderDispute}
          </Button>}
        </div>
      </div>
    </div>
  )

            }
          </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">{t.noPending}</p>
      )}
    </div>
  );
}