const Upload = require("../../middleware/UploadImage");
const {
  userUploadFiles,
  userRegistration,
  userResentOtp,
  userBioAndLinks,
  userPinAuthentication,
  userLogin,
  updateOperation,
} = require("./users.controller");
const router = require("express").Router();

const mediaUplaod = Upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

// console.log(mediaUplaod) 

router.post("/", userRegistration);
router.patch("/resendOTP/:_id", userResentOtp);
router.patch("/details/:_id", userBioAndLinks)
router.post('/otpVerified/', userPinAuthentication)
router.post('/login/', userLogin)
router.patch('/Update/:_id/:option', updateOperation)

router.put("/media/:_id", mediaUplaod, userUploadFiles);

module.exports = router;
