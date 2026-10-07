"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.encryptPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const encryptPassword = async (pass) => {
    const passwordHash = await bcryptjs_1.default.hash(pass, 10);
    return passwordHash;
};
exports.encryptPassword = encryptPassword;
const verifyPassword = async (pass, passHash) => {
    const isCorrect = await bcryptjs_1.default.compare(pass, passHash);
    return isCorrect;
};
exports.verifyPassword = verifyPassword;
