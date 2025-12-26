import { GoogleGenerativeAI } from '@google/generative-ai';

//
// 警告：将API密钥直接硬编码在代码中存在安全风险。
// 此密钥将对所有能访问此代码仓库的人可见。
// 仅在明确了解风险且项目为非关键性个人项目时使用。
//
// ！！！请将下面的 "YOUR_API_KEY_HERE" 替换为您真实的 Gemini API 密钥！！！
//
const GEMINI_API_KEY = "AIzaSyAvnRWCDfQRhVEQJcq9ZiP5u6x7kGpkjew";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
