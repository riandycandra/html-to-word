const {
  OfficialScriptIdentities
} = require('../../Models');

const service = require('../../Services/OfficialScriptIdentitiesService');

const index = async (req, res) => {
  // load file index.html in views
  try {
    // instead of using a template engine, we can send a static HTML file
    res.sendFile('index.html', { root: 'views' });
  } catch (error) {
    console.error('Error rendering index page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const show = async (req, res) => {
  console.log(req.params.number)
  try {
    const officialScriptIdentities = await OfficialScriptIdentities.findOne({
      where: {
        [OfficialScriptIdentities.rawAttributes.Number.field]: req.params.number
      }
    });
    
    if (!officialScriptIdentities) {
      return res.status(404).json({ error: 'Official script identity not found' });
    }

    const result = await service.convertHtmlToPdf(officialScriptIdentities);
    const convert = await service.convertPdfToDocx(result.filePath);
    const upload = await service.uploadToOneDrive(convert);

    // delete the temporary files
    await service.deleteFile(result.filePath);
    await service.deleteFile(convert);

    return res.send({ result, convert, upload })
    
  } catch (error) {
    console.error('Error fetching official script identities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const toDocx = async (req, res) => {
  return res.status(501).json({ error: 'Not implemented yet' });
}

module.exports = {
  index,
  show,
  toDocx
}