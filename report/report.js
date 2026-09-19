import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";

const app = express();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024
    }
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const MODEL = "gpt-5.6-luna";

const instructions = `
You are a medical document understanding assistant.

IMPORTANT:
You are NOT a doctor and must NOT diagnose the patient or prescribe treatment.

Analyze the ENTIRE uploaded document.

Do not analyze only keywords.
Do not stop after finding one abnormal value.
Read all available pages, tables, sections and relevant findings.

If the document is scanned or image-based, read the visible text and perform OCR-style extraction.

Your tasks are:

1. DOCUMENT ANALYSIS
Read the complete document and identify:
- patient information when available
- report date
- laboratory tests
- imaging findings
- vital signs
- observations
- diagnoses explicitly written in the report
- recommendations explicitly written in the report

Never invent information.

2. TEST EXTRACTION

For every identifiable test/result extract:

- test name
- value
- unit
- date
- reference range
- status
- plain-language explanation

If information is unavailable, write:
"Not available in report"

If a value cannot be read reliably:
"Unreadable"

Do not guess.

3. PLAIN LANGUAGE EXPLANATION

Explain every important result in simple language.

Example:

Medical wording:
"Hemoglobin 9.2 g/dL"

Simple explanation:
"Hemoglobin is a protein in blood that carries oxygen. This result should be interpreted using the reference range shown by the laboratory."

Do not turn a laboratory result into a diagnosis.

4. IMPORTANT FINDINGS

Create a list of the most relevant findings.

Include:
- abnormal values
- values outside the provided reference range
- critical wording
- positive findings
- important imaging findings
- results explicitly marked abnormal by the laboratory

5. WARNING SYSTEM

Risk level must be one of:

"urgent"
"review"
"no_urgent_flag"

Use "urgent" only when the report contains clearly critical, panic, emergency or otherwise potentially dangerous information requiring prompt professional review.

Use "review" for abnormal or notable findings.

Use "no_urgent_flag" when no urgent finding is identified.

Never say:
"You are safe."
"Nothing is wrong."
"You have no disease."

6. HISTORICAL COMPARISON

The user may have previous reports.

Compare current results with previous reports.

Only compare:
- the same test
- compatible units
- clearly comparable measurements

For each comparison mention:
- previous value
- previous date
- current value
- current date
- whether it increased, decreased or remained similar

Do not invent historical values.

If no previous value exists:
"No comparable previous result available."

7. SIMPLIFIED REPORT

Create:

OVERALL SUMMARY

IMPORTANT FINDINGS

TEST RESULTS

HISTORICAL COMPARISON

QUESTIONS TO DISCUSS WITH A HEALTHCARE PROFESSIONAL

8. QUESTIONS

Generate useful questions the user may discuss with their doctor based only on the report.

Do not give treatment instructions.

Do not prescribe medicine.

Do not tell the user to stop or change medicine.

9. MEDICAL DISCLAIMER

Always include:

"This summary is generated from the uploaded document and is for educational and discussion purposes only. It may contain errors or miss important context. Reference ranges can vary between laboratories and individuals. Do not diagnose yourself or start, stop, or change medicines based on this summary. Consult a qualified healthcare professional for interpretation."

Return ONLY valid JSON.
`;

const schema = {
    type: "object",
    additionalProperties: false,

    properties: {
        patient_name: {
            type: "string"
        },

        report_date: {
            type: "string"
        },

        risk_level: {
            type: "string",
            enum: [
                "urgent",
                "review",
                "no_urgent_flag"
            ]
        },

        overall_summary: {
            type: "string"
        },

        important_findings: {
            type: "array",
            items: {
                type: "string"
            }
        },

        tests: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,

                properties: {
                    test_name: {
                        type: "string"
                    },

                    value: {
                        type: "string"
                    },

                    unit: {
                        type: "string"
                    },

                    date: {
                        type: "string"
                    },

                    reference_range: {
                        type: "string"
                    },

                    status: {
                        type: "string"
                    },

                    plain_language_explanation: {
                        type: "string"
                    }
                },

                required: [
                    "test_name",
                    "value",
                    "unit",
                    "date",
                    "reference_range",
                    "status",
                    "plain_language_explanation"
                ]
            }
        },

        historical_comparison: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,

                properties: {
                    test_name: {
                        type: "string"
                    },

                    previous_value: {
                        type: "string"
                    },

                    previous_date: {
                        type: "string"
                    },

                    current_value: {
                        type: "string"
                    },

                    current_date: {
                        type: "string"
                    },

                    change: {
                        type: "string"
                    },

                    explanation: {
                        type: "string"
                    }
                },

                required: [
                    "test_name",
                    "previous_value",
                    "previous_date",
                    "current_value",
                    "current_date",
                    "change",
                    "explanation"
                ]
            }
        },

        questions_for_doctor: {
            type: "array",
            items: {
                type: "string"
            }
        },

        medical_disclaimer: {
            type: "string"
        }
    },

    required: [
        "patient_name",
        "report_date",
        "risk_level",
        "overall_summary",
        "important_findings",
        "tests",
        "historical_comparison",
        "questions_for_doctor",
        "medical_disclaimer"
    ]
};


app.post(
    "/api/analyze-report",
    upload.single("report"),
    async (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    error: "Please upload a report."
                });
            }

            let history = [];

            try {
                history = JSON.parse(
                    req.body.history || "[]"
                );
            } catch {
                history = [];
            }

            const historyText =
                history.length > 0
                    ? `
PREVIOUS REPORTS:

${JSON.stringify(history, null, 2)}

Use these only for historical comparison.
`
                    : `
There are no previous reports available.
`;

            const base64File =
                req.file.buffer.toString("base64");

            const mime =
                req.file.mimetype ||
                "application/octet-stream";

            const response =
                await client.responses.create({

                    model: MODEL,

                    instructions,

                    input: [
                        {
                            role: "user",

                            content: [

                                {
                                    type: "input_text",

                                    text: `
Analyze this complete medical report.

File name:
${req.file.originalname}

${historyText}

Important:
Read the entire document.
Extract all identifiable tests and values.
Do not summarize from only the first page.
Do not invent missing information.
`
                                },

                                {
                                    type: "input_file",

                                    filename:
                                        req.file.originalname,

                                    file_data:
                                        `data:${mime};base64,${base64File}`
                                }

                            ]
                        }
                    ],

                    text: {
                        format: {
                            type: "json_schema",

                            name:
                                "medical_report_analysis",

                            strict: true,

                            schema
                        }
                    }
                });

            const result =
                JSON.parse(response.output_text);

            res.json({
                success: true,
                analysis: result
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                error:
                    error.message ||
                    "Unable to analyze the report."
            });
        }
    }
);


app.get("/api/health", (req, res) => {
    res.json({
        status: "OK"
    });
});


const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Healthcare website running at http://localhost:${PORT}`
    );

});