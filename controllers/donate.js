const { Op } = require("sequelize");
const { midtransSnap } = require("../utils/midtrans");

const { donate, user, campaign, payment } = require("../models");
const { charge, tokenPayment } = require("../utils/coreApi");

class BankTransfer {
  constructor(amount, donate_id, customer, dataCampaign) {
    this.amount = amount;
    this.customer = customer;
    this.donate_id = donate_id;
    this.descriptions = dataCampaign;
  }

  bankTransfer() {
    let amount = this.amount;
    let donate_id = this.donate_id;
    let customer = this.customer;
    let gross_amount = amount;
    let order_id = donate_id;
    let description = "Donasi untuk campaign " + this.descriptions;

    let body = {
      payment_type: "bank_transfer",
      transaction_details: {
        gross_amount,
        order_id,
      },
      customer_details: {
        email: customer.email,
        first_name: customer.name,
      },
      item_details: {
        id: donate_id,
        price: amount,
        quantity: 1,
        name: description,
      },
    };

    let mybody = {
      payment_type: body.payment_type,
      transaction_details: body.transaction_details,
      customer_details: body.customer_details,
      item_details: body.item_details,
      bank_transfer: {
        bank: "BNI",
        va_number: "12345678",
      },
    };

    return mybody;
  }
}

class CreditOrDebitCard {
  constructor(amount, donate_id, customer, token, dataCampaign) {
    this.amount = amount;
    this.customer = customer;
    this.donate_id = donate_id;
    this.token = token;
    this.descriptions = dataCampaign;
  }

  creditDebitCardBody() {
    let amount = this.amount;
    let donate_id = this.donate_id;
    let customer = this.customer;
    let gross_amount = amount;
    let order_id = donate_id;
    let description = "Donasi untuk campaign " + this.descriptions;

    let body = {
      payment_type: "credit_card",
      transaction_details: {
        gross_amount,
        order_id,
      },
      customer_details: {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
      },
      item_details: {
        id: donate_id,
        price: amount,
        quantity: 1,
        name: description,
      },
    };

    let mybody = {
      payment_type: body.payment_type,
      transaction_details: body.transaction_details,
      customer_details: body.customer_details,
      credit_card: {
        token_id: this.token,
      },
    };

    return mybody;
  }
}

class Donate {
  async getAllDonate(req, res, next) {
    try {
      let data = await donate.findAll({
        attributes: ["amount", "name", "message", "updatedAt"],
        include: [
          {
            model: campaign,
            attributes: ["title"],
          },
          {
            model: user,
            attributes: ["name", "image"],
          },
        ],
        where: {
          [Op.and]: [{ campaignId: req.query.id }, { amount: { [Op.gt]: 0 } }],
        },

        order: [["updatedAt", "DESC"]],
      });

      if (data.length === 0) {
        return res.status(404).json({ message: "You haven't donate yet!" });
      }

      return res.status(200).json({
        status: 200,
        message: "Success get All Donate",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDonate(req, res, next) {
    try {
      let dataCampaign = await campaign.findOne({
        where: {
          id: req.params.id,
        },
      });

      if (dataCampaign.userId === req.loginUser.data.id) {
        return res.status(401).json({ message: ["Fundraiser cannot donate!"] });
      }

      const newPayment = await payment.create(req.body);
      const { amount, name, message, method } = req.body;

      const newDonate = await donate.create({
        amount: 0,
        name,
        message,
        userId: req.loginUser.data.id,
        campaignId: req.params.id,
        paymentId: newPayment.id,
      });

      const dataDonate = await donate.findOne({
        where: {
          id: newDonate.id,
        },
        attributes: ["id", "amount", "name", "message"],
        include: [
          {
            model: user,
            attributes: ["name", "image"],
          },
        ],
      });

      let paymentDetail;

      dataCampaign = dataCampaign.title;

      if (method == "Bank Transfer") {
        let dataCustomer;
        let customers = {
          email: req.loginUser.data.email,
          name: req.loginUser.data.name,
        };

        let bankTransfer = new BankTransfer(
          amount,
          newPayment.id,
          customers,
          dataCampaign
        );
        dataCustomer = bankTransfer.bankTransfer();

        paymentDetail = await charge(dataCustomer);

        await payment.update(
          {
            transaction_time: paymentDetail.transaction_time,
            transaction_status: paymentDetail.transaction_status,
            bank_name: paymentDetail.va_numbers[0].bank,
            va_numbers: paymentDetail.va_numbers[0].va_number,
            fraud_status: paymentDetail.fraud_status,
          },
          { where: { id: newPayment.id } }
        );
      } else if (method == "Credit or Debit Card") {
        let dataCustomer;
        let customers = {
          email: req.loginUser.data.email,
          name: req.loginUser.data.name,
        };

        let CreditDebitCard = new CreditOrDebitCard(
          amount,
          newPayment.id,
          customers,
          req.body.token,
          dataCampaign
        );

        dataCustomer = CreditDebitCard.creditDebitCardBody();

        paymentDetail = await charge(dataCustomer);

        await payment.update(
          {
            transaction_time: paymentDetail.transaction_time,
            transaction_status: paymentDetail.transaction_status,
            bank_name: paymentDetail.bank,
            fraud_status: paymentDetail.fraud_status,
          },
          { where: { id: newPayment.id } }
        );
      }

      return res.status(200).json({
        dataDonate,
        paymentDetail,
        message: ["Success add your Donations"],
      });
    } catch (error) {
      next(error);
    }
  }

  async getTokenCardPayment(req, res, next) {
    try {
      req.body.client_key = process.env.MIDTRANS_CLIENT_KEY;
      let paymentDetail = await tokenPayment(req.body);

      return res.status(201).json({ paymentDetail });
    } catch (error) {
      next(error);
    }
  }

  async paymentHandling(req, res, next) {
    try {
      midtransSnap.transaction
        .notification(req.body)
        .then(async (statusResponse) => {
          let orderId = statusResponse.order_id;
          let transactionStatus = statusResponse.transaction_status;
          let fraudStatus = statusResponse.fraud_status;

          if (transactionStatus == "capture") {
            if (fraudStatus == "challenge") {
              await payment.update(
                { transaction_status: "challenge" },
                { where: { id: orderId } }
              );
            } else if (fraudStatus == "accept") {
              await payment.update(
                { transaction_status: "success" },
                { where: { id: orderId } }
              );
            }
          } else if (transactionStatus == "settlement") {
            await payment.update(
              { transaction_status: "success" },
              { where: { id: orderId } }
            );
          } else if (
            transactionStatus == "cancel" ||
            transactionStatus == "deny" ||
            transactionStatus == "expire"
          ) {
            await payment.update(
              { transaction_status: "failure" },
              { where: { id: orderId } }
            );
          } else if (transactionStatus == "pending") {
            await payment.update(
              { transaction_status: "pending" },
              { where: { id: orderId } }
            );
          }

          const paymentStatus = await payment.findOne({
            where: { id: orderId },
          });

          const dataDonate = await donate.findOne({
            where: { paymentId: paymentStatus.id },
          });

          if (paymentStatus.transaction_status === "success") {
            let dataCampaign = await campaign.findOne({
              where: {
                id: dataDonate.campaignId,
              },
            });

            const kurang =
              parseInt(dataCampaign.deviation) -
              parseInt(statusResponse.gross_amount);
            const tambah =
              parseInt(dataCampaign.collected) +
              parseInt(statusResponse.gross_amount);

            const tambahSaldo =
              parseInt(dataCampaign.availSaldo) +
              parseInt(statusResponse.gross_amount);

            await donate.update(
              {
                amount: parseInt(statusResponse.gross_amount),
              },
              { where: { paymentId: paymentStatus.id } }
            );

            await campaign.update(
              {
                deviation: kurang,
                collected: tambah,
                availSaldo: tambahSaldo,
              },
              {
                where: {
                  id: dataDonate.campaignId,
                },
              }
            );
          }

          return res.status(200).json(paymentStatus);
        });
    } catch (error) {
      next(error);
    }
  }

  async showStatusPayment(req, res, next) {
    try {
      const statusPayment = await donate.findAll(
        {
          attributes: ["amount", "name", "message", "createdAt", "updatedAt"],
          include: [
            {
              model: payment,
            },
          ],
          limit: 20,
          order: [["createdAt", "DESC"]],
        },
        { where: { userId: req.loginUser.data.id } }
      );

      return res
        .status(200)
        .json({ status: 200, message: ["success load data"], statusPayment });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new Donate();
