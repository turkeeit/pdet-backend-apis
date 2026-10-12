require("dotenv").config();
const connection = require("../config/dbconfig");

async function sendOtp(req, res) {
  console.log("inside verify signature ");
  console.log(req.headers);
  const mobile_number = req.headers.mobilenumber;
  console.log(mobile_number);
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  console.log(`otp is`, otp);
  let expiration_time = Date.now() + 24 * 60 * 60 * 1000;
  console.log(`expiration time is `, expiration_time);
  let is_used = "false";
  try {
    // const message = await client.messages.create({
    //   body: `Your OTP is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: "+91" + mobile_number,
    // });

    // const message = await sendOtpOnMobile(mobile_number, otp);
    const message = { data: "true" };
    if (message && message.data) {
      let query = `INSERT INTO user_otps(mobile, otp, expires_at, is_verified)
             VALUES('${mobile_number}', '${otp}', DATE_ADD(NOW(), INTERVAL 24 HOUR), false)`;
      await connection.query(query, function (err, results) {
        if (err) {
          console.log(`error in execution of query`, err);
          return;
        }
        console.log("otp is inserted with id", results);
        res.status(200).json({ message: "OTP sent successfully!" });
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send OTP", details: error.message });
  }
}

async function sendOtpOnMobile(mobileNumber, otp) {
  const message = `Your OTP is ${otp}. Do not share it.`;
  console.log("send otp ");
  try {
    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization:
          "x3URC5j9bXPEcOW7yZzIlM2uHiBSv8fmkwG0rgtKhNA4qFpLQ1nkJuqtYfc7rZRsMpyI9vWAx54adPSK",
        sender_id: "FSTSMS",
        message: message,
        language: "english",
        route: "q",
        numbers: mobileNumber,
      },
      headers: {
        "cache-control": "no-cache",
      },
    });

    console.log(response.data);
    return response;
  } catch (error) {
    console.error("Error sending OTP:", error.response?.data || error.message);
    return null;
  }
}

module.exports = sendOtp;
