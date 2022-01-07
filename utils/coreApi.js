const ApiRequestor = require("./apiRequestor");
const Config = require("./midtrans").Config;

async function charge(payloads) {
  let result = await ApiRequestor.post(
    Config.getBaseURL() + "/charge",
    Config.serverKey,
    payloads
  );

  return result;
}

async function tokenPayment(payloads) {
  let query = `client_key=${payloads.client_key}&card_number=${payloads.card_number}&card_exp_month=${payloads.card_exp_month}&card_exp_year=${payloads.card_exp_year}&card_cvv=${payloads.card_cvv}`;

  let result = await ApiRequestor.get(
    Config.getBaseURL() + "/token?" + query,
    Config.serverKey,
    payloads
  );

  return result;
}

module.exports = { charge, tokenPayment };
