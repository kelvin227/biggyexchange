"use client";

import React, { useEffect, useState } from "react";

// Translation object
const translations = {
  En: {
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "What is Socio?",
        answer: "Socio is a platform that connects people and provides various social and financial services.",
      },
      {
        question: "How do I create an account?",
        answer: "To create an account, click on the 'Sign Up' button on the homepage and fill in the required details.",
      },
      {
        question: "Is my data secure on Socio?",
        answer: "Yes, we prioritize your data security and use advanced encryption to protect your information.",
      },
      {
        question: "How can I contact support?",
        answer: "You can contact our support team via the 'Contact Us' page or email us at otcsocio@gmail.com.",
      },
      {
        question: "Are there any fees for using Socio?",
        answer: "Yes, Socio have a 2% trading fee and a wallet withdrawal fee but Note this fee as for transaction purpose on the blockChain you can not avoid paying for them.",
      },
    ],
  },
  Chi: {
    faqTitle: "常見問題",
    faqs: [
      {
        question: "什麼是 Socio？",
        answer: "Socio 是一個連接人們並提供各種社交和金融服務的平台。",
      },
      {
        question: "如何註冊帳戶？",
        answer: "要註冊帳戶，請點擊主頁上的「註冊」按鈕並填寫所需信息。",
      },
      {
        question: "我的資料在 Socio 上安全嗎？",
        answer: "是的，我們非常重視您的資料安全，並使用先進的加密技術來保護您的信息。",
      },
      {
        question: "如何聯繫客服？",
        answer: "您可以通過「聯繫我們」頁面或發送郵件至 otcsocio@gmail.com 聯繫我們的客服團隊。",
      },
      {
        question: "使用 Socio 有費用嗎？",
        answer: "是的，Socio 有 2% 的交易手續費和錢包提現費，這些費用是區塊鏈交易所必需，無法避免。",
      },
    ],
  },
};

const FAQPage = () => {
  const [Lang, setLang] = useState('En');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const t = translations[Lang as "En" | "Chi"];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('userLanguage');
      if (storedValue) {
        setLang(storedValue);
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 light:bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">{t.faqTitle}</h1>
      <div className="space-y-4">
        {t.faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-4 cursor-pointer"
            onClick={() => toggleFAQ(index)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">{faq.question}</h2>
              <span className="text-gray-500">
                {activeIndex === index ? "-" : "+"}
              </span>
            </div>
            {activeIndex === index && (
              <p className="mt-2 dark:text-gray-300 light:text-gray-600">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;