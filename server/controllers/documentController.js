const { simplifyDocument } = require('../services/documentService');

/**
 * Controller for POST /api/documents/simplify
 * Accepts:
 * - Multipart upload with file field `document` (.pdf, .txt)
 * - JSON body with `{ text, filename }`
 */
async function handleSimplifyDocument(req, res, next) {
  try {
    let buffer = null;
    let mimeType = null;
    let originalname = 'Document.txt';
    let rawText = null;

    if (req.file) {
      buffer = req.file.buffer;
      mimeType = req.file.mimetype;
      originalname = req.file.originalname || 'Uploaded Document';
    } else if (req.body && typeof req.body.text === 'string' && req.body.text.trim().length > 0) {
      rawText = req.body.text.trim();
      originalname = req.body.filename || 'Pasted Legal Text';
    } else {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing document input. Please upload a PDF/text file or provide document text.'
        }
      });
    }

    const result = await simplifyDocument({
      buffer,
      mimeType,
      originalname,
      rawText
    });

    return res.status(200).json({
      success: true,
      document: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleSimplifyDocument
};
