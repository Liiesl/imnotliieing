// functions/qr-scanner.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.handler = async (event, context) => {
  try {
    // Check if the request method is POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    // Parse the incoming request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }

    const fileUrl = body.fileurl; // URL of the QR code image
    const fileData = body.file; // Base64-encoded file data

    // Validate input
    if (!fileUrl && !fileData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No fileurl or file provided' }),
      };
    }

    // Case 1: Use fileurl parameter (publicly accessible image URL)
    if (fileUrl) {
      const apiResponse = await axios.get('https://api.qrserver.com/v1/read-qr-code/', {
        params: {
          fileurl: fileUrl, // Pass the image URL to the API
        },
      });

      return {
        statusCode: 200,
        body: JSON.stringify(apiResponse.data),
      };
    }

    // Case 2: Use file parameter (base64-encoded file data)
    if (fileData) {
      // Decode the base64 file data
      const buffer = Buffer.from(fileData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      // Create a form-data object for multipart file upload
      const formData = new FormData();
      formData.append('file', buffer, { filename: 'qr-code.png', contentType: 'image/png' });

      // Make a POST request to the goQR.me API
      const apiResponse = await axios.post('https://api.qrserver.com/v1/read-qr-code/', formData, {
        headers: formData.getHeaders(),
      });

      return {
        statusCode: 200,
        body: JSON.stringify(apiResponse.data),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to scan QR code' }),
    };
  }
};