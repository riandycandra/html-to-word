const { body } = require('express-validator');
const {
  OfficialScriptIdentities
} = require('../../Models');

const puppeteer = require('puppeteer');
const fs = require('fs');

const show = async (req, res) => {
  console.log(req.params.number)
  try {
    const officialScriptIdentities = await OfficialScriptIdentities.findOne({
      where: {
        Id: req.params.number
      }
    });
    
    if (!officialScriptIdentities) {
      return res.status(404).json({ error: 'Official script identity not found' });
    }

    let content = `<style>.fr-fir {float: right !important;margin-left: 10px;}</style>`;

    content += officialScriptIdentities.Content;

    // return res.send(content);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(content, {
      waitUntil: 'networkidle0',
    });


    const realHeight = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;

      return [body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight];
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

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="output.pdf"',
      'Content-Length': pdfBuffer.length,
    });
    return res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error fetching official script identities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const toDocx = async (req, res) => {
  return res.status(501).json({ error: 'Not implemented yet' });
}

module.exports = {
  show,
  toDocx
}