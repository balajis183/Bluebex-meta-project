const axios = require("axios");

const sendOtpVia2Factor = async (phoneNumber, hashKey) => {
  const otp = Math.floor(10000 + Math.random() * 90000); // Generate 5-digit OTP

  const module = "TRANS_SMS";
  const apikey = process.env.TWO_FACTOR_API_KEY;
  const from = process.env.SENDER_ID;
  const to = `91${phoneNumber}`;
  const peid = process.env.PEID;
  const ctid = process.env.CTID;

  const msg = `${otp} is your verification code for Spiway. Do not share it with anyone. ${hashKey}\n\nRegards,\nBluebex Team`;

  const data = new URLSearchParams({
    module,
    apikey,
    to,
    from,
    msg,
    peid,
    ctid,
  });

  try {
    const response = await axios.post("https://2factor.in/API/R1/", data.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const resData = response.data;

    if (resData.Status === "Success") {
      return {
        status: "success",
        otp,
        details: resData.Details,
      };
    } else {
      return {
        status: "fail",
        message: "OTP sending failed",
      };
    }
  } catch (err) {
    console.error("OTP sending error:", err.message);
    throw new Error("OTP sending failed");
  }
};

module.exports = sendOtpVia2Factor;
