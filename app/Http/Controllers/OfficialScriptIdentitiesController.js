const {
  OfficialScriptIdentities
} = require('../../Models');

const service = require('../../Services/OfficialScriptIdentitiesService');

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
  show,
  toDocx
}