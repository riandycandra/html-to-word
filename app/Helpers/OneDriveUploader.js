const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const tenantId = process.env.TENANT_ID || '<TENANT_ID>'; // your tenant ID
const clientId = process.env.CLIENT_ID || '<CLIENT_ID>'; // your client ID
const clientSecret = process.env.CLIENT_SECRET || '<CLIENT_SECRET>'; // your client secret
const userUPN = process.env.USER_UPN || '<USER_UPN>'; // business UPN



(async () => {
  try {
    let fileName = 'output.docx';
    const token = await getAccessToken();
    await uploadFile(token, fileName);
    await createPublicLink(token, userUPN, 'Uploads/' + fileName);
  } catch (err) {
    console.error('Upload failed:', err.response?.data || err.message);
  }
})();
