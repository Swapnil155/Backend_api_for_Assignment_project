require("../../Database/DB");
const { User, UserDetails } = require("./users.model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");

function generateOTP() {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

async function sendEmailOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let details = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "One Time Password",
    text: `OTP : ${otp}`,
  };

  // return transporter.sendMail(details, (err) => {
  //     if (err) {
  //         console.log("it has an err", err);
  //     } else {
  //         console.log("email send");
  //         return `email send`;
  //     }
  // });

  return transporter.sendMail(details);
}

module.exports = {
  userRegistration: async (req, res) => {
    const { fullname, email, dob, location, password } = req.body;

    let isExist = await User.findOne({ email: email });

    if (isExist) {
      return res.status(400).json({
        Error: [
          {
            email: email,
            inputType: `email`,
            message: `User already exist`,
          },
        ],
      });
    } else {
      console.log(req.body);
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);

      console.info(`salt: ${salt} \n hashpassword : ${hashpassword}`);

      try {
        const userDetails = UserDetails({
          fullname: fullname,
          location: location,
          DOB: dob,
        });

        const resultDetails = await userDetails.save();

        const otp = generateOTP();
        const sendOtpInEmail = sendEmailOTP(email, otp);

        const hashOtp = await bcrypt.hash(otp, salt);

        const data = User({
          email: email,
          password: hashpassword,
          pin: hashOtp,
          user_exist: true,
          userDetails: resultDetails,
        });

        const userdata = await data.save();
        console.info(`User Successfully \n ${userdata}`);

        const userInfo = await User.findOne({ _id: userdata._id }).populate(
          "userDetails"
        );
        if (userdata) {
          return res.status(200).json({
            message: `Sucessfully inserted`,
            user: userInfo,
          });
        }
      } catch (error) {
        console.log(error.message);
        return res.status(503).json({
          Error: [
            {
              error: error.message,
              message: `Please contact to adminstator`,
            },
          ],
        });
      }
    }
  },

  userLogin: async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
      const userData = await User.findOne({ email: email });
      console.log(userData);

      if (!userData) {
        return res.status(400).json({
          Error: [
            {
              inputType: `email`,
              message: `Email invalid`,
            },
          ],
        });
      } else {
        if (userData.user_exist) {
          let isMatch = await bcrypt.compare(password, userData.password);

          if (!isMatch) {
            return res.status(401).json({
              Error: [
                {
                  inputType: `password`,
                  message: `Password is invalid`,
                },
              ],
            });
          } else {
            const data = await User.findOne({ _id: userData._id }).populate(
              "userDetails"
            );
            res.cookie("user", data);
            return res.status(200).json({
              message: `Successfully login`,
              user: data,
            });
          }
        } else {
          return res.status(403).json({
            Error: [
              {
                inputType: `email`,
                message: `Your account as been deleted please contact us`,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }
  },

  userPinAuthentication: async (req, res) => {
    const { email, otp } = req.body;

    try {
      let isExist = await User.findOne({ email: email });

      if (!isExist) {
        return res.status(400).json({
          Error: [
            {
              message: `user not exist`,
            },
          ],
        });
      } else {
        // console.log(isExist.pin)
        // var pin = isExist.pin
        // const isValidOtp = pin.includes(otp)
        // console.log(pin.includes(otp))

        let isMatch = await bcrypt.compare(otp, isExist.pin);

        if (isMatch) {
          return res.status(200).json({
            message: `Otp Success verified`,
            vaild: isMatch,
            user: isExist,
          });
        } else {
          return res.status(401).json({
            Error: [
              {
                inputType: `pin`,
                message: `Pin dose not match`,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }
  },

  userResentOtp: async (req, res) => {
    const { _id } = req.params;
    const { email } = req.body;

    try {
      let isExist = await User.findOne({ email: email });

      if (isExist) {
        const otp = generateOTP();

        const salt = await bcrypt.genSalt(10);
        const hashOtp = await bcrypt.hash(otp, salt);

        if (isExist._id != _id) {
          return res.status(403).json({
            message: `id not match`,
            id: _id,
          });
        }

        const updateOtp = await User.findByIdAndUpdate(
          _id,
          {
            $set: { pin: hashOtp },
          },
          { new: true }
        );

        const result = await sendEmailOTP(email, otp);
        console.log(result);
        return res.status(200).json({
          message: `Successfully resend a OTP`,
          user: updateOtp,
          result: result,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }

    // if (!result) {
    //     return res.status(400).json({
    //         Error : [
    //             {
    //                 inputType : `pin`,
    //                 message : `Pin not Send`
    //             }
    //         ]
    //     })
    // } else {
    //     return res.status(200).json({
    //         message : `Pin send to Autherised mail address`
    //     })
    // }
  },

  userUploadFiles: async (req, res) => {
    const { _id } = req.params;
    const { gender } = req.body;

    // console.log(JSON.stringify(req.file.profileImage))
    // // console.log(req.file.buffer.toString())
    // console.log(`/tmp/${req.file.profileImage}`)
    // // console.log(JSON.stringify(req.files === ''))

    // const file = req.file;

    // Write file to /tmp directory
    // const filePath = `/tmp/${file.originalname}`;
    // fs.writeFile(filePath, file.buffer, (err) => {
    //     if (err) {
    //         console.error(err);
    //         return res.status(500).send('Error uploading file');
    //     }
    //     res.send('File uploaded successfully!');
    // });

    if (req.files === undefined) {
      return res.status(400).json({
        Error: [
          {
            message: `You must select a file`,
          },
        ],
      });
    } else {
      const userImage = req.files.profileImage[0];

      const userVideo = req.files.video[0];

      // console.log(userImage)

      //   return res.status(200).json({
      //     message: `Files Successfully inserted`,
      //     url1: req.protocol + req.hostname,
      //     url2: req.protocol + "s://" + req.get("Host"),
      //     image: userImage,
      //     video: userVideo,
      //   });

      const UpdateMedia = await UserDetails.findByIdAndUpdate(
        _id,
        {
          $set: {
            Gender: gender,
            media: {
              image: `https://backend-api-for-assignment.onrender.com/${req.files.profileImage[0].filename}`,
              video: `https://backend-api-for-assignment.onrender.com/${req.files.video[0].filename}`,
            },
          },
        },
        { new: true }
      );

      if (!UpdateMedia) {
        return res.status(200).json({
          Error: [
            {
              message: `Failed`,
              data: UpdateMedia,
            },
          ],
        });
      } else {
        return res.status(200).json({
          message: `Files Successfully inserted`,
          data: UpdateMedia,
        });
      }
    }
  },

  userBioAndLinks: async (req, res) => {
    const { Bio, linkedln, facebook } = req.body;
    const { _id } = req.params;

    try {
      const updateBioAndLinks = await UserDetails.findByIdAndUpdate(
        _id,
        {
          $set: {
            bio: Bio,
            links: {
              linkedln: linkedln,
              facebook: facebook,
            },
          },
        },
        { new: true }
      );

      if (!updateBioAndLinks) {
        return res.status(400).json({
          Error: [
            {
              message: `Data Not found`,
            },
          ],
        });
      } else {
        return res.status(200).json({
          message: `Data update successfully`,
          _id: _id,
          user: updateBioAndLinks,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }
  },

  updateOperation: async (req, res) => {
    const { _id, option } = req.params;
    const body = req.body;

    if (!body || !req.params) {
      return res.status(400).json({
        Error: [
          {
            message: `Something wrong`,
          },
        ],
      });
    }
    console.log(req.params);
    try {
      switch (option) {
        case "personal-details":
          const updateEmailDetails = await User.findByIdAndUpdate(
            _id,
            {
              $set: {
                email: body.email,
              },
            },
            { new: true }
          );

          if (!updateEmailDetails) {
            return res.status(400).json({
              Error: [
                {
                  message: `Data Not found`,
                  data: req.body,
                },
              ],
            });
          } else {
            const user_details_id = updateEmailDetails.userDetails;

            const updatePersonalDetails = await UserDetails.findByIdAndUpdate(
              user_details_id,
              {
                $set: {
                  fullname: body.fullname,
                  DOB: body.dob,
                  location: body.location,
                },
              },
              { new: true }
            );
            const user_all_Details = await User.findOne({ _id: _id }).populate(
              "userDetails"
            );

            if (!updatePersonalDetails) {
              return res.status(400).json({
                Error: [
                  {
                    error: `Data Not Update`,
                  },
                ],
              });
            }
            return res.status(200).json({
              message: `Data update successfully`,
              user: user_all_Details,
            });
          }

          break;

        case "change-password":
          // const changePassword = await userSchema.findByIdAndUpdate()
          try {
            const userData = await User.findById(_id);
            console.log(userData);
            if (!userData) {
              return res.status(400).json({
                Error: [
                  {
                    message: `user not found`,
                  },
                ],
              });
            } else {
              let isMatch = await bcrypt.compare(
                body.oldPassword,
                userData.password
              );

              if (!isMatch) {
                return res.status(401).json({
                  Error: [
                    {
                      inputType: `oldPassword`,
                      message: `Old password not match`,
                    },
                  ],
                });
              } else {
                const salt = await bcrypt.genSalt(10);
                const hashpassword = await bcrypt.hash(body.newPassword, salt);
                const set_new_password = await User.findByIdAndUpdate(
                  _id,
                  {
                    $set: {
                      password: hashpassword,
                    },
                  },
                  { new: true }
                );

                if (set_new_password) {
                  return res.status(200).json({
                    message: `password Successfully Updated`,
                    user: set_new_password,
                  });
                }
              }
            }

            return res.status(200).json({
              data: userData,
            });
          } catch (error) {
            console.log(error.message);
            return res.status(400).json({
              Error: [
                {
                  error: error.message,
                  message: `Please contact to adminstator`,
                },
              ],
            });
          }

          break;

        case "delete-account":
          const delete_account = await User.findByIdAndUpdate(
            _id,
            {
              $set: {
                reason: body.reson,
                user_exist: false,
              },
            },
            { new: true }
          );

          if (delete_account) {
            return res.status(200).json({
              message: `user accound successsfully deleted`,
              user: delete_account,
            });
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }
  },
};
