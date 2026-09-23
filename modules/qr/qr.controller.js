const QRCode = require("qrcode");
const QR = require("./qr.model");

const TARGET_URL = "https://mpescapes.co.in/";

const generatePermanentQR = async (req, res) => {
  try {
    let existingQR = await QR.findOne({ targetUrl: TARGET_URL });

    if (existingQR) {
      return res.status(200).json({
        success: true,
        data: existingQR,
      });
    }

    const qrDataUrl = await QRCode.toDataURL(TARGET_URL, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      width: 2000,
    });

    const newQR = await QR.create({
      name: "MP Escapes Permanent QR",
      targetUrl: TARGET_URL,
      qrCodeImage: qrDataUrl,
    });

    res.status(201).json({
      success: true,
      data: newQR,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSavedQR = async (req, res) => {
  try {
    const qr = await QR.findOne({ targetUrl: TARGET_URL });

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    res.status(200).json({
      success: true,
      data: qr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const downloadQRImage = async (req, res) => {
  try {
    let qr = await QR.findOne({ targetUrl: TARGET_URL });

    if (!qr) {
      const qrDataUrl = await QRCode.toDataURL(TARGET_URL, {
        errorCorrectionLevel: "H",
        type: "image/png",
        margin: 2,
        width: 2000,
      });

      qr = await QR.create({
        name: "MP Escapes Permanent QR",
        targetUrl: TARGET_URL,
        qrCodeImage: qrDataUrl,
      });
    }

    const base64Data = qr.qrCodeImage.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="mpescapes-print-qr.png"',
      "Content-Length": imgBuffer.length,
    });

    res.send(imgBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generatePermanentQR,
  getSavedQR,
  downloadQRImage,
};