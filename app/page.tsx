"use client";
import { useEffect, useMemo, useState } from "react";
type DocStatus = "verified" | "expired";
type DemoDocument = {
  id: string;
  name: string;
  issuer: string;
  status: DocStatus;
  issued: string;
  icon: string;
  color: string;
  expires?: string;
};
type Requirement = {
  label: string;
  docs: string[];
  kind: "required" | "optional" | "external";
};
type Service = {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirements: Requirement[];
};
type ChatMessage = {
  id: number;
  from: "assistant" | "user";
  text: string;
  serviceId?: string;
};
type LanguageCode = "en" | "hi" | "kn" | "te" | "ta" | "bn" | "mr";
const languages: {
  code: LanguageCode;
  native: string;
  english: string;
  sample: string;
}[] = [
  {
    code: "en",
    native: "English",
    english: "English",
    sample: "Continue in English",
  },
  {
    code: "hi",
    native: "हिन्दी",
    english: "Hindi",
    sample: "हिन्दी में जारी रखें",
  },
  {
    code: "kn",
    native: "ಕನ್ನಡ",
    english: "Kannada",
    sample: "ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ",
  },
  {
    code: "te",
    native: "తెలుగు",
    english: "Telugu",
    sample: "తెలుగులో కొనసాగండి",
  },
  { code: "ta", native: "தமிழ்", english: "Tamil", sample: "தமிழில் தொடரவும்" },
  {
    code: "bn",
    native: "বাংলা",
    english: "Bengali",
    sample: "বাংলায় চালিয়ে যান",
  },
  {
    code: "mr",
    native: "मराठी",
    english: "Marathi",
    sample: "मराठीत सुरू ठेवा",
  },
];
const ui: Record<LanguageCode, Record<string, string>> = {
  en: {},
  hi: {
    Assistant: "सहायक",
    "My Documents": "मेरे दस्तावेज़",
    Menu: "मेनू",
    "Connected securely": "सुरक्षित रूप से जुड़ा",
    "Verified demo account": "सत्यापित डेमो खाता",
    "My issued documents": "मेरे जारी दस्तावेज़",
    Drive: "ड्राइव",
    "My Account": "मेरा खाता",
    Nominee: "नामांकित व्यक्ति",
    Settings: "सेटिंग्स",
    "Scan QR": "QR स्कैन करें",
    "My Activity": "मेरी गतिविधि",
    Help: "सहायता",
    About: "परिचय",
    "Switch Account": "खाता बदलें",
    Logout: "लॉग आउट",
    "Your document copilot": "आपका दस्तावेज़ सहायक",
    "Or choose a service": "या कोई सेवा चुनें",
    Send: "भेजें",
    Passport: "पासपोर्ट",
    Scholarship: "छात्रवृत्ति",
    "Bank Account": "बैंक खाता",
    Visa: "वीज़ा",
    "College Admission": "कॉलेज प्रवेश",
    "Education Loan": "शिक्षा ऋण",
    "PAN Service": "पैन सेवा",
    "Voter ID": "मतदाता पहचान पत्र",
    "Driving Licence": "ड्राइविंग लाइसेंस",
    "Government Job": "सरकारी नौकरी",
    "Health Scheme": "स्वास्थ्य योजना",
    "Vehicle Service": "वाहन सेवा",
    Pension: "पेंशन",
    Verified: "सत्यापित",
    Expired: "समाप्त",
    Language: "भाषा",
  },
  kn: {
    Assistant: "ಸಹಾಯಕ",
    "My Documents": "ನನ್ನ ದಾಖಲೆಗಳು",
    Menu: "ಮೆನು",
    "Connected securely": "ಸುರಕ್ಷಿತವಾಗಿ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ",
    "Verified demo account": "ಪರಿಶೀಲಿತ ಡೆಮೊ ಖಾತೆ",
    "Demo connection": "ಡೆಮೊ ಸಂಪರ್ಕ",
    "No real data is accessed": "ಯಾವುದೇ ನೈಜ ಡೇಟಾವನ್ನು ಪ್ರವೇಶಿಸಲಾಗುವುದಿಲ್ಲ",
    "My issued documents": "ನನ್ನ ಜಾರಿ ಮಾಡಿದ ದಾಖಲೆಗಳು",
    "Ten fictional records used to demonstrate document intelligence.":
      "ದಾಖಲೆ ಸಹಾಯವನ್ನು ಪ್ರದರ್ಶಿಸಲು ಬಳಸುವ ಹತ್ತು ಕಾಲ್ಪನಿಕ ದಾಖಲೆಗಳು.",
    Drive: "ಡ್ರೈವ್",
    "My Account": "ನನ್ನ ಖಾತೆ",
    Nominee: "ನಾಮಿನಿ",
    Settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "Scan QR": "QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "My Activity": "ನನ್ನ ಚಟುವಟಿಕೆ",
    Help: "ಸಹಾಯ",
    About: "ಕುರಿತು",
    "Switch Account": "ಖಾತೆ ಬದಲಿಸಿ",
    Logout: "ಲಾಗ್ ಔಟ್",
    "Your document copilot": "ನಿಮ್ಮ ದಾಖಲೆ ಸಹಾಯಕ",
    "Ask naturally. I’ll compare your request with all 10 demo DigiLocker documents.":
      "ಸಹಜವಾಗಿ ಕೇಳಿ. ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಎಲ್ಲಾ 10 ಡೆಮೊ DigiLocker ದಾಖಲೆಗಳೊಂದಿಗೆ ಹೋಲಿಸುತ್ತೇನೆ.",
    "AI online": "AI ಆನ್‌ಲೈನ್",
    "Document readiness assistant": "ದಾಖಲೆ ಸಿದ್ಧತೆ ಸಹಾಯಕ",
    "Connected to demo DigiLocker": "ಡೆಮೊ DigiLocker ಗೆ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ",
    "Try asking:": "ಹೀಗೆ ಕೇಳಿ:",
    "Or choose a service": "ಅಥವಾ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Open a full document-readiness check instantly":
      "ಸಂಪೂರ್ಣ ದಾಖಲೆ ಸಿದ್ಧತಾ ಪರಿಶೀಲನೆಯನ್ನು ತಕ್ಷಣ ತೆರೆಯಿರಿ",
    Send: "ಕಳುಹಿಸಿ",
    Passport: "ಪಾಸ್‌ಪೋರ್ಟ್",
    Scholarship: "ವಿದ್ಯಾರ್ಥಿವೇತನ",
    "Bank Account": "ಬ್ಯಾಂಕ್ ಖಾತೆ",
    Visa: "ವೀಸಾ",
    "College Admission": "ಕಾಲೇಜು ಪ್ರವೇಶ",
    "Education Loan": "ಶಿಕ್ಷಣ ಸಾಲ",
    "PAN Service": "ಪ್ಯಾನ್ ಸೇವೆ",
    "Voter ID": "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ",
    "Driving Licence": "ಚಾಲನಾ ಪರವಾನಗಿ",
    "Government Job": "ಸರ್ಕಾರಿ ಉದ್ಯೋಗ",
    "Govt. Certificates": "ಸರ್ಕಾರಿ ಪ್ರಮಾಣಪತ್ರಗಳು",
    "Health Scheme": "ಆರೋಗ್ಯ ಯೋಜನೆ",
    "Vehicle Service": "ವಾಹನ ಸೇವೆ",
    Pension: "ಪಿಂಚಣಿ",
    Verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    Expired: "ಅವಧಿ ಮುಗಿದಿದೆ",
    Language: "ಭಾಷೆ",
    "All services": "ಎಲ್ಲಾ ಸೇವೆಗಳು",
    "READINESS ANALYSIS": "ಸಿದ್ಧತಾ ವಿಶ್ಲೇಷಣೆ",
    "We compared this application with your demo DigiLocker.":
      "ಈ ಅರ್ಜಿಯನ್ನು ನಿಮ್ಮ ಡೆಮೊ DigiLocker ಜೊತೆ ಹೋಲಿಸಿದ್ದೇವೆ.",
    ready: "ಸಿದ್ಧ",
    "You’re ready to continue.": "ನೀವು ಮುಂದುವರಿಯಲು ಸಿದ್ಧರಾಗಿದ್ದೀರಿ.",
    "You’re closer than you think.":
      "ನೀವು ಅಂದುಕೊಂಡದ್ದಕ್ಕಿಂತ ಸಿದ್ಧತೆಗೆ ಹತ್ತಿರವಾಗಿದ್ದೀರಿ.",
    "Create document pack": "ದಾಖಲೆ ಪ್ಯಾಕ್ ರಚಿಸಿ",
    "Document checklist": "ದಾಖಲೆ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ",
    "Not everything must come from DigiLocker.":
      "ಎಲ್ಲಾ ದಾಖಲೆಗಳೂ DigiLocker ನಿಂದಲೇ ಬರಬೇಕೆಂದಿಲ್ಲ.",
    "We separate verified documents, accepted alternatives, optional items and files you can provide separately.":
      "ಪರಿಶೀಲಿತ ದಾಖಲೆಗಳು, ಸ್ವೀಕೃತ ಪರ್ಯಾಯಗಳು, ಐಚ್ಛಿಕ ದಾಖಲೆಗಳು ಮತ್ತು ಪ್ರತ್ಯೇಕವಾಗಿ ನೀಡಬಹುದಾದ ಫೈಲ್‌ಗಳನ್ನು ನಾವು ವಿಂಗಡಿಸುತ್ತೇವೆ.",
    "Identity proof": "ಗುರುತಿನ ಪುರಾವೆ",
    "Address proof": "ವಿಳಾಸದ ಪುರಾವೆ",
    "Date of birth proof": "ಜನ್ಮ ದಿನಾಂಕದ ಪುರಾವೆ",
    "PAN card": "ಪ್ಯಾನ್ ಕಾರ್ಡ್",
    Photograph: "ಛಾಯಾಚಿತ್ರ",
    Aadhaar: "ಆಧಾರ್",
    "Previous marksheet": "ಹಿಂದಿನ ಅಂಕಪಟ್ಟಿ",
    "Income certificate": "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ",
    "Category certificate": "ವರ್ಗ ಪ್ರಮಾಣಪತ್ರ",
    "Domicile certificate": "ನಿವಾಸ ಪ್ರಮಾಣಪತ್ರ",
    "Admission proof": "ಪ್ರವೇಶದ ಪುರಾವೆ",
    "Bank details": "ಬ್ಯಾಂಕ್ ವಿವರಗಳು",
    "Financial statements": "ಹಣಕಾಸು ವಿವರಗಳು",
    "Education proof": "ಶಿಕ್ಷಣದ ಪುರಾವೆ",
    "Class 10 marksheet": "10ನೇ ತರಗತಿ ಅಂಕಪಟ್ಟಿ",
    "Class 12 marksheet": "12ನೇ ತರಗತಿ ಅಂಕಪಟ್ಟಿ",
    "Transfer certificate": "ವರ್ಗಾವಣೆ ಪ್ರಮಾಣಪತ್ರ",
    "Academic records": "ಶೈಕ್ಷಣಿಕ ದಾಖಲೆಗಳು",
    "Admission letter": "ಪ್ರವೇಶ ಪತ್ರ",
    "Income evidence": "ಆದಾಯದ ಪುರಾವೆ",
    "Photograph and signature": "ಛಾಯಾಚಿತ್ರ ಮತ್ತು ಸಹಿ",
    "Age proof": "ವಯಸ್ಸಿನ ಪುರಾವೆ",
    "Medical form": "ವೈದ್ಯಕೀಯ ನಮೂನೆ",
    "Education certificates": "ಶಿಕ್ಷಣ ಪ್ರಮಾಣಪತ್ರಗಳು",
    "Residence proof": "ನಿವಾಸದ ಪುರಾವೆ",
    "Supporting declaration": "ಬೆಂಬಲ ಘೋಷಣೆ",
    "Income eligibility": "ಆದಾಯ ಅರ್ಹತೆ",
    "Medical records": "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು",
    "Vehicle RC": "ವಾಹನ RC",
    "Insurance and PUC": "ವಿಮೆ ಮತ್ತು PUC",
    Ready: "ಸಿದ್ಧ",
    Renew: "ನವೀಕರಿಸಿ",
    Optional: "ಐಚ್ಛಿಕ",
    Upload: "ಅಪ್‌ಲೋಡ್",
    Required: "ಅಗತ್ಯ",
    "Provide separately": "ಪ್ರತ್ಯೇಕವಾಗಿ ನೀಡಿ",
    "Missing, but that is fine": "ಲಭ್ಯವಿಲ್ಲ, ಆದರೆ ಪರವಾಗಿಲ್ಲ",
    "Not found in DigiLocker": "DigiLocker ನಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ",
    "Aadhaar Card": "ಆಧಾರ್ ಕಾರ್ಡ್",
    "PAN Card": "ಪ್ಯಾನ್ ಕಾರ್ಡ್",
    "Class 10 Marksheet": "10ನೇ ತರಗತಿ ಅಂಕಪಟ್ಟಿ",
    "Class 10 Passing Certificate": "10ನೇ ತರಗತಿ ಉತ್ತೀರ್ಣ ಪ್ರಮಾಣಪತ್ರ",
    "Class 12 Marksheet": "12ನೇ ತರಗತಿ ಅಂಕಪಟ್ಟಿ",
    "Semester Marksheet": "ಸೆಮಿಸ್ಟರ್ ಅಂಕಪಟ್ಟಿ",
    "Caste Certificate": "ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ",
    "Income Certificate": "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ",
    "Domicile Certificate": "ನಿವಾಸ ಪ್ರಮಾಣಪತ್ರ",
    "Back to Menu": "ಮೆನುಗೆ ಹಿಂತಿರುಗಿ",
    "Profile information": "ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ",
    "Manage nominee": "ನಾಮಿನಿಯನ್ನು ನಿರ್ವಹಿಸಿ",
    Preferences: "ಆದ್ಯತೆಗಳು",
    "Verify a document": "ದಾಖಲೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
    "Recent actions": "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು",
    "How can we help?": "ನಾವು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?", "Ration Card":"ಪಡಿತರ ಚೀಟಿ", "Government Benefits":"ಸರ್ಕಾರಿ ಸೌಲಭ್ಯಗಳು", "Health Insurance":"ಆರೋಗ್ಯ ವಿಮೆ", "Birth & Marriage Records":"ಜನನ ಮತ್ತು ವಿವಾಹ ದಾಖಲೆಗಳು", "Agriculture Schemes":"ಕೃಷಿ ಯೋಜನೆಗಳು", "Property Services":"ಆಸ್ತಿ ಸೇವೆಗಳು", "Police Verification":"ಪೊಲೀಸ್ ಪರಿಶೀಲನೆ", "Jobs & Internships":"ಉದ್ಯೋಗ ಮತ್ತು ಇಂಟರ್ನ್‌ಶಿಪ್", "Family-member details":"ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರಗಳು", "Hospital or marriage evidence":"ಆಸ್ಪತ್ರೆ ಅಥವಾ ವಿವಾಹದ ಪುರಾವೆ", "Witness details":"ಸಾಕ್ಷಿಗಳ ವಿವರಗಳು", "Land or tenancy records":"ಭೂಮಿ ಅಥವಾ ಗೇಣಿ ದಾಖಲೆಗಳು", "Property ownership records":"ಆಸ್ತಿ ಮಾಲೀಕತ್ವದ ದಾಖಲೆಗಳು", "Tax or encumbrance records":"ತೆರಿಗೆ ಅಥವಾ ಋಣಭಾರ ದಾಖಲೆಗಳು", "Purpose letter":"ಉದ್ದೇಶ ಪತ್ರ", "Resume":"ರೆಸ್ಯೂಮ್", "Experience certificates":"ಅನುಭವ ಪ್ರಮಾಣಪತ್ರಗಳು",
  },
  te: {
    Assistant: "సహాయకుడు",
    "My Documents": "నా పత్రాలు",
    Menu: "మెనూ",
    "Connected securely": "సురక్షితంగా కనెక్ట్ అయింది",
    "Verified demo account": "ధృవీకరించిన డెమో ఖాతా",
    "My issued documents": "నా జారీ చేసిన పత్రాలు",
    Drive: "డ్రైవ్",
    "My Account": "నా ఖాతా",
    Nominee: "నామినీ",
    Settings: "సెట్టింగ్‌లు",
    "Scan QR": "QR స్కాన్ చేయండి",
    "My Activity": "నా కార్యకలాపం",
    Help: "సహాయం",
    About: "గురించి",
    "Switch Account": "ఖాతా మార్చండి",
    Logout: "లాగ్ అవుట్",
    "Your document copilot": "మీ పత్రాల సహాయకుడు",
    "Or choose a service": "లేదా సేవను ఎంచుకోండి",
    Send: "పంపండి",
    Passport: "పాస్‌పోర్ట్",
    Scholarship: "స్కాలర్‌షిప్",
    "Bank Account": "బ్యాంక్ ఖాతా",
    Visa: "వీసా",
    "College Admission": "కళాశాల ప్రవేశం",
    "Education Loan": "విద్యా రుణం",
    "PAN Service": "పాన్ సేవ",
    "Voter ID": "ఓటరు గుర్తింపు",
    "Driving Licence": "డ్రైవింగ్ లైసెన్స్",
    "Government Job": "ప్రభుత్వ ఉద్యోగం",
    "Health Scheme": "ఆరోగ్య పథకం",
    "Vehicle Service": "వాహన సేవ",
    Pension: "పెన్షన్",
    Verified: "ధృవీకరించబడింది",
    Expired: "గడువు ముగిసింది",
    Language: "భాష",
  },
  ta: {
    Assistant: "உதவியாளர்",
    "My Documents": "என் ஆவணங்கள்",
    Menu: "பட்டி",
    "Connected securely": "பாதுகாப்பாக இணைக்கப்பட்டது",
    "My Account": "என் கணக்கு",
    Settings: "அமைப்புகள்",
    Help: "உதவி",
    Logout: "வெளியேறு",
    "Your document copilot": "உங்கள் ஆவண உதவியாளர்",
    Passport: "கடவுச்சீட்டு",
    Scholarship: "உதவித்தொகை",
    "Bank Account": "வங்கி கணக்கு",
    Visa: "விசா",
    "College Admission": "கல்லூரி சேர்க்கை",
    "Education Loan": "கல்விக் கடன்",
    Send: "அனுப்பு",
    Language: "மொழி",
  },
  bn: {
    Assistant: "সহায়ক",
    "My Documents": "আমার নথি",
    Menu: "মেনু",
    "Connected securely": "নিরাপদে সংযুক্ত",
    "My Account": "আমার অ্যাকাউন্ট",
    Settings: "সেটিংস",
    Help: "সহায়তা",
    Logout: "লগ আউট",
    "Your document copilot": "আপনার নথি সহায়ক",
    Passport: "পাসপোর্ট",
    Scholarship: "বৃত্তি",
    "Bank Account": "ব্যাংক অ্যাকাউন্ট",
    Visa: "ভিসা",
    "College Admission": "কলেজ ভর্তি",
    "Education Loan": "শিক্ষা ঋণ",
    Send: "পাঠান",
    Language: "ভাষা",
  },
  mr: {
    Assistant: "सहाय्यक",
    "My Documents": "माझी कागदपत्रे",
    Menu: "मेनू",
    "Connected securely": "सुरक्षितपणे जोडले",
    "My Account": "माझे खाते",
    Settings: "सेटिंग्ज",
    Help: "मदत",
    Logout: "लॉग आउट",
    "Your document copilot": "तुमचा दस्तऐवज सहाय्यक",
    Passport: "पासपोर्ट",
    Scholarship: "शिष्यवृत्ती",
    "Bank Account": "बँक खाते",
    Visa: "व्हिसा",
    "College Admission": "महाविद्यालय प्रवेश",
    "Education Loan": "शैक्षणिक कर्ज",
    Send: "पाठवा",
    Language: "भाषा",
  },
};
const documents: DemoDocument[] = [
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    issuer: "UIDAI",
    status: "verified",
    issued: "12 Jun 2022",
    icon: "🪪",
    color: "orange",
  },
  {
    id: "pan",
    name: "PAN Card",
    issuer: "Income Tax Department",
    status: "verified",
    issued: "04 Feb 2023",
    icon: "💳",
    color: "blue",
  },
  {
    id: "class10",
    name: "Class 10 Marksheet",
    issuer: "Karnataka Board",
    status: "verified",
    issued: "18 May 2021",
    icon: "📊",
    color: "violet",
  },
  {
    id: "class10pass",
    name: "Class 10 Passing Certificate",
    issuer: "Karnataka Board",
    status: "verified",
    issued: "18 May 2021",
    icon: "📜",
    color: "gold",
  },
  {
    id: "class12",
    name: "Class 12 Marksheet",
    issuer: "Karnataka Board",
    status: "verified",
    issued: "21 Apr 2023",
    icon: "📈",
    color: "teal",
  },
  {
    id: "semester",
    name: "Semester Marksheet",
    issuer: "DSATM",
    status: "verified",
    issued: "09 Jul 2026",
    icon: "🎓",
    color: "indigo",
  },
  {
    id: "caste",
    name: "Caste Certificate",
    issuer: "Government of Karnataka",
    status: "verified",
    issued: "15 Aug 2024",
    icon: "🏛️",
    color: "purple",
  },
  {
    id: "income",
    name: "Income Certificate",
    issuer: "Revenue Department",
    status: "expired",
    issued: "11 Mar 2024",
    expires: "10 Mar 2025",
    icon: "₹",
    color: "green",
  },
  {
    id: "domicile",
    name: "Domicile Certificate",
    issuer: "Government of Karnataka",
    status: "verified",
    issued: "03 Sep 2024",
    icon: "🏠",
    color: "rose",
  },
  {
    id: "driving",
    name: "Driving Licence",
    issuer: "MoRTH",
    status: "verified",
    issued: "28 Jan 2025",
    expires: "27 Jan 2045",
    icon: "🚗",
    color: "cyan",
  },
];
const baseIdentity: Requirement[] = [
  {
    label: "Identity proof",
    docs: ["aadhaar", "pan", "driving"],
    kind: "required",
  },
  {
    label: "Address proof",
    docs: ["aadhaar", "driving", "domicile"],
    kind: "required",
  },
];
const services: Service[] = [
  {
    id: "passport",
    name: "Passport",
    icon: "🛂",
    description: "Fresh or reissue document check",
    requirements: [
      ...baseIdentity,
      {
        label: "Date of birth proof",
        docs: ["class10", "class10pass"],
        kind: "required",
      },
      { label: "PAN card", docs: ["pan"], kind: "optional" },
      { label: "Photograph", docs: [], kind: "external" },
    ],
  },
  {
    id: "scholarship",
    name: "Scholarship",
    icon: "🎓",
    description: "National and state schemes",
    requirements: [
      { label: "Aadhaar", docs: ["aadhaar"], kind: "required" },
      {
        label: "Previous marksheet",
        docs: ["class12", "semester"],
        kind: "required",
      },
      { label: "Income certificate", docs: ["income"], kind: "required" },
      { label: "Category certificate", docs: ["caste"], kind: "optional" },
      { label: "Domicile certificate", docs: ["domicile"], kind: "optional" },
      { label: "Admission proof", docs: [], kind: "external" },
      { label: "Bank details", docs: [], kind: "external" },
    ],
  },
  {
    id: "bank",
    name: "Bank Account",
    icon: "🏦",
    description: "KYC readiness check",
    requirements: [
      ...baseIdentity,
      { label: "PAN card", docs: ["pan"], kind: "required" },
      { label: "Photograph", docs: [], kind: "external" },
    ],
  },
  {
    id: "visa",
    name: "Visa",
    icon: "🛃",
    description: "Travel document preparation",
    requirements: [
      { label: "Passport", docs: [], kind: "required" },
      ...baseIdentity,
      {
        label: "Education proof",
        docs: ["class12", "semester"],
        kind: "optional",
      },
      { label: "Financial statements", docs: [], kind: "external" },
    ],
  },
  {
    id: "college",
    name: "College Admission",
    icon: "🏫",
    description: "Admission document pack",
    requirements: [
      { label: "Identity proof", docs: ["aadhaar"], kind: "required" },
      { label: "Class 10 marksheet", docs: ["class10"], kind: "required" },
      { label: "Class 12 marksheet", docs: ["class12"], kind: "required" },
      { label: "Category certificate", docs: ["caste"], kind: "optional" },
      { label: "Transfer certificate", docs: [], kind: "external" },
    ],
  },
  {
    id: "education-loan",
    name: "Education Loan",
    icon: "💰",
    description: "Loan documentation check",
    requirements: [
      { label: "Aadhaar", docs: ["aadhaar"], kind: "required" },
      { label: "PAN", docs: ["pan"], kind: "required" },
      {
        label: "Academic records",
        docs: ["class12", "semester"],
        kind: "required",
      },
      { label: "Admission letter", docs: [], kind: "external" },
      { label: "Income evidence", docs: ["income"], kind: "required" },
    ],
  },
  {
    id: "pan-service",
    name: "PAN Service",
    icon: "🪪",
    description: "New PAN or correction",
    requirements: [
      { label: "Aadhaar", docs: ["aadhaar"], kind: "required" },
      {
        label: "Date of birth proof",
        docs: ["class10", "class10pass"],
        kind: "required",
      },
      { label: "Photograph and signature", docs: [], kind: "external" },
    ],
  },
  {
    id: "voter",
    name: "Voter ID",
    icon: "🗳️",
    description: "Registration or correction",
    requirements: [
      { label: "Identity proof", docs: ["aadhaar"], kind: "required" },
      {
        label: "Age proof",
        docs: ["class10", "class10pass"],
        kind: "required",
      },
      {
        label: "Address proof",
        docs: ["aadhaar", "domicile", "driving"],
        kind: "required",
      },
      { label: "Photograph", docs: [], kind: "external" },
    ],
  },
  {
    id: "licence",
    name: "Driving Licence",
    icon: "🚘",
    description: "Learner or permanent licence",
    requirements: [
      {
        label: "Age proof",
        docs: ["class10", "class10pass"],
        kind: "required",
      },
      ...baseIdentity,
      { label: "Medical form", docs: [], kind: "external" },
    ],
  },
  {
    id: "government-job",
    name: "Government Job",
    icon: "🏛️",
    description: "Recruitment document check",
    requirements: [
      { label: "Identity proof", docs: ["aadhaar"], kind: "required" },
      {
        label: "Education certificates",
        docs: ["class10", "class12", "semester"],
        kind: "required",
      },
      { label: "Category certificate", docs: ["caste"], kind: "optional" },
      { label: "Photograph and signature", docs: [], kind: "external" },
    ],
  },
  {
    id: "certificates",
    name: "Govt. Certificates",
    icon: "📜",
    description: "Income, caste and domicile",
    requirements: [
      { label: "Identity proof", docs: ["aadhaar"], kind: "required" },
      {
        label: "Residence proof",
        docs: ["domicile", "aadhaar"],
        kind: "required",
      },
      { label: "Supporting declaration", docs: [], kind: "external" },
    ],
  },
  {
    id: "health",
    name: "Health Scheme",
    icon: "🏥",
    description: "Public health benefit check",
    requirements: [
      { label: "Aadhaar", docs: ["aadhaar"], kind: "required" },
      { label: "Income eligibility", docs: ["income"], kind: "required" },
      { label: "Category proof", docs: ["caste"], kind: "optional" },
      { label: "Medical records", docs: [], kind: "external" },
    ],
  },
  {
    id: "vehicle",
    name: "Vehicle Service",
    icon: "🚗",
    description: "Registration and transfer",
    requirements: [
      {
        label: "Identity proof",
        docs: ["aadhaar", "driving"],
        kind: "required",
      },
      { label: "Driving licence", docs: ["driving"], kind: "required" },
      { label: "Vehicle RC", docs: [], kind: "required" },
      { label: "Insurance and PUC", docs: [], kind: "external" },
    ],
  },
  {
    id: "pension",
    name: "Pension",
    icon: "👴",
    description: "Pension and benefits",
    requirements: [
      { label: "Identity proof", docs: ["aadhaar"], kind: "required" },
      {
        label: "Age proof",
        docs: ["class10", "class10pass"],
        kind: "required",
      },
      { label: "Income certificate", docs: ["income"], kind: "optional" },
      { label: "Bank details", docs: [], kind: "external" },
    ],
  },
  { id: "ration", name: "Ration Card", icon: "🍚", description: "Food-security and family record check", requirements: [{ label: "Identity proof", docs: ["aadhaar"], kind: "required" }, { label: "Address proof", docs: ["aadhaar", "domicile"], kind: "required" }, { label: "Income certificate", docs: ["income"], kind: "required" }, { label: "Family-member details", docs: [], kind: "external" }] },
  { id: "benefits", name: "Government Benefits", icon: "🏛️", description: "Eligibility for public schemes", requirements: [{ label: "Aadhaar", docs: ["aadhaar"], kind: "required" }, { label: "Income certificate", docs: ["income"], kind: "required" }, { label: "Category certificate", docs: ["caste"], kind: "optional" }, { label: "Bank details", docs: [], kind: "external" }] },
  { id: "insurance", name: "Health Insurance", icon: "🛡️", description: "Policy and claim document check", requirements: [{ label: "Identity proof", docs: ["aadhaar", "pan"], kind: "required" }, { label: "Age proof", docs: ["class10", "class10pass"], kind: "required" }, { label: "Medical records", docs: [], kind: "external" }, { label: "Bank details", docs: [], kind: "external" }] },
  { id: "civil-records", name: "Birth & Marriage Records", icon: "👨‍👩‍👧", description: "Civil certificate applications", requirements: [{ label: "Identity proof", docs: ["aadhaar"], kind: "required" }, { label: "Address proof", docs: ["aadhaar", "domicile"], kind: "required" }, { label: "Hospital or marriage evidence", docs: [], kind: "external" }, { label: "Witness details", docs: [], kind: "external" }] },
  { id: "agriculture", name: "Agriculture Schemes", icon: "🌾", description: "Farmer benefits and subsidies", requirements: [{ label: "Aadhaar", docs: ["aadhaar"], kind: "required" }, { label: "Bank details", docs: [], kind: "required" }, { label: "Land or tenancy records", docs: [], kind: "required" }, { label: "Income certificate", docs: ["income"], kind: "optional" }] },
  { id: "property", name: "Property Services", icon: "🏠", description: "Land, registration and mutation", requirements: [{ label: "Identity proof", docs: ["aadhaar", "pan"], kind: "required" }, { label: "Address proof", docs: ["aadhaar", "domicile"], kind: "required" }, { label: "Property ownership records", docs: [], kind: "required" }, { label: "Tax or encumbrance records", docs: [], kind: "external" }] },
  { id: "police", name: "Police Verification", icon: "👮", description: "PCC, tenant and employee checks", requirements: [{ label: "Identity proof", docs: ["aadhaar", "driving"], kind: "required" }, { label: "Address proof", docs: ["aadhaar", "domicile"], kind: "required" }, { label: "Photograph", docs: [], kind: "external" }, { label: "Purpose letter", docs: [], kind: "external" }] },
  { id: "employment", name: "Jobs & Internships", icon: "💼", description: "Employment document readiness", requirements: [{ label: "Identity proof", docs: ["aadhaar", "pan"], kind: "required" }, { label: "Education certificates", docs: ["class10", "class12", "semester"], kind: "required" }, { label: "Resume", docs: [], kind: "external" }, { label: "Experience certificates", docs: [], kind: "optional" }] },
];
const serviceBadge: Record<string, string> = {
  passport: "PP", scholarship: "SC", bank: "BK", visa: "VS", college: "CL", "education-loan": "EL", "pan-service": "PAN", voter: "VID", licence: "DL", "government-job": "GJ", certificates: "CERT", health: "HLT", vehicle: "VEH", pension: "PEN", ration: "RC", benefits: "GB", insurance: "INS", "civil-records": "CR", agriculture: "AGR", property: "PROP", police: "PCC", employment: "JOB",
};
const documentBadge: Record<string, string> = { aadhaar: "AD", pan: "PAN", class10: "10", class10pass: "10C", class12: "12", semester: "SEM", caste: "CAST", income: "INC", domicile: "DOM", driving: "DL" };
type ServiceProcess = {
  destination: string;
  verification: string[];
  signatures: string[];
  finalStep: string;
};
const serviceProcess: Record<string, ServiceProcess> = {
  passport: { destination: "Apply on Passport Seva, then visit the selected Passport Seva Kendra or Post Office Passport Seva Kendra.", verification: ["Online application and document validation", "In-person identity and biometric verification", "Police verification when applicable"], signatures: ["Applicant declaration and application signature", "Self-attested copies if requested"], finalStep: "Track the application on the Passport Seva portal after the appointment." },
  scholarship: { destination: "Apply through the National Scholarship Portal or the applicable state scholarship portal; the college scholarship office verifies the application.", verification: ["Student identity and document verification", "Institute or college verification", "District, state or scheme-authority approval"], signatures: ["Student declaration or e-sign", "Parent or guardian signature for minors", "Institute verification or seal where required"], finalStep: "Save the application ID and follow the portal status until sanction." },
  bank: { destination: "Continue through the selected bank’s website/app or visit its nearest branch.", verification: ["Mobile OTP and PAN/Aadhaar validation", "Video KYC or in-person KYC", "Bank review and account activation"], signatures: ["Account-opening form signature", "Specimen signature", "Nominee declaration when a nominee is added"], finalStep: "The bank may request an original-document check before activation." },
  visa: { destination: "Apply on the destination country’s official visa portal and visit its authorised visa application centre or embassy when instructed.", verification: ["Online form and document review", "Biometric appointment when required", "Embassy or consulate decision"], signatures: ["Visa application declaration", "Applicant signature matching the passport", "Sponsor or guardian signature when applicable"], finalStep: "Requirements vary by destination country; always confirm them on the official embassy website." },
  college: { destination: "Apply on the college or university admission portal, then report to its admission office for original-document verification.", verification: ["Online application review", "Merit or eligibility verification", "Original-document verification at admission"], signatures: ["Student declaration", "Parent or guardian signature when required", "Anti-ragging or admission undertaking signatures"], finalStep: "Carry originals and photocopies on the reporting date." },
  "education-loan": { destination: "Apply through the selected bank or the Vidya Lakshmi portal and coordinate with the bank branch handling the loan.", verification: ["Student and co-applicant KYC", "Admission and fee verification", "Income, credit and loan approval"], signatures: ["Student and co-applicant signatures", "Loan agreement signatures", "Guarantor signature if required"], finalStep: "The bank may request additional collateral or income documents depending on the loan amount." },
  "pan-service": { destination: "Use the official Protean eGov or UTIITSL PAN service and submit physical documents only if the chosen method requires them.", verification: ["Aadhaar OTP or identity validation", "Document and application validation", "PAN allotment or correction approval"], signatures: ["Applicant signature within the prescribed box", "Guardian or representative signature when applicable"], finalStep: "Ensure the name and date of birth match the supporting documents." },
  voter: { destination: "Apply through the Voters’ Service Portal or Voter Helpline app; the local electoral officer handles field verification.", verification: ["Online identity and address review", "Booth Level Officer field verification when required", "Electoral Registration Officer approval"], signatures: ["Applicant declaration or e-sign", "Applicant signature on any physical verification form"], finalStep: "Use the reference number to track inclusion or correction in the electoral roll." },
  licence: { destination: "Apply through Parivahan/Sarathi and visit the selected Regional Transport Office for testing and verification.", verification: ["Document and fee verification", "Biometric/photo and signature capture", "Learner or driving test and RTO approval"], signatures: ["Applicant declaration", "Digital signature captured at the RTO", "Doctor’s signature on Form 1A when applicable"], finalStep: "Testing requirements depend on the licence category and state RTO." },
  "government-job": { destination: "Apply on the recruiting department’s official portal and attend its examination or document-verification centre when shortlisted.", verification: ["Online eligibility screening", "Examination or selection-stage verification", "Original documents, background and medical verification when selected"], signatures: ["Applicant declaration and uploaded signature", "Self-attested document copies", "Employer or authority certification when requested"], finalStep: "Follow only the official recruitment notification for the exact stages." },
  certificates: { destination: "Apply through the relevant state e-District, Seva Sindhu or revenue-department portal, or visit the designated citizen-service centre.", verification: ["Identity and address validation", "Revenue or local-officer document review", "Issuing-authority approval"], signatures: ["Applicant declaration", "Self-attestation", "Notary or gazetted-officer signature only when the scheme demands it"], finalStep: "The exact office and verification stages depend on the certificate and state." },
  health: { destination: "Use the official health-scheme portal or visit an empanelled hospital or scheme help desk.", verification: ["Identity and eligibility verification", "Scheme database or household verification", "Hospital or authority approval"], signatures: ["Beneficiary consent", "Patient or guardian signature", "Doctor or hospital-authority signature for medical claims"], finalStep: "Medical claims may require extra hospital records and insurer verification." },
  vehicle: { destination: "Use the Parivahan/Vahan portal and visit the concerned Regional Transport Office if inspection or original verification is required.", verification: ["Owner and vehicle-document validation", "Vehicle inspection when applicable", "RTO approval and record update"], signatures: ["Registered owner signature", "Buyer and seller signatures for transfer", "Financier signature or NOC when hypothecation exists"], finalStep: "Forms and physical inspection requirements vary by transaction and state." },
  pension: { destination: "Apply through the relevant pension portal, department, EPFO office or state social-welfare office.", verification: ["Identity and bank validation", "Service or eligibility verification", "Pension-authority sanction and periodic life-certificate verification"], signatures: ["Applicant declaration", "Nominee or family declaration when applicable", "Authorised officer certification for specific pension cases"], finalStep: "Some pensions require a Digital Life Certificate every year after approval." },
  ration: { destination: "Apply on the state food and civil-supplies portal or visit the nearest ration/citizen-service office.", verification: ["Family identity and address verification", "Income and household eligibility review", "Local food-supply authority approval"], signatures: ["Head-of-family declaration", "Adult family-member signatures when requested", "Local verification officer approval"], finalStep: "Track the acknowledgement number until the family record is approved." },
  benefits: { destination: "Use the scheme’s official central/state portal or the nearest government citizen-service centre.", verification: ["Identity and bank validation", "Income/category eligibility verification", "Scheme-authority sanction"], signatures: ["Applicant declaration or e-sign", "Self-attested supporting documents", "Department certification where required"], finalStep: "Confirm the scheme-specific eligibility rules before final submission." },
  insurance: { destination: "Apply through the insurer’s official portal, branch or an authorised hospital insurance desk.", verification: ["KYC and policy eligibility check", "Medical or hospital document review", "Insurer approval or claim settlement review"], signatures: ["Policyholder declaration", "Patient or nominee signature", "Doctor/hospital signature for claims"], finalStep: "Keep the policy or claim reference number for tracking." },
  "civil-records": { destination: "Apply through the municipal, panchayat or state civil-registration portal and visit the registrar if originals are requested.", verification: ["Applicant and event-details review", "Hospital/marriage/witness evidence verification", "Registrar approval and certificate issue"], signatures: ["Applicant declaration", "Parents/spouses signatures as applicable", "Witnesses and registrar signature when required"], finalStep: "Requirements differ for delayed registration, corrections and duplicate certificates." },
  agriculture: { destination: "Use the official agriculture/farmer scheme portal or visit the agriculture, revenue or common-service centre.", verification: ["Farmer identity and bank verification", "Land, crop or tenancy validation", "Department inspection and scheme approval"], signatures: ["Farmer declaration", "Joint-owner or lessor signature when applicable", "Revenue/agriculture officer certification"], finalStep: "Land and crop details must match the state revenue records." },
  property: { destination: "Use the state land-record/registration portal and visit the sub-registrar, revenue or municipal office for the selected service.", verification: ["Owner KYC and property-record check", "Tax, title and encumbrance verification", "Registration, mutation or municipal approval"], signatures: ["Owner/applicant signature", "Buyer and seller signatures for transactions", "Witness, registrar or authorised-officer signatures"], finalStep: "Property procedures are state-specific; carry original title records when called." },
  police: { destination: "Apply through the state police citizen portal, Passport Seva PCC flow or the local police station specified in the application.", verification: ["Identity and address-document review", "Local police field verification when required", "Police-authority approval and certificate issue"], signatures: ["Applicant declaration", "Applicant signature on verification forms", "Landlord/employer/witness signature where applicable"], finalStep: "Keep the application reference and respond to any local verification call." },
  employment: { destination: "Apply on the employer, internship or government employment portal and attend the stated interview/document-verification venue.", verification: ["Profile and eligibility screening", "Interview/test and certificate review", "KYC, background and onboarding verification"], signatures: ["Applicant declaration and uploaded signature", "Self-attested certificates", "Offer, consent and onboarding form signatures"], finalStep: "Never pay unverified recruiters; use the employer’s official channel." },
};
function getResult(req: Requirement) {
  const found = documents.find((doc) => req.docs.includes(doc.id));
  if (found?.status === "verified")
    return { state: "ready", title: "Ready", detail: found.name };
  if (found?.status === "expired")
    return {
      state: "expired",
      title: "Renew",
      detail: `${found.name} expired`,
    };
  if (req.kind === "optional")
    return {
      state: "fine",
      title: "Optional",
      detail: "Missing, but that is fine",
    };
  if (req.kind === "external")
    return { state: "upload", title: "Upload", detail: "Provide separately" };
  return {
    state: "missing",
    title: "Required",
    detail: "Not found in DigiLocker",
  };
}
export default function Home() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [language, setLanguage] = useState<LanguageCode | null>(null);
  const [active, setActive] = useState<Service | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"assistant" | "documents" | "menu">(
    "assistant",
  );
  const [menuView, setMenuView] = useState("home");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [nominee, setNominee] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState("");
  const [renewalStarted, setRenewalStarted] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "found">(
    "idle",
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "assistant",
      text: "Hello Varshini! I found 10 documents in your demo DigiLocker. What would you like to apply for today?",
    },
  ]);
  const [assistantTyping, setAssistantTyping] = useState(false);
  const t = (text: string) => (language ? (ui[language][text] ?? text) : text);
  const process = active ? serviceProcess[active.id] : null;
  const kannadaDestinations: Record<string, string> = {
    passport: "Passport Seva ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ; ನಂತರ ಆಯ್ಕೆ ಮಾಡಿದ Passport Seva Kendra ಅಥವಾ Post Office Passport Seva Kendra ಗೆ ಭೇಟಿ ನೀಡಿ.", scholarship: "National Scholarship Portal ಅಥವಾ ಸಂಬಂಧಿತ ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ; ಕಾಲೇಜಿನ ವಿದ್ಯಾರ್ಥಿವೇತನ ಕಚೇರಿ ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.", bank: "ಆಯ್ಕೆ ಮಾಡಿದ ಬ್ಯಾಂಕ್‌ನ ವೆಬ್‌ಸೈಟ್/ಆ್ಯಪ್‌ನಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ ಅಥವಾ ಹತ್ತಿರದ ಶಾಖೆಗೆ ಭೇಟಿ ನೀಡಿ.", visa: "ಗಮ್ಯ ದೇಶದ ಅಧಿಕೃತ ವೀಸಾ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ; ಸೂಚಿಸಿದ ರಾಯಭಾರ ಕಚೇರಿ ಅಥವಾ ಅಧಿಕೃತ ವೀಸಾ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.", college: "ಕಾಲೇಜು ಅಥವಾ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರವೇಶ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ; ಮೂಲ ದಾಖಲೆ ಪರಿಶೀಲನೆಗಾಗಿ ಪ್ರವೇಶ ಕಚೇರಿಗೆ ಹೋಗಿ.", "education-loan": "ಆಯ್ಕೆ ಮಾಡಿದ ಬ್ಯಾಂಕ್ ಅಥವಾ Vidya Lakshmi ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ; ಸಾಲ ನಿರ್ವಹಿಸುವ ಬ್ಯಾಂಕ್ ಶಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.", "pan-service": "ಅಧಿಕೃತ Protean eGov ಅಥವಾ UTIITSL PAN ಸೇವೆಯನ್ನು ಬಳಸಿ.", voter: "Voters’ Service Portal ಅಥವಾ Voter Helpline ಆ್ಯಪ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ; ಸ್ಥಳೀಯ ಚುನಾವಣಾ ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ ನಡೆಸುತ್ತಾರೆ.", licence: "Parivahan/Sarathi ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ; ಪರೀಕ್ಷೆ ಮತ್ತು ಪರಿಶೀಲನೆಗಾಗಿ ಆಯ್ಕೆ ಮಾಡಿದ RTO ಗೆ ಭೇಟಿ ನೀಡಿ.", "government-job": "ನೇಮಕಾತಿ ಇಲಾಖೆಯ ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ; ಆಯ್ಕೆಯಾದಾಗ ಪರೀಕ್ಷೆ ಅಥವಾ ದಾಖಲೆ ಪರಿಶೀಲನಾ ಕೇಂದ್ರಕ್ಕೆ ಹೋಗಿ.", certificates: "ರಾಜ್ಯದ e-District, Seva Sindhu ಅಥವಾ ಕಂದಾಯ ಇಲಾಖೆಯ ಪೋರ್ಟಲ್ ಬಳಸಿ; ಅಗತ್ಯವಿದ್ದರೆ ನಾಗರಿಕ ಸೇವಾ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.", health: "ಅಧಿಕೃತ ಆರೋಗ್ಯ ಯೋಜನೆ ಪೋರ್ಟಲ್ ಬಳಸಿ ಅಥವಾ ನೋಂದಾಯಿತ ಆಸ್ಪತ್ರೆ/ಯೋಜನೆ ಸಹಾಯ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.", vehicle: "Parivahan/Vahan ಪೋರ್ಟಲ್ ಬಳಸಿ; ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದ್ದರೆ ಸಂಬಂಧಿತ RTO ಗೆ ಭೇಟಿ ನೀಡಿ.", pension: "ಸಂಬಂಧಿತ ಪಿಂಚಣಿ ಪೋರ್ಟಲ್, ಇಲಾಖೆ, EPFO ಕಚೇರಿ ಅಥವಾ ರಾಜ್ಯ ಸಮಾಜ ಕಲ್ಯಾಣ ಕಚೇರಿಯಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
  };
  const displayedProcess = process && language === "kn" ? {
    destination: kannadaDestinations[active?.id ?? ""] ?? "ಸಂಬಂಧಿತ ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಮತ್ತು ಸೂಚಿಸಿದ ಸೇವಾ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.",
    verification: ["ಆನ್‌ಲೈನ್ ಅರ್ಜಿ ಮತ್ತು ದಾಖಲೆ ಪರಿಶೀಲನೆ", "ಅಗತ್ಯವಿದ್ದರೆ OTP, ಗುರುತು, ಬಯೋಮೆಟ್ರಿಕ್ ಅಥವಾ ಮೂಲ ದಾಖಲೆ ಪರಿಶೀಲನೆ", "ಸಂಬಂಧಿತ ಇಲಾಖೆಯ ಅಂತಿಮ ಪರಿಶೀಲನೆ ಮತ್ತು ಅನುಮೋದನೆ"],
    signatures: ["ಅರ್ಜಿದಾರರ ಘೋಷಣೆ ಮತ್ತು ಸಹಿ ಅಥವಾ ಇ-ಸಹಿ", "ಅಗತ್ಯವಿದ್ದರೆ ಸ್ವಯಂ ದೃಢೀಕರಿಸಿದ ಪ್ರತಿಗಳ ಮೇಲೆ ಸಹಿ", "ಅಪ್ರಾಪ್ತರಿಗಾಗಿ ಪೋಷಕರ/ಪಾಲಕರ ಸಹಿ ಅಥವಾ ಸಂಬಂಧಿತ ಅಧಿಕಾರಿಯ ಸಹಿ"],
    finalStep: "ಅಧಿಕೃತ ಅರ್ಜಿ ಸಂಖ್ಯೆ ಅಥವಾ ಸ್ವೀಕೃತಿ ಸಂಖ್ಯೆಯನ್ನು ಉಳಿಸಿ ಮತ್ತು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿರಿ.",
  } : process;
  const filtered = services.filter((s) =>
    `${s.name} ${s.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const analysis = useMemo(
    () =>
      active?.requirements.map((req) => ({ req, result: getResult(req) })) ??
      [],
    [active],
  );
  const required = analysis.filter(({ req }) => req.kind === "required");
  const readyRequired = required.filter(
    ({ result }) => result.state === "ready",
  ).length;
  const score = required.length
    ? Math.round((readyRequired / required.length) * 100)
    : 0;
  function connect() {
    setConnecting(true);
    window.setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1800);
  }
  function chooseLanguage(code: LanguageCode) {
    setLanguage(code);
    document.documentElement.lang = code;
    const hello: Record<LanguageCode, string> = {
      en: "Hello Varshini! I found 10 documents in your demo DigiLocker. What would you like to apply for today?",
      hi: "नमस्ते वरशिनी! आपके डेमो DigiLocker में 10 दस्तावेज़ मिले। आज आप किस सेवा के लिए आवेदन करना चाहती हैं?",
      kn: "ನಮಸ್ಕಾರ ವರ್ಷಿಣಿ! ನಿಮ್ಮ ಡೆಮೊ DigiLocker ನಲ್ಲಿ 10 ದಾಖಲೆಗಳು ಸಿಕ್ಕಿವೆ. ಇಂದು ನೀವು ಯಾವ ಸೇವೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬಯಸುತ್ತೀರಿ?",
      te: "నమస్తే వర్షిణి! మీ డెమో DigiLockerలో 10 పత్రాలు దొరికాయి. ఈ రోజు మీరు ఏ సేవకు దరఖాస్తు చేయాలనుకుంటున్నారు?",
      ta: "வணக்கம் வர்ஷினி! உங்கள் டெமோ DigiLocker-ல் 10 ஆவணங்கள் உள்ளன. எந்த சேவைக்கு விண்ணப்பிக்க விரும்புகிறீர்கள்?",
      bn: "নমস্কার বর্ষিণী! আপনার ডেমো DigiLocker-এ ১০টি নথি পাওয়া গেছে। আপনি কোন পরিষেবার জন্য আবেদন করতে চান?",
      mr: "नमस्कार वर्षिणी! तुमच्या डेमो DigiLocker मध्ये 10 कागदपत्रे सापडली. तुम्हाला कोणत्या सेवेसाठी अर्ज करायचा आहे?",
    };
    setChatMessages([{ id: Date.now(), from: "assistant", text: hello[code] }]);
  }
  function openMenu(view: string) {
    setMenuView(view);
  }
  function runScan() {
    setScanState("scanning");
    window.setTimeout(() => setScanState("found"), 1800);
  }
  function disconnect() {
    setConnected(false);
    setTab("assistant");
    setMenuView("home");
    setActive(null);
  }
  function askAssistant(text = query) {
    const clean = text.trim();
    if (!clean || assistantTyping) return;
    const lower = clean.toLowerCase();
    const match = services.find(
      (service) =>
        lower.includes(service.name.toLowerCase()) ||
        lower.includes(service.id.replace("-", " ")),
    );
    setChatMessages((messages) => [
      ...messages,
      { id: Date.now(), from: "user", text: clean },
    ]);
    setQuery("");
    setAssistantTyping(true);
    window.setTimeout(() => {
      if (match) {
        const results = match.requirements.map((req) => ({
          req,
          result: getResult(req),
        }));
        const mandatory = results.filter(({ req }) => req.kind === "required");
        const ready = mandatory.filter(
          ({ result }) => result.state === "ready",
        ).length;
        const readiness = mandatory.length
          ? Math.round((ready / mandatory.length) * 100)
          : 0;
        const renew = results.find(({ result }) => result.state === "expired");
        const missing = results.find(
          ({ result }) => result.state === "missing",
        );
        let guidance = language === "kn"
          ? `${t(match.name)} ಸೇವೆಗೆ ನೀವು ${readiness}% ಸಿದ್ಧರಾಗಿದ್ದೀರಿ. ${mandatory.length} ಅಗತ್ಯ ದಾಖಲೆ ಗುಂಪುಗಳಲ್ಲಿ ${ready} ಲಭ್ಯವಿವೆ.`
          : `You are ${readiness}% ready for ${match.name}. ${ready} of ${mandatory.length} mandatory document groups are available.`;
        if (renew)
          guidance += language === "kn" ? ` ನಿಮ್ಮ ${t(renew.req.label)} ನವೀಕರಣ ಅಗತ್ಯವಿದೆ.` : ` Your ${renew.req.label.toLowerCase()} needs renewal.`;
        else if (missing)
          guidance += language === "kn" ? ` ನಿಮಗೆ ಇನ್ನೂ ${t(missing.req.label)} ಅಗತ್ಯವಿದೆ.` : ` You still need ${missing.req.label.toLowerCase()}.`;
        else guidance += language === "kn" ? " ನಿಮ್ಮ ಅಗತ್ಯ DigiLocker ದಾಖಲೆಗಳು ಸಿದ್ಧವಾಗಿವೆ." : " Your mandatory DigiLocker documents are ready.";
        guidance += language === "kn" ? " ಐಚ್ಛಿಕ ದಾಖಲೆಗಳು ಇಲ್ಲದಿದ್ದರೂ ಪರವಾಗಿಲ್ಲ; ಹೊರಗಿನ ಫೈಲ್‌ಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಸೇರಿಸಬಹುದು." : " Optional missing documents are fine, and external files can be added separately.";
        setChatMessages((messages) => [
          ...messages,
          {
            id: Date.now() + 1,
            from: "assistant",
            text: guidance,
            serviceId: match.id,
          },
        ]);
      } else {
        setChatMessages((messages) => [
          ...messages,
          {
            id: Date.now() + 1,
            from: "assistant",
            text: "I can check passports, visas, scholarships, college admission, loans, IDs, government schemes and more. Choose a suggestion below or mention the service name.",
          },
        ]);
      }
      setAssistantTyping(false);
    }, 1100);
  }
  useEffect(() => {
    function handleMenuClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const item = target.closest(
        ".menu-group button, .menu-profile-card",
      ) as HTMLElement | null;
      if (!item) return;
      const label = item.textContent?.replace("›", "").trim() ?? "";
      if (
        item.classList.contains("menu-profile-card") ||
        label.includes("My Account")
      )
        openMenu("account");
      else if (label.includes("Drive")) setTab("documents");
      else if (label.includes("Nominee")) openMenu("nominee");
      else if (label.includes("Settings")) openMenu("settings");
      else if (label.includes("Scan QR")) openMenu("scan");
      else if (label.includes("My Activity")) openMenu("activity");
      else if (label.includes("Help")) openMenu("help");
      else if (label.includes("About")) openMenu("about");
      else if (label.includes("Switch Account") || label.includes("Logout"))
        disconnect();
    }
    document.addEventListener("click", handleMenuClick);
    return () => document.removeEventListener("click", handleMenuClick);
  }, []);
  useEffect(() => {
    if (!language || language === "en") return;
    const translateTree = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const raw = node.nodeValue ?? "";
        const key = raw.trim();
        if (key && ui[language][key])
          node.nodeValue = raw.replace(key, ui[language][key]);
      }
    };
    const timer = window.setTimeout(translateTree, 0);
    return () => window.clearTimeout(timer);
  }, [language, tab, menuView, active, chatMessages, assistantTyping]);
  if (!connected)
    return (
      <main className="welcome-shell">
        <nav className="welcome-nav">
          <div className="brand">
            <span className="brand-mark">D</span>
            <span>
              DigiAssist
            </span>
          </div>
          <span className="demo-pill">Hackathon prototype</span>
        </nav>
        <section className="welcome-grid">
          <div className="welcome-copy">
            <p className="eyebrow">SIMPLE DOCUMENT SUPPORT</p>
            <h1>
              Get your documents ready.
              <br />
              <span>Apply with confidence.</span>
            </h1>
            <p className="lead">
              Connect the demo DigiLocker to check your documents, understand
              what is missing, and see the next steps for common applications.
            </p>
            <button
              className="primary-button"
              onClick={connect}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <span className="spinner" /> Connecting securely…
                </>
              ) : (
                <>
                  Connect DigiLocker <span>→</span>
                </>
              )}
            </button>
            <p className="safety-note">
              <span>✓</span> Simulated connection. No real personal data is
              accessed.
            </p>
          </div>
          <div className="locker-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="locker-card">
              <div className="locker-top">
                <span className="mini-mark">D</span>
                <span>Digital Document Locker</span>
                <i>•••</i>
              </div>
              <div className="shield">✓</div>
              <h3>Your documents, ready when you are.</h3>
              <div className="mini-docs">
                <span>Aadhaar</span>
                <span>Marksheet</span>
                <span>Licence</span>
              </div>
              <div className="secure-line">
                <span>10 demo documents</span>
                <b>Verified</b>
              </div>
            </div>
          </div>
        </section>
        <footer className="welcome-footer">
          <span>Consent-first sharing</span>
          <span>•</span>
          <span>Verified document checks</span>
          <span>•</span>
          <span>Smart alternatives</span>
        </footer>
      </main>
    );
  if (!language)
    return (
      <main className="language-shell">
        <div className="language-card">
          <div className="brand language-brand">
            <span className="brand-mark">D</span>
            <span>
              DigiAssist
            </span>
          </div>
          <div className="language-success">
            <span>✓</span>
            <div>
              <strong>DigiLocker Connected Successfully</strong>
              <small>10 verified demo documents found</small>
            </div>
          </div>
          <p className="eyebrow">CHOOSE YOUR LANGUAGE</p>
          <h1>Select your preferred language</h1>
          <p className="language-lead">
            The complete assistant, menu, services and document guidance will
            appear in your selected language.
          </p>
          <div className="language-grid">
            {languages.map((item) => (
              <button key={item.code} onClick={() => chooseLanguage(item.code)}>
                <span lang={item.code}>{item.native}</span>
                <small>{item.english}</small>
                <em>{item.sample}</em>
                <b>→</b>
              </button>
            ))}
          </div>
          <p className="language-note">
            🌐 You can change the language anytime from Settings.
          </p>
        </div>
      </main>
    );
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand inverse">
          <span className="brand-mark">D</span>
          <span>
            DigiAssist
          </span>
        </div>
        <div className="profile">
          <div className="avatar">VD</div>
          <div>
            <strong>Varshini Devi M</strong>
            <span>
              <i /> {t("Verified demo account")}
            </span>
          </div>
        </div>
        <nav className="side-nav">
          <button
            className={tab === "assistant" ? "active" : ""}
            onClick={() => {
              setTab("assistant");
              setActive(null);
            }}
          >
            <span>✦</span> {t("Assistant")}
          </button>
          <button
            className={tab === "documents" ? "active" : ""}
            onClick={() => {
              setTab("documents");
              setActive(null);
            }}
          >
            <span>▤</span> {t("My Documents")} <em>{documents.length}</em>
          </button>
          <button
            className={tab === "menu" ? "active" : ""}
            onClick={() => {
              setTab("menu");
              setActive(null);
            }}
          >
            <span>☰</span> {t("Menu")}
          </button>
          <p className="side-section-label">{language === "kn" ? "ತ್ವರಿತ ಪ್ರವೇಶ" : "QUICK ACCESS"}</p>
          <button onClick={() => { setTab("assistant"); setActive(null); window.setTimeout(() => document.querySelector(".service-shortcuts")?.scrollIntoView({ behavior: "smooth" }), 50); }}><span>▦</span>{language === "kn" ? "ಎಲ್ಲಾ ಸೇವೆಗಳು" : "All Services"}<em>{services.length}</em></button>
          <button onClick={() => { setTab("menu"); setMenuView("saved"); setActive(null); }}><span>☆</span>{language === "kn" ? "ಉಳಿಸಿದ ವರದಿಗಳು" : "Saved Reports"}<em>2</em></button>
          <button onClick={() => { setTab("menu"); setMenuView("upload"); setActive(null); }}><span>↑</span>{language === "kn" ? "ದಾಖಲೆ ಅಪ್‌ಲೋಡ್" : "Upload Document"}</button>
          <button onClick={() => { setTab("menu"); setMenuView("alerts"); setActive(null); }}><span>!</span>{language === "kn" ? "ಅವಧಿ ಎಚ್ಚರಿಕೆಗಳು" : "Expiry Alerts"}<em className="alert-count">1</em></button>
          <button onClick={() => { setTab("menu"); setMenuView("activity"); setActive(null); }}><span>◷</span>{language === "kn" ? "ಪರಿಶೀಲನಾ ಇತಿಹಾಸ" : "Verification History"}</button>
          <button onClick={() => setLanguage(null)}><span>◎</span>{language === "kn" ? "ಭಾಷೆ ಬದಲಿಸಿ" : "Change Language"}</button>
          <button onClick={() => { setTab("menu"); setMenuView("help"); setActive(null); }}><span>?</span>{language === "kn" ? "ಸಹಾಯ ಕೇಂದ್ರ" : "Help Centre"}</button>
        </nav>
        <div className="side-bottom">
          <p>
            <span>✓</span> Demo connection
          </p>
          <small>No real data is accessed</small>
        </div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <button className="language-switch" onClick={() => setLanguage(null)}>
            🌐 {languages.find((item) => item.code === language)?.native}
          </button>
          <div className="connected-badge">
            <i /> {t("Connected securely")}
          </div>
        </header>
        {tab === "documents" ? (
          <div className="content">
            <div className="page-heading">
              <p className="eyebrow">DEMO DIGILOCKER</p>
              <h2>{t("My issued documents")}</h2>
              <p>{t("Ten fictional records used to demonstrate document intelligence.")}</p>
            </div>
            <div className="document-grid">
              {documents.map((doc) => (
                <article className="document-card" key={doc.id}>
                  <div className={`doc-icon ${doc.color}`}>{doc.icon}</div>
                  <div className="doc-main">
                    <h3>{t(doc.name)}</h3>
                    <p>{doc.issuer}</p>
                    <small>
                      {language === "kn" ? "ಜಾರಿ " : "Issued "}{doc.issued}
                      {doc.expires ? `${language === "kn" ? " · ಅವಧಿ " : " · Expires "}${doc.expires}` : ""}
                    </small>
                  </div>
                  <span className={`status ${doc.status}`}>
                    {doc.status === "verified" ? `✓ ${t("Verified")}` : `! ${t("Expired")}`}
                  </span>
                </article>
              ))}
            </div>
          </div>
        ) : tab === "menu" ? (
          <div className="content menu-page">
            <div className="menu-profile-card">
              <div className="menu-avatar">VD</div>
              <div>
                <h2>Varshini Devi M</h2>
                <p>
                  Verified <span>✓</span>
                </p>
              </div>
              <b>›</b>
            </div>
            <div className="menu-groups">
              <div className="menu-group">
                <button>
                  <span>▣</span>Drive<b>›</b>
                </button>
                <button>
                  <span>♙</span>My Account<b>›</b>
                </button>
                <button>
                  <span>♙+</span>Nominee<b>›</b>
                </button>
                <button>
                  <span>⚙</span>Settings<b>›</b>
                </button>
              </div>
              <div className="menu-group">
                <button>
                  <span>⌗</span>Scan QR<b>›</b>
                </button>
                <button>
                  <span>▤</span>My Activity<b>›</b>
                </button>
              </div>
              <div className="menu-group">
                <button>
                  <span>?</span>Help<b>›</b>
                </button>
                <button>
                  <span>ⓘ</span>About<b>›</b>
                </button>
              </div>
              <div className="menu-group">
                <button>
                  <span>⇱</span>Switch Account<b>›</b>
                </button>
                <button className="logout">
                  <span>↪</span>Logout<b>›</b>
                </button>
              </div>
            </div>
          </div>
        ) : active ? (
          <div className="content analysis-page">
            <button className="back-button" onClick={() => setActive(null)}>
              ← {t("All services")}
            </button>
            <div className="analysis-header">
              <div>
                <p className="eyebrow">{t("READINESS ANALYSIS")}</p>
                <h2>{t(active.name)}</h2>
                <p>{t("We compared this application with your demo DigiLocker.")}</p>
              </div>
              <div
                className="score-ring"
                style={
                  { "--score": `${score * 3.6}deg` } as React.CSSProperties
                }
              >
                <div>
                  <strong>{score}%</strong>
                  <span>{t("ready")}</span>
                </div>
              </div>
            </div>
            <div className="result-summary">
              <span className="summary-icon">✦</span>
              <div>
                <h3>
                  {score === 100
                    ? t("You’re ready to continue.")
                    : t("You’re closer than you think.")}
                </h3>
                <p>{language === "kn" ? `${required.length} ಅಗತ್ಯ ದಾಖಲೆಗಳಲ್ಲಿ ${readyRequired} ಸಿದ್ಧವಾಗಿವೆ. ಐಚ್ಛಿಕ ದಾಖಲೆಗಳು ಇಲ್ಲದಿದ್ದರೂ ಪರವಾಗಿಲ್ಲ; ಹೊರಗಿನ ದಾಖಲೆಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು.` : `${readyRequired} of ${required.length} mandatory requirements are ready. Optional missing items are okay, while external documents can be uploaded separately.`}</p>
              </div>
              <button>{t("Create document pack")}</button>
            </div>
            <div className="requirements">
              <div className="requirements-title">
                <h3>{t("Document checklist")}</h3>
                <span>{analysis.length} {language === "kn" ? "ಅವಶ್ಯಕತೆಗಳು" : "requirements"}</span>
              </div>
              {analysis.map(({ req, result }) => (
                <div className="requirement-row" key={req.label}>
                  <div className={`result-dot ${result.state}`}>
                    {result.state === "ready"
                      ? "✓"
                      : result.state === "expired"
                        ? "!"
                        : result.state === "fine"
                          ? "○"
                          : "+"}
                  </div>
                  <div className="requirement-copy">
                    <strong>{t(req.label)}</strong>
                    <span>{t(result.detail.replace(" expired", ""))}{result.detail.endsWith(" expired") ? (language === "kn" ? " ಅವಧಿ ಮುಗಿದಿದೆ" : " expired") : ""}</span>
                  </div>
                  <span className={`result-tag ${result.state}`}>
                    {t(result.title)}
                  </span>
                </div>
              ))}
            </div>
            <div className="help-card">
              <span>i</span>
              <p>
                <strong>{t("Not everything must come from DigiLocker.")}</strong>
                <br />
                {t("We separate verified documents, accepted alternatives, optional items and files you can provide separately.")}
              </p>
            </div>
            {displayedProcess && (
              <section className="next-steps-card">
                <div className="next-steps-heading">
                  <div>
                    <p className="eyebrow">{language === "kn" ? "ಮುಂದಿನ ಹಂತಗಳು" : "WHAT TO DO NEXT"}</p>
                    <h3>{language === "kn" ? "ಎಲ್ಲಿ ಹೋಗಬೇಕು ಮತ್ತು ಯಾವ ಪರಿಶೀಲನೆ ಬೇಕು" : "Where to go and what will be verified"}</h3>
                  </div>
                  <span>{language === "kn" ? `${displayedProcess.verification.length} ಪರಿಶೀಲನಾ ಹಂತಗಳು` : `${displayedProcess.verification.length} verification stages`}</span>
                </div>
                <div className="destination-box">
                  <span>📍</span><div><strong>{language === "kn" ? "ಎಲ್ಲಿ ಹೋಗಬೇಕು" : "Where to go"}</strong><p>{displayedProcess.destination}</p></div>
                </div>
                <div className="process-columns">
                  <div className="process-panel">
                    <h4><span>✓</span>{language === "kn" ? "ಪರಿಶೀಲನಾ ಹಂತಗಳು" : "Verification stages"}</h4>
                    <ol>{displayedProcess.verification.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol>
                  </div>
                  <div className="process-panel signatures-panel">
                    <h4><span>✍</span>{language === "kn" ? "ಅಗತ್ಯ ಸಹಿಗಳು" : "Signatures needed"}</h4>
                    <ul>{displayedProcess.signatures.map((signature) => <li key={signature}>{signature}</li>)}</ul>
                  </div>
                </div>
                <div className="final-step"><span>→</span><p><strong>{language === "kn" ? "ಕೊನೆಯ ಹಂತ:" : "Final step:"}</strong> {displayedProcess.finalStep}</p></div>
                <small className="process-note">{language === "kn" ? "ಇದು ಹ್ಯಾಕಥಾನ್ ಮಾದರಿಯ ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನ. ನಿಖರ ಹಂತಗಳು ರಾಜ್ಯ, ಯೋಜನೆ ಮತ್ತು ಪ್ರಾಧಿಕಾರದ ಪ್ರಕಾರ ಬದಲಾಗಬಹುದು; ಸಲ್ಲಿಸುವ ಮೊದಲು ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಪರಿಶೀಲಿಸಿ." : "Prototype guidance only. Exact stages can vary by state, scheme and authority; verify the official portal before submission."}</small>
              </section>
            )}
          </div>
        ) : (
          <div className="content assistant-dashboard">
            <div className="assistant-title">
              <div>
                <p className="eyebrow">DOCUMENT HELP DESK</p>
                <h2>{language === "kn" ? "ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?" : "How can we help you?"}</h2>
                <p>{language === "kn" ? "ನಿಮಗೆ ಬೇಕಾದ ಸೇವೆಯನ್ನು ಕೇಳಿ. ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮುಂದಿನ ಹಂತಗಳನ್ನು ತಿಳಿಸುತ್ತೇವೆ." : "Tell us what you want to apply for. We’ll check your documents and explain the next steps."}</p>
              </div>
              <div className="ai-live"><i /> {language === "kn" ? "ಸಹಾಯ ಲಭ್ಯವಿದೆ" : "Help available"}</div>
            </div>
            <section className="chat-shell">
              <div className="chat-top">
                <div className="ai-avatar">D</div>
                <div>
                  <strong>DigiAssist Help Desk</strong>
                  <span>{language === "kn" ? "ದಾಖಲೆ ಸಹಾಯ ಸೇವೆ" : "Document support service"}</span>
                </div>
                <em>
                  <i /> {language === "kn" ? "ಡೆಮೊ DigiLocker ಸಂಪರ್ಕಿಸಲಾಗಿದೆ" : "Demo DigiLocker connected"}
                </em>
              </div>
              <div className="chat-feed" aria-live="polite">
                {chatMessages.map((message) => (
                  <div className={`chat-row ${message.from}`} key={message.id}>
                    {message.from === "assistant" && (
                      <span className="message-avatar">D</span>
                    )}
                    <div className="message-bubble">
                      <p>{message.text}</p>
                      {message.serviceId && (
                        <button
                          onClick={() =>
                            setActive(
                              services.find(
                                (service) => service.id === message.serviceId,
                              ) ?? null,
                            )
                          }
                        >
                          {language === "kn" ? "ಸಂಪೂರ್ಣ ಸಿದ್ಧತಾ ವರದಿ ನೋಡಿ" : "View full readiness report"} <span>→</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {assistantTyping && (
                  <div className="chat-row assistant">
                    <span className="message-avatar">D</span>
                    <div className="typing-bubble">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                )}
              </div>
              <div className="quick-prompts">
                <span>{t("Try asking:")}</span>
                {["Passport", "Scholarship", "Visa", "Education Loan"].map(
                  (name) => (
                    <button
                      key={name}
                      onClick={() =>
                        askAssistant(`I want to apply for ${name}`)
                      }
                    >
                      {t(name)}
                    </button>
                  ),
                )}
              </div>
              <form
                className="chat-composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  askAssistant();
                }}
              >
                <span>✦</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={language === "kn" ? "ಕೇಳಿ: ಪಾಸ್‌ಪೋರ್ಟ್‌ಗೆ ಏನು ಬೇಕು?" : "Ask: What do I need for a passport?"}
                  aria-label="Ask DigiAssist AI"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || assistantTyping}
                >
                  {t("Send")} <b>↑</b>
                </button>
              </form>
              <div className="chat-disclaimer">{language === "kn" ? "ಇದು ಕಾಲ್ಪನಿಕ ದಾಖಲೆಗಳನ್ನು ಬಳಸುವ ಹ್ಯಾಕಥಾನ್ ಮಾದರಿ." : "Hackathon prototype using fictional documents and general application guidance."}</div>
            </section>
            <div className="section-title service-shortcuts">
              <div>
                <h3>{t("Or choose a service")}</h3>
                <p>{t("Open a full document-readiness check instantly")}</p>
              </div>
              <span>{services.length} services</span>
            </div>
            <div className="service-grid compact-services">
              {services.map((s) => (
                <button
                  className="service-card"
                  key={s.id}
                  onClick={() => setActive(s)}
                >
                    <span className="service-icon">{s.icon}</span>
                  <div>
                    <h3>{t(s.name)}</h3>
                    <p>{s.description}</p>
                  </div>
                  <span className="arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === "menu" && menuView !== "home" && (
          <div className="menu-detail-overlay">
            <div className="content menu-detail">
              <button className="back-button" onClick={() => openMenu("home")}>
                ← Back to Menu
              </button>
              {menuView === "saved" && <><p className="eyebrow">SAVED REPORTS</p><h2>{language === "kn" ? "ನಿಮ್ಮ ಉಳಿಸಿದ ವರದಿಗಳು" : "Your saved readiness reports"}</h2><div className="feature-list"><button onClick={() => { setActive(services.find(s => s.id === "passport") ?? null); setTab("assistant"); }}><span className="feature-icon">🛂</span><div><strong>{t("Passport")}</strong><small>75% ready · Saved today</small></div><b>Open →</b></button><button onClick={() => { setActive(services.find(s => s.id === "scholarship") ?? null); setTab("assistant"); }}><span className="feature-icon">🎓</span><div><strong>{t("Scholarship")}</strong><small>50% ready · Saved yesterday</small></div><b>Open →</b></button></div></>}
              {menuView === "upload" && <><p className="eyebrow">UPLOAD DOCUMENT</p><h2>{language === "kn" ? "ಹೊಸ ದಾಖಲೆ ಸೇರಿಸಿ" : "Add a document to this demo"}</h2><div className="detail-card upload-panel"><div className="upload-drop"><span>↑</span><h3>{uploadedDoc || (language === "kn" ? "ದಾಖಲೆ ಆಯ್ಕೆಮಾಡಿ" : "Choose a document")}</h3><p>{language === "kn" ? "PDF, JPG ಅಥವಾ PNG · ಗರಿಷ್ಠ 5 MB" : "PDF, JPG or PNG · Maximum 5 MB"}</p><label className="detail-primary">{uploadedDoc ? "Choose another" : "Browse files"}<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setUploadedDoc(event.target.files?.[0]?.name ?? "")} /></label></div>{uploadedDoc && <div className="upload-success">✓ {uploadedDoc} {language === "kn" ? "ಡೆಮೊಗೆ ಸಿದ್ಧವಾಗಿದೆ" : "is ready for the demo"}</div>}</div></>}
              {menuView === "alerts" && <><p className="eyebrow">EXPIRY ALERTS</p><h2>{language === "kn" ? "ಗಮನ ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು" : "Documents needing attention"}</h2><div className="detail-card alert-panel"><div className="alert-document"><span>!</span><div><strong>{t("Income Certificate")}</strong><p>{language === "kn" ? "10 ಮಾರ್ಚ್ 2025 ರಂದು ಅವಧಿ ಮುಗಿದಿದೆ" : "Expired on 10 March 2025"}</p></div><button onClick={() => setMenuView("income-detail")}>{language === "kn" ? "ದಾಖಲೆ ತೆರೆಯಿರಿ" : "Open document"}</button></div><div className="alert-tip">{language === "kn" ? "ವಿದ್ಯಾರ್ಥಿವೇತನ, ಆರೋಗ್ಯ ಯೋಜನೆ ಮತ್ತು ಶಿಕ್ಷಣ ಸಾಲಕ್ಕೆ ಮುನ್ನ ಇದನ್ನು ನವೀಕರಿಸಿ." : "Renew this before applying for scholarships, health schemes or education loans."}</div><div className="alert-actions"><button onClick={() => setMenuView("income-detail")}>{language === "kn" ? "ವಿವರಗಳನ್ನು ನೋಡಿ" : "View details"}</button><button className="renew-button" onClick={() => setMenuView("renew-income")}>{language === "kn" ? "ನವೀಕರಣ ಮಾರ್ಗದರ್ಶನ" : "Renewal guidance"}</button></div></div></>}
              {menuView === "income-detail" && <><p className="eyebrow">DOCUMENT DETAILS</p><h2>{t("Income Certificate")}</h2><div className="detail-card certificate-preview"><div className="certificate-head"><span>₹</span><div><strong>Income Certificate</strong><small>Revenue Department · Government of Karnataka</small></div><em>EXPIRED</em></div><dl><div><dt>Holder</dt><dd>Varshini Devi M</dd></div><div><dt>Certificate number</dt><dd>RD-DEMO-2024-1847</dd></div><div><dt>Issued</dt><dd>11 March 2024</dd></div><div><dt>Expired</dt><dd>10 March 2025</dd></div><div><dt>Verification</dt><dd>Demo DigiLocker issued</dd></div></dl><div className="affected-services"><strong>{language === "kn" ? "ಈ ದಾಖಲೆ ಅಗತ್ಯವಿರುವ ಸೇವೆಗಳು" : "Services affected"}</strong><div><button onClick={() => { setActive(services.find(s => s.id === "scholarship") ?? null); setTab("assistant"); }}>🎓 {t("Scholarship")}</button><button onClick={() => { setActive(services.find(s => s.id === "health") ?? null); setTab("assistant"); }}>🏥 {t("Health Scheme")}</button><button onClick={() => { setActive(services.find(s => s.id === "education-loan") ?? null); setTab("assistant"); }}>💰 {t("Education Loan")}</button></div></div><button className="detail-primary" onClick={() => setMenuView("renew-income")}>{language === "kn" ? "ನವೀಕರಣ ಪ್ರಕ್ರಿಯೆ ನೋಡಿ" : "See renewal process"}</button></div></>}
              {menuView === "renew-income" && <><p className="eyebrow">RENEWAL GUIDANCE</p><h2>{language === "kn" ? "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ನವೀಕರಿಸಿ" : "Renew Income Certificate"}</h2><div className="detail-card renewal-guide"><div className="renewal-route"><span>1</span><div><strong>{language === "kn" ? "ಅಧಿಕೃತ ಸೇವೆ ತೆರೆಯಿರಿ" : "Open the official service"}</strong><p>{language === "kn" ? "Karnataka Seva Sindhu ಅಥವಾ ಹತ್ತಿರದ Nadakacheri ಕೇಂದ್ರವನ್ನು ಬಳಸಿ." : "Use Karnataka Seva Sindhu or visit the nearest Nadakacheri centre."}</p></div></div><div className="renewal-route"><span>2</span><div><strong>{language === "kn" ? "ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಿ" : "Submit supporting documents"}</strong><p>Aadhaar, address proof, family-income declaration and any requested supporting records.</p></div></div><div className="renewal-route"><span>3</span><div><strong>{language === "kn" ? "ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಿ" : "Complete verification"}</strong><p>{language === "kn" ? "OTP/ಗುರುತು ಪರಿಶೀಲನೆ ಮತ್ತು ಕಂದಾಯ ಅಧಿಕಾರಿಯ ಅನುಮೋದನೆ ಅಗತ್ಯವಾಗಬಹುದು." : "OTP/identity validation and revenue-officer approval may be required."}</p></div></div>{renewalStarted ? <div className="renewal-success">✓ {language === "kn" ? "ಡೆಮೊ ನವೀಕರಣ ವಿನಂತಿ ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ. ಉಲ್ಲೇಖ: INC-2026-0721" : "Demo renewal request started. Reference: INC-2026-0721"}</div> : <button className="detail-primary" onClick={() => setRenewalStarted(true)}>{language === "kn" ? "ಡೆಮೊ ನವೀಕರಣ ಪ್ರಾರಂಭಿಸಿ" : "Start demo renewal"}</button>}<small>{language === "kn" ? "ಇದು ಹ್ಯಾಕಥಾನ್ ಡೆಮೊ ಮಾತ್ರ; ಯಾವುದೇ ಸರ್ಕಾರಿ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸುವುದಿಲ್ಲ." : "Hackathon simulation only; no government request is submitted."}</small></div></>}
              {menuView === "account" && (
                <>
                  <p className="eyebrow">MY ACCOUNT</p>
                  <h2>Profile information</h2>
                  <div className="detail-card profile-details">
                    <div className="menu-avatar">VD</div>
                    <label>
                      Full name<strong>Varshini Devi M</strong>
                    </label>
                    <label>
                      Account status
                      <strong className="green-text">✓ Verified</strong>
                    </label>
                    <label>
                      Mobile number<strong>•••••• 0721</strong>
                    </label>
                    <label>
                      Demo DigiLocker ID<strong>DL-DEMO-2026-0721</strong>
                    </label>
                  </div>
                </>
              )}
              {menuView === "nominee" && (
                <>
                  <p className="eyebrow">NOMINEE</p>
                  <h2>Manage nominee</h2>
                  <div className="detail-card nominee-card">
                    {nominee ? (
                      <div className="nominee-success">
                        <span>✓</span>
                        <div>
                          <strong>{nominee}</strong>
                          <p>Added as your demo nominee</p>
                        </div>
                        <button onClick={() => setNominee("")}>Remove</button>
                      </div>
                    ) : (
                      <>
                        <label htmlFor="nominee-name">
                          Nominee’s full name
                        </label>
                        <input
                          id="nominee-name"
                          placeholder="Enter nominee name"
                        />
                        <button
                          className="detail-primary"
                          onClick={() => {
                            const input = document.getElementById(
                              "nominee-name",
                            ) as HTMLInputElement;
                            if (input?.value.trim())
                              setNominee(input.value.trim());
                          }}
                        >
                          Add nominee
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
              {menuView === "settings" && (
                <>
                  <p className="eyebrow">SETTINGS</p>
                  <h2>Preferences</h2>
                  <div className="detail-card settings-card">
                    <button onClick={() => setNotifications(!notifications)}>
                      <span>
                        Application notifications
                        <small>Readiness and expiry reminders</small>
                      </span>
                      <i className={notifications ? "toggle on" : "toggle"} />
                    </button>
                    <button onClick={() => setDarkMode(!darkMode)}>
                      <span>
                        High contrast mode
                        <small>Improve screen visibility</small>
                      </span>
                      <i className={darkMode ? "toggle on" : "toggle"} />
                    </button>
                    <button>
                      <span>
                        Language<small>English</small>
                      </span>
                      <b>›</b>
                    </button>
                  </div>
                </>
              )}
              {menuView === "scan" && (
                <>
                  <p className="eyebrow">SCAN QR</p>
                  <h2>Verify a document</h2>
                  <div className="detail-card scanner-card">
                    <div className={`scanner-window ${scanState}`}>
                      <span />
                      <span />
                      <span />
                      <span />
                      <b>{scanState === "found" ? "✓" : "▦"}</b>
                    </div>
                    <h3>
                      {scanState === "idle"
                        ? "Ready to scan"
                        : scanState === "scanning"
                          ? "Scanning QR code…"
                          : "Document verified"}
                    </h3>
                    <p>
                      {scanState === "found"
                        ? "Demo Aadhaar record verified successfully."
                        : "Use this simulation to demonstrate QR verification."}
                    </p>
                    <button className="detail-primary" onClick={runScan}>
                      {scanState === "found"
                        ? "Scan another"
                        : "Start demo scan"}
                    </button>
                  </div>
                </>
              )}
              {menuView === "activity" && (
                <>
                  <p className="eyebrow">MY ACTIVITY</p>
                  <h2>Recent actions</h2>
                  <div className="detail-card activity-list">
                    <div>
                      <span>✓</span>
                      <p>
                        <strong>DigiLocker connected</strong>
                        <small>Today, 2:42 PM</small>
                      </p>
                    </div>
                    <div>
                      <span>◈</span>
                      <p>
                        <strong>Scholarship readiness checked</strong>
                        <small>Today, 2:44 PM</small>
                      </p>
                    </div>
                    <div>
                      <span>▤</span>
                      <p>
                        <strong>10 documents retrieved</strong>
                        <small>Today, 2:42 PM</small>
                      </p>
                    </div>
                  </div>
                </>
              )}
              {menuView === "help" && (
                <>
                  <p className="eyebrow">HELP CENTRE</p>
                  <h2>How can we help?</h2>
                  <div className="detail-card help-list">
                    <details open>
                      <summary>Is this connected to real DigiLocker?</summary>
                      <p>
                        No. This prototype uses fictional demo records only.
                      </p>
                    </details>
                    <details>
                      <summary>What does “optional” mean?</summary>
                      <p>
                        Your application may continue without that document for
                        the selected case.
                      </p>
                    </details>
                    <details>
                      <summary>How are alternatives selected?</summary>
                      <p>
                        The assistant checks accepted identity, address and
                        date-of-birth proof categories.
                      </p>
                    </details>
                  </div>
                </>
              )}
              {menuView === "about" && (
                <>
                  <p className="eyebrow">ABOUT</p>
                  <h2>DigiAssist</h2>
                  <div className="detail-card about-card">
                    <span className="brand-mark">D</span>
                    <h3>Document support, made simpler.</h3>
                    <p>
                      An unofficial hackathon prototype demonstrating
                      consent-first document readiness and missing-document
                      guidance.
                    </p>
                    <small>Version 1.0 · Demo only</small>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
