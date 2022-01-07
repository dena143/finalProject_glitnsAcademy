const midtransClient = require("midtrans-client");

const midtransSnap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const SANDBOX_BASE_URL = "https://api.sandbox.midtrans.com/v2";
const PRODUCTION_BASE_URL = "https://api.midtrans.com/v2";

class Config {
  static serverKey = process.env.MIDTRANS_SERVER_KEY;
  static isProduction = false;
  static is3ds = false;
  static isSanitized = false;

  static getBaseURL() {
    return Config.isProduction ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
  }
}

module.exports = { midtransSnap, Config };
