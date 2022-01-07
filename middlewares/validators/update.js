const validator = require("validator");
const { campaign } = require("../../models");

exports.createUpdateValidators = async (req, res, next) => {
  try {
    const errors = [];
    const findCampaign = await campaign.findOne({
      where: { id: req.params.id },
    });
    req.body.userId = req.loginUser.data.id;
    req.body.campaignId = req.params.id;

    if (findCampaign.userId !== req.loginUser.data.id) {
      errors.push("You cannot withdrawl in this campaign!");
    }

    if (validator.isEmpty(req.body.update, { ignore_whitespace: true })) {
      errors.push("Please tell your story!");
    }

    if (req.body.amount) {
      if (
        !validator.isInt(req.body.amount) ||
        validator.isEmpty(req.body.amount, { ignore_whitespace: true }) ||
        req.body.amount == ""
      ) {
        errors.push("Amount must be a number!");
      } else if (validator.isInt(req.body.amount) && req.body.amount !== "") {
        if (parseInt(findCampaign.availSaldo) < parseInt(req.body.amount)) {
          errors.push(
            "You cannot withdrawl because balance of collected amount donations is not enough !"
          );
        } else {
          const sisaSaldo =
            parseInt(findCampaign.availSaldo) - parseInt(req.body.amount);
          campaign.update(
            { availSaldo: sisaSaldo },
            { where: { id: req.body.campaignId } }
          );
        }
      }
    } else {
      req.body.amount = 0;
    }

    if (req.loginUser.data.bankName === null) {
      errors.push("Please update your bank name!");
    }
    if (req.loginUser.data.bankAccount === null) {
      errors.push("Please update your bank account!");
    }
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors });
    }

    next();
  } catch (error) {
    next(error);
  }
};
