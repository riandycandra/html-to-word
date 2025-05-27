
const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const tenantId = process.env.TENANT_ID || '<TENANT_ID>';
const clientId = process.env.CLIENT_ID || '<CLIENT_ID>';
const clientSecret = process.env.CLIENT_SECRET || '<CLIENT_SECRET>';
const axios = require('axios');
const userUPN = process.env.USER_UPN || '<USER_UPN>';

const convertHtmlToPdf = async (officialScriptIdentities) =>{
  let content = `<style>.fr-fir {float: right !important;margin-left: 10px;}</style>`;

    content += officialScriptIdentities.Content;

    // return res.send(content);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(content, {
      waitUntil: 'networkidle0',
    });

    let bodyHeight = await page.evaluate(() => {
      return document.documentElement.scrollHeight;
    });

    if(bodyHeight > 2000) {
      bodyHeight = bodyHeight * 1.2; // Limit height to 2000px
    }

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: '210mm',
      height: `${bodyHeight}px`,
      margin: {
        top: '1.5cm',
        bottom: '1.5cm',
        left: '2.5cm',
        right: '2.5cm',
      },
    });

    await browser.close();

    const filePath = `./temp/${officialScriptIdentities.Number}.pdf`;
    await fs.promises.writeFile(filePath, pdfBuffer);
    return {
      filePath,
      contentType: 'application/pdf',
      fileName: `${officialScriptIdentities.Number}.pdf`
    };
}

const convertPdfToDocx = async (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));

  const docxFileName = await new Promise((resolve, reject) => {
    exec(`python3 convert.py "${filePath}" "./temp/${fileName}.docx"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting PDF to DOCX: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return reject(error);
      }

      if (stderr) {
        // Just log, don't treat as fatal unless you want to
        console.warn(`Conversion warning (stderr): ${stderr}`);
      }

      console.log(`Conversion stdout: ${stdout}`);
      resolve(`${fileName}.docx`);
    });
  });

  return `./temp/${docxFileName}`;
};

// upload to OneDrive - START
const getAccessToken = async () => {
  const { data } = await axios.post(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, new URLSearchParams({
    client_id: clientId,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  }));

  return data.access_token;
}

const uploadFile = async (accessToken, filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath);

  const uploadUrl = `https://graph.microsoft.com/v1.0/users/${userUPN}/drive/root:/Uploads/${fileName}:/content`;

  const { data } = await axios.put(uploadUrl, fileContent, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
  });

  console.log('Upload successful:', data.webUrl);

  return data.webUrl;
}

const createPublicLink = async (accessToken, userUPN, itemPath) => {
  const url = `https://graph.microsoft.com/v1.0/users/${userUPN}/drive/root:/${itemPath}:/createLink`;

  const { data } = await axios.post(url, {
    type: 'view',          // or 'edit'
    scope: 'anonymous'
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('Public link:', data.link.webUrl);
  return data.link.webUrl;
}

const uploadToOneDrive = async (filePath) => {
  try {
    let fileName = path.basename(filePath);
    const token = await getAccessToken();
    const fileUrl = await uploadFile(token, filePath, fileName);
    const publicLink = await createPublicLink(token, userUPN, 'Uploads/' + fileName);

    return {
      fileUrl,
      publicLink
    };
  } catch (err) {
    console.error('Upload failed:', err.response?.data || err.message);
  }
}
// upload to OneDrive - END

const deleteFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
    console.log(`File deleted: ${filePath}`);
  }
  catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
}

module.exports = {
  convertHtmlToPdf,
  convertPdfToDocx,
  uploadToOneDrive,
  deleteFile
}