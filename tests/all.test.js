const request = require("supertest");
const path = require("path");

const app = require("../app");
const { user, campaign, category, payment, comment } = require("../models");
const { encodePin } = require("../utils/bcrypt");

jest.setTimeout(50000);

let token;
let categoryId;
let userId;
let campaignId = [];
let paymentId = [];
const fakeImage = path.resolve(__dirname, `./test.jpeg`);

beforeAll(async () => {
  try {
    const hashPassword = encodePin("Rahasiaaa1@");
    let data = await user.create({
      name: "Dena",
      email: "dena@gmail.com",
      password: hashPassword,
    });
    userId = data.id;
  } catch (error) {
    return console.log(error);
  }
});
afterAll((done) => {
  payment
    .destroy({ where: {}, force: true })
    .then(() => {
      done();
    })
    .catch((err) => {
      done(err);
    });

  comment
    .destroy({ where: {}, force: true })
    .then(() => {
      done();
    })
    .catch((err) => {
      done(err);
    });

  campaign
    .destroy({ where: {}, force: true })
    .then(() => {
      done();
    })
    .catch((err) => {
      done(err);
    });

  category
    .destroy({ where: {}, force: true })
    .then(() => {
      done();
    })
    .catch((err) => {
      done(err);
    });

  user
    .destroy({ where: {}, force: true })
    .then(() => {
      done();
    })
    .catch((err) => {
      done(err);
    });
});

describe("User API", () => {
  describe("Successfully create user", () => {
    it("Should return 201 and obj (user)", (done) => {
      const hashPassword = encodePin("Rahasiaaa1@");
      let input = {
        name: "Dena",
        email: "dena@yahoo.com",
        password: hashPassword,
        confirmPassword: hashPassword,
      };
      request(app)
        .post("/register")
        .send(input)
        .then((response) => {
          const { body, status } = response;
          expect(status).toBe(201);
          expect(body).toHaveProperty("dataUser");
          expect(body).toHaveProperty("token");
          expect(body).toHaveProperty("message");
          expect(typeof body.dataUser).toBe("object");
          expect(typeof body.token).toBe("string");
          expect(body.message).toEqual(
            expect.arrayContaining(["Your account has been created"])
          );
          // userId = response.body.dataUser.id;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Email already registered", () => {
    it("Should return 400 and error messages", (done) => {
      let input = {
        name: "Dena",
        email: "dena@gmail.com",
        password: "Rahasiaaa1@",
        confirmPassword: "Rahasiaaa1@",
      };
      request(app)
        .post("/register")
        .send(input)
        .then((response) => {
          const { body, status } = response;
          expect(status).toBe(400);
          expect(body.errors).toEqual(
            expect.arrayContaining(["Email already registered!"])
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("cannot register", () => {
    it("Should return 404 and show error", (done) => {
      let input = {
        name: "",
        email: "a",
        password: "Rahasiaaa1@",
        confirmPassword: "Rahasiaaa1!",
      };
      request(app)
        .post("/register")
        .send(input)
        .then((response) => {
          const { body, status } = response;
          expect(status).toBe(400);
          expect(body.errors).toEqual(
            expect.arrayContaining([
              "Please input the Name!",
              "Email is not valid",
              "password and confirm password didn't match!",
            ])
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Success login: ", () => {
    it("Should return 200 and access_token", (done) => {
      let input = {
        email: "dena@gmail.com",
        password: "Rahasiaaa1@",
      };
      request(app)
        .post("/login")
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("token");
          expect(typeof body.token).toBe("string");
          token = response.body.token;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("edit profile", () => {
    it("Should return 201 and edit success", (done) => {
      let input = {
        name: "dena",
        bankName: "BNI",
        bankAccount: "123456",
      };
      request(app)
        .patch("/profile/update")
        .set({ access_token: token })
        .send(input)
        .then((response) => {
          const { body, status } = response;
          expect(status).toBe(201);
          expect(typeof body.data).toBe("object");
          expect(body.message).toEqual(
            expect.arrayContaining(["Your profil has been updated!"])
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("update token:", () => {
    it("Should return 200 and access_token", (done) => {
      let input = {
        email: "dena@gmail.com",
        password: "Rahasiaaa1@",
      };
      request(app)
        .post("/login")
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("token");
          expect(typeof body.token).toBe("string");
          token = response.body.token;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Failed:", () => {
    describe("Wrong email", () => {
      it("Should return 401 and 'Please signup first!", (done) => {
        let input = {
          email: "jajaja@outlook.co.id",
          password: "Rahasiaaa1@",
        };
        request(app)
          .post("/login")
          .send(input)
          .then((response) => {
            let { body, status } = response;
            expect(status).toBe(401);
            expect(body).toHaveProperty("message");
            expect(body.message).toBe("Please signup first!");
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });
  });

  describe("Wrong password", () => {
    it("Should return 400 and 'Please input password correctly!'", (done) => {
      let input = {
        email: "dena@gmail.com",
        password: "Rahasiaaa1!",
      };
      request(app)
        .post("/login")
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(400);
          expect(body).toHaveProperty("message");
          expect(body.message).toBe("Please input password correctly!");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Email or password is not found or empty", () => {
    it("Should return 400 and 'Please input email correctly'", (done) => {
      let input = {
        email: "",
      };
      request(app)
        .post("/login")
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(400);
          expect(body).toHaveProperty("message");
          expect(body.message).toBe("Please input email correctly!");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Success get detail user:", () => {
    it("Should return 200 and user data", (done) => {
      request(app)
        .get("/profile")
        .set({ access_token: token })
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("data");
          expect(typeof body.data).toBe("object");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});

describe("category API:", () => {
  describe("Success create category:", () => {
    it("Should return 201 and category has been created", (done) => {
      let input = {
        category: "Medical",
        quotes: "abc",
        categoryImage: " ",
      };
      request(app)
        .post("/category")
        .set({ access_token: token })
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(201);
          expect(body).toHaveProperty("success");
          expect(body).toHaveProperty("message");
          expect(body).toHaveProperty("data");
          expect(body.success).toBe(true);
          expect(body.message).toBe("Success create category");
          expect(typeof body.data).toBe("object");
          categoryId = response.body.data.id;
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Get all category:", () => {
    it("Should return 200 and show all categories", (done) => {
      request(app)
        .get("/category")
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("success");
          expect(body).toHaveProperty("message");
          expect(body).toHaveProperty("data");
          expect(body.success).toBe(true);
          expect(body.message).toBe(`Success get all category`);
          expect(typeof body.data).toBe("object");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});

describe("campaign API:", () => {
  beforeAll(async () => {
    try {
      for (let i = 0; i < 5; i++) {
        let data = await campaign.create({
          image: "image.jpg",
          title: "abc",
          goal: "2000000",
          deviation: "1000000",
          collected: "1000000",
          dueDate: "2022-01-20",
          story: "abc",
          status: "open",
          userId,
          categoryId,
          share: 0,
          availSaldo: "1000000",
        });
        campaignId.push(data.id);
      }
    } catch (error) {
      return console.log(error);
    }
  });

  describe("Success get homepage:", () => {
    it("Should return 200 and show campaign", (done) => {
      request(app)
        .get("/")
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("trendingCampaign");
          expect(body).toHaveProperty("newCampaign");
          expect(typeof body.trendingCampaign).toBe("object");
          expect(typeof body.newCampaign).toBe("object");

          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Success get discover all:", () => {
    it("Should return 200 and show all campaign", (done) => {
      request(app)
        .get("/discover/all")
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("dataNewest");
          expect(body).toHaveProperty("gainedMomentum");
          expect(body).toHaveProperty("dataUrgent");
          expect(typeof body.dataNewest).toBe("object");
          expect(typeof body.gainedMomentum).toBe("object");
          expect(typeof body.dataUrgent).toBe("object");

          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  // describe("Success create campaign:", () => {
  //   it("Should return 201 and campaign has been created", (done) => {
  //     request(app)
  //       .post("/campaign")
  //       .set({ access_token: token })
  //       .attach("image", fakeImage)
  //       .field("title", "peduli bencana")
  //       .field("goal", "200000000")
  //       .field("dueDate", "2022-01-20")
  //       .field("story", "peduli bencana")
  //       .field("categoryId", categoryId)
  //       .then((response) => {
  //         let { body, status } = response;
  //         console.log("ini respon", response);
  //         expect(status).toBe(201);
  //         expect(body).toHaveProperty("message");
  //         expect(body).toHaveProperty("data");
  //         expect(body.message).toEqual(
  //           expect.arrayContaining(["Campaign was created!"])
  //         );
  //         expect(typeof body.data).toBe("object");
  //         done();
  //       })
  //       .catch((err) => {
  //         done(err);
  //       });
  //   });
  // });

  // describe("Success edit campaign:", () => {
  //   it("Should return 201 and campaign has been updated", (done) => {
  //     request(app)
  //       .patch(`/discover/edit/${campaignId[0]}`)
  //       .set({ access_token: token })
  //       .field("title", "peduli bencana alam di semeru")
  //       .field("goal", "300000000")
  //       .field("dueDate", "2022-04-20")
  //       .field("story", "peduli bencana alam")
  //       .then((response) => {
  //         let { body, status } = response;
  //         console.log("ini respon", response);
  //         expect(status).toBe(201);
  //         expect(body).toHaveProperty("message");
  //         expect(body).toHaveProperty("data");
  //         expect(body.message).toEqual(
  //           expect.arrayContaining(["Campaign has been updated!"])
  //         );
  //         expect(typeof body.data).toBe("object");
  //         done();
  //       })
  //       .catch((err) => {
  //         done(err);
  //       });
  //   });
  // });

  describe("failed create campaign:", () => {
    it("Should return 404 and please upload the image", (done) => {
      request(app)
        .post("/campaign")
        .set({ access_token: token })
        .field("title", "")
        .field("goal", "a")
        .field("dueDate", "202")
        .field("story", "peduli bencana")
        .field("categoryId", categoryId)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(404);
          expect(body).toHaveProperty("errors");
          expect(body.errors).toEqual(
            expect.arrayContaining([
              "Please upload the image",
              `Title can't be empty`,
              "Goal must be a number!",
              "Please input due date correctly!",
            ])
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Success get discover by category:", () => {
    it("Should return 200 and get discover by category", (done) => {
      request(app)
        .get(`/discover/category?kategori=${categoryId}&sort=Less donation`)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("totalItems");
          expect(body).toHaveProperty("campaigns");
          expect(body).toHaveProperty("totalPages");
          expect(body).toHaveProperty("currentPage");
          expect(body).toHaveProperty("prevPage");
          expect(body).toHaveProperty("nextPage");
          expect(typeof body.totalItems).toBe("number");
          expect(typeof body.campaigns).toBe("object");
          expect(typeof body.totalPages).toBe("number");
          expect(typeof body.currentPage).toBe("number");
          expect(typeof body.prevPage).toBe("number");
          expect(typeof body.nextPage).toBe("number");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Success get discover by related category:", () => {
    it("Should return 200 and get discover by related category", (done) => {
      request(app)
        .get(`/discover/related/${categoryId} `)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("data");
          expect(typeof body.data).toBe("object");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Success get discover by search:", () => {
    it("Should return 200 and get discover by search", (done) => {
      request(app)
        .get(`/discover/search?search=a&page=1`)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("totalItems");
          expect(body).toHaveProperty("campaigns");
          expect(body).toHaveProperty("totalPages");
          expect(body).toHaveProperty("currentPage");
          expect(body).toHaveProperty("prevPage");
          expect(body).toHaveProperty("nextPage");
          expect(typeof body.totalItems).toBe("number");
          expect(typeof body.campaigns).toBe("object");
          expect(typeof body.totalPages).toBe("number");
          expect(typeof body.currentPage).toBe("number");
          expect(typeof body.prevPage).toBe("number");
          expect(typeof body.nextPage).toBe("number");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("Success get detail campagin:", () => {
    it("Should return 200 and get detal campaign", (done) => {
      request(app)
        .get(`/discover/details/${campaignId[0]}`)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("detailCampaign");
          expect(body).toHaveProperty("jumlahGoal");
          expect(body).toHaveProperty("jumlahCollected");
          expect(body).toHaveProperty("jumlahAvailSaldo");
          expect(body).toHaveProperty("remainingTime");
          expect(body).toHaveProperty("updateCampaign");
          expect(body).toHaveProperty("donatur");
          expect(body).toHaveProperty("komen");
          expect(body).toHaveProperty("related");
          expect(typeof body.detailCampaign).toBe("object");
          expect(typeof body.jumlahGoal).toBe("string");
          expect(typeof body.jumlahCollected).toBe("string");
          expect(typeof body.jumlahAvailSaldo).toBe("string");
          expect(typeof body.remainingTime).toBe("number");
          expect(typeof body.updateCampaign).toBe("object");
          expect(typeof body.donatur).toBe("object");
          expect(typeof body.komen).toBe("object");
          expect(typeof body.related).toBe("object");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});

describe("Comment API", () => {
  beforeAll(() => {
    for (let i = 0; i < 5; i++) {
      comment.create({
        comment: "abc",
        userId,
        campaignId: campaignId[0],
      });
    }
  });

  describe("Success create comment:", () => {
    it("Should return 201 and comment has been created", (done) => {
      let input = {
        comment: "abc",
      };
      request(app)
        .post(`/comment/${campaignId[0]}`)
        .set({ access_token: token })
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(201);
          expect(body).toHaveProperty("data");
          expect(body).toHaveProperty("message");
          expect(typeof body.data).toBe("object");
          expect(body.message).toEqual(
            expect.arrayContaining(["Success add your comment"])
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("get all comment:", () => {
    it("Should return 200 and show all comment", (done) => {
      request(app)
        .get(`/comment?id=${campaignId[0]}`)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(200);
          expect(body).toHaveProperty("totalComment");
          expect(body).toHaveProperty("success");
          expect(body).toHaveProperty("commentTime");
          expect(body).toHaveProperty("message");
          expect(body).toHaveProperty("data");
          expect(typeof body.totalComment).toBe("number");
          expect(typeof body.success).toBe("boolean");
          expect(typeof body.commentTime).toBe("object");
          expect(body.message).toBe("Success get all comment data");
          expect(typeof body.data).toBe("object");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});

describe("Donate API", () => {
  beforeAll(async () => {
    try {
      for (let i = 0; i < 5; i++) {
        let data = await payment.create({
          method: "Bank Transfer",
        });
        paymentId.push(data.id);
      }
    } catch (error) {
      return console.log(error);
    }
  });

  // describe("Success create donate:", () => {
  //   it("Should return 201 and donate has been created", (done) => {
  //     let a = campaignId[0];
  //     let b = paymentId[0];
  //     let input = {
  //       amount: "100000",
  //       name: "Dena",
  //       message: "Semoga membantu",
  //       method: "Bank Transfer",
  //       userId,
  //       campaignId: a,
  //       paymentId: b,
  //     };
  //     console.log("ini payment", a);
  //     console.log("ini campaign", b);
  //     request(app)
  //       .post(`/charge/${a}`)
  //       .set({ access_token: token })
  //       .send(input)
  //       .then((response) => {
  //         let { body, status } = response;
  //         console.log("ini response", response);
  //         expect(status).toBe(200);
  //         expect(body).toHaveProperty("dataDonate");
  //         expect(body).toHaveProperty("paymentDetail");
  //         expect(body).toHaveProperty("message");
  //         expect(typeof body.dataDonate).toBe("object");
  //         expect(typeof body.paymentDetail).toBe("object");
  //         expect(body.message).toEqual(
  //           expect.arrayContaining(["Success add your Donations"])
  //         );
  //         done();
  //       })
  //       .catch((err) => {
  //         done(err);
  //       });
  //   });
  // });

  describe("cannot donate:", () => {
    it("Should return 404 and amount cannot empty!", (done) => {
      let input = {
        amount: "",
        name: "Dena",
        message: "Semoga membantu",
        method: "Bank Transfer",
        userId,
        campaignId: userId[0],
        paymentId: paymentId[0],
      };
      request(app)
        .post(`/charge/${campaignId[0]}`)
        .set({ access_token: token })
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(404);
          expect(body).toHaveProperty("errors");
          expect(body.errors).toEqual(
            expect.arrayContaining(["amount cannot empty!"])
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("cannot donate:", () => {
    it("Should return 404 and amount must be a number", (done) => {
      let input = {
        amount: "a",
        name: "",
        message: "Semoga membantu",
        method: "Credit or Debit Card",
        card_number: "",
        card_exp_month: "",
        card_exp_year: "",
        card_cvv: "a",
        userId,
        campaignId: userId[0],
        paymentId: paymentId[0],
      };
      request(app)
        .post(`/charge/${campaignId[0]}`)
        .set({ access_token: token })
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(404);
          expect(body).toHaveProperty("errors");
          expect(body.errors).toEqual(
            expect.arrayContaining([
              "amount must be a number!",
              "name cannot empty!",
              "Card number cannot empty!",
              "Expired date cannot empty!",
              "Expired date cannot empty!",
              "Please input cvv number correctly!",
              "Please input cvv number correctly!",
            ])
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("get all donate:", () => {
    it("Should return 200 and show all donate", (done) => {
      request(app)
        .get(`/allDonate?id=${campaignId[0]}`)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(404);
          expect(body).toHaveProperty("message");
          expect(body.message).toBe(`You haven't donate yet!`);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});

describe("Update API", () => {
  describe("Success create update:", () => {
    it("Should return 201 and update campaign has been created", (done) => {
      let input = {
        update: "abc",
        amount: "50000",
        userId,
        campaignId: [0],
      };
      request(app)
        .post(`/update/${campaignId[0]}`)
        .set({ access_token: token })
        .send(input)
        .then((response) => {
          let { body, status } = response;
          expect(status).toBe(201);
          expect(body).toHaveProperty("data");
          expect(body).toHaveProperty("message");
          expect(typeof body.data).toBe("object");
          expect(body.message).toEqual(
            expect.arrayContaining(["Update campaign success !"])
          );
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
