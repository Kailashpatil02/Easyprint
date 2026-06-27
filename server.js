const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000; // आपला सर्व्हर ५००० पोर्टवर चालेल

// वेगवेगळ्या डोमेनवरून (गिटहबवरून) रिक्वेस्ट स्वीकारण्यासाठी CORS ऑन करा
app.use(cors());
app.use(express.json());

// अपलोड झालेली फाईल मेमरीमध्ये ठेवण्यासाठी मुल्टर (Multer) सेटअप
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// मुख्य API: पीडीएफ फाईल स्वीकारून पेजेस मोजणे
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "कृपया फाईल अपलोड करा!" });
        }

        // फाईल पीडीएफ आहे की नाही हे तपासणे
        if (req.file.mimetype === 'application/pdf') {
            // pdf-parse लायब्ररी वापरून पेजेस मोजणे
            const data = await pdfParse(req.file.buffer);
            const realPages = data.numpages;

            return res.json({ 
                success: true, 
                fileName: req.file.originalname,
                pages: realPages 
            });
        } else {
            // जर इमेज असेल (JPG/PNG), तर ती १ पेजचीच असते
            return res.json({ 
                success: true, 
                fileName: req.file.originalname,
                pages: 1 
            });
        }

    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "फाईल रीड करताना अडचण आली!" });
    }
});

// सर्व्हर सुरू करणे
app.listen(port, () => {
    console.log(`Server is running live on http://localhost:${port}`);
});
