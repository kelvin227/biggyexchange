"use client";

import { useEffect, useState } from "react";

// Translation object
const translations = {
  En: {
    aboutUs: "About Us",
    welcome: "Welcome to ",
    platformName: "Socio",
    welcomeDesc: "a platform dedicated to connecting people and providing innovative social and financial services. Our mission is to empower individuals and communities by offering tools and resources that make life easier and more connected.",
    ourMission: "Our Mission",
    missionDesc: "At Socio, our mission is to create a world where everyone has access to the tools they need to succeed. Whether it's connecting with others, managing finances, or accessing premium services, we are here to make it happen.",
    ourTeam: "Our Team",
    teamDesc: "Our team is made up of passionate individuals who are committed to innovation and excellence. We work tirelessly to ensure that Socio remains a trusted and reliable platform for all our users.",
    whyChoose: "Why Choose Us?",
    secure: "Secure and reliable platform",
    userFriendly: "User-friendly interface",
    innovative: "Innovative features and services",
    support: "Dedicated customer support",
    contactUs: "Contact Us",
    contactDesc: "Have questions or need support? Feel free to reach out to us at ",
    email: "otcsocio@gmail.com",
    hereToHelp: "We're here to help!",
  },
  Chi: {
    aboutUs: "關於我們",
    welcome: "歡迎來到",
    platformName: "Socio",
    welcomeDesc: "，一個致力於連接人們並提供創新社交和金融服務的平台。我們的使命是通過提供讓生活更輕鬆、更緊密聯繫的工具和資源，賦能個人和社區。",
    ourMission: "我們的使命",
    missionDesc: "在 Socio，我們的使命是創造一個每個人都能獲得成功所需工具的世界。無論是與他人聯繫、管理財務還是獲取高級服務，我們都在這裡幫助您實現。",
    ourTeam: "我們的團隊",
    teamDesc: "我們的團隊由充滿熱情、致力於創新和卓越的人組成。我們不懈努力，確保 Socio 始終是所有用戶值得信賴的平台。",
    whyChoose: "為什麼選擇我們？",
    secure: "安全可靠的平台",
    userFriendly: "用戶友好的界面",
    innovative: "創新功能與服務",
    support: "專業的客戶支持",
    contactUs: "聯繫我們",
    contactDesc: "有問題或需要支持？歡迎通過以下郵箱聯繫我們：",
    email: "otcsocio@gmail.com",
    hereToHelp: "我們隨時為您服務！",
  }
};

const AboutPage = () => {
  const [Lang, setLang] = useState('En');
  const t = translations[Lang as "En" | "Chi"];

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
      <h1 className="text-3xl font-bold mb-6 text-center">{t.aboutUs}</h1>
      <p className="text-lg dark:text-gray-300 light:text-gray-700 mb-4">
        {t.welcome}
        <span className="font-bold">{t.platformName}</span>
        {t.welcomeDesc}
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">{t.ourMission}</h2>
      <p className="dark:text-gray-300 light:text-gray-700 mb-4">
        {t.missionDesc}
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">{t.ourTeam}</h2>
      <p className="dark:text-gray-300 light:text-gray-700 mb-4">
        {t.teamDesc}
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">{t.whyChoose}</h2>
      <ul className="list-disc list-inside dark:text-gray-300 light:text-gray-700 space-y-2">
        <li>{t.secure}</li>
        <li>{t.userFriendly}</li>
        <li>{t.innovative}</li>
        <li>{t.support}</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-4">{t.contactUs}</h2>
      <p className="dark:text-gray-300 light:text-gray-700">
        {t.contactDesc}
        <a href="mailto:support@socio.com" className="text-blue-500 underline">
          {t.email}
        </a>
        。{t.hereToHelp}
      </p>
    </div>
  );
};

export default AboutPage;