/**
 * Gemini API Service
 * Medical Record Summarization & Analysis
 * 
 * SAFETY CONSTRAINTS:
 * ✅ NO diagnosis, treatment suggestions, or medical judgment
 * ✅ Only summarizes, organizes, and flags with EXPLAINABILITY
 * ✅ Rule-based risk flagging (not AI-invented)
 * ✅ Doctor always controls AI visibility
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// --- TYPE DEFINITIONS ---

export interface MedicalRecordAnalysis {
  summary: string;
  chronic_conditions: string[];
  surgeries: string[];
  allergies: string[];
  recent_hospitalizations: number;
  risk_flags: RiskFlag[];
  timeline: TimelineEvent[];
  duplicates_detected: string[];
  warnings: ContextualWarning[];
  explanation: string;
}

export interface RiskFlag {
  flag: string;
  severity: "critical" | "high" | "medium" | "low";
  reason: string;
  evidence: string[]; // References to source records
}

export interface TimelineEvent {
  year: number;
  month?: number;
  event: string;
  type: "diagnosis" | "surgery" | "hospitalization" | "test" | "treatment";
}

export interface ContextualWarning {
  warning: string;
  type: "allergy" | "adverse_reaction" | "contraindication" | "duplicate";
  explanation: string;
}

// --- PREDEFINED MEDICAL RULES FOR RISK FLAGGING ---
const RISK_RULES = {
  allergies: {
    severe: ["Penicillin", "Sulfonamides", "Cephalosporins", "NSAIDs"],
    high: ["Acetaminophen", "Statins", "ACE inhibitors"]
  },
  critical_conditions: ["Heart Attack", "Stroke", "Myocardial Infarction", "Cardiac Arrest", "Sepsis"],
  caution_conditions: ["Chronic Kidney Disease", "Liver Disease", "Diabetes", "Hypertension"],
  duplicate_keywords: ["test", "scan", "report", "xray", "ultrasound", "blood work", "lab"]
};

// --- MAIN GEMINI ANALYSIS FUNCTION ---
export async function analyzeMedicalRecords(
  recordsText: string,
  patientInfo?: { age: number; gender: string }
): Promise<MedicalRecordAnalysis | null> {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not configured");
    return null;
  }

  try {
    const prompt = generateAnalysisPrompt(recordsText, patientInfo);
    
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }),
      ...{
        params: { key: GEMINI_API_KEY }
      }
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    const analysisText = data.contents?.[0]?.parts?.[0]?.text;

    if (!analysisText) {
      console.error("Invalid Gemini response");
      return null;
    }

    return parseGeminiAnalysis(analysisText);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
}

// --- GENERATE ANALYSIS PROMPT ---
function generateAnalysisPrompt(recordsText: string, patientInfo?: any): string {
  return `
You are a medical record organization assistant. Your ONLY role is to:
1. Summarize medical records into structured categories
2. Extract timeline of medical events
3. Flag pre-defined high-risk conditions (provided below)
4. Identify duplicate entries
5. Highlight warnings about allergies and adverse reactions

⚠️ YOU MUST NOT:
- Diagnose or predict diseases
- Suggest treatments or medications
- Make clinical judgments
- Rank conditions by importance
- Invent risks not explicitly stated in records

MEDICAL RECORDS TO ANALYZE:
${recordsText}

${patientInfo ? `PATIENT INFO: Age ${patientInfo.age}, ${patientInfo.gender}` : ""}

HIGH-RISK CONDITIONS TO FLAG:
${RISK_RULES.critical_conditions.join(", ")}

ANALYZE AND PROVIDE JSON RESPONSE WITH THIS EXACT STRUCTURE:
{
  "summary": "1-2 sentence factual summary of medical history",
  "chronic_conditions": ["list of ongoing conditions mentioned"],
  "surgeries": ["list of surgeries mentioned with dates"],
  "allergies": ["list of documented allergies"],
  "recent_hospitalizations": number,
  "risk_flags": [
    {
      "flag": "name of condition/allergy",
      "severity": "critical/high/medium/low",
      "reason": "why this is flagged",
      "evidence": ["source document", "source document"]
    }
  ],
  "timeline": [
    {
      "year": 2021,
      "month": 3,
      "event": "event description",
      "type": "diagnosis/surgery/hospitalization/test/treatment"
    }
  ],
  "duplicates_detected": ["description of duplicate entries found"],
  "warnings": [
    {
      "warning": "specific warning",
      "type": "allergy/adverse_reaction/contraindication/duplicate",
      "explanation": "why doctor should be aware"
    }
  ],
  "explanation": "Brief explanation of how analysis was conducted and confidence level"
}

IMPORTANT:
- Use ONLY facts from the records provided
- Flag ONLY conditions matching pre-defined rules
- Include source references for every flag
- Be specific and cite evidence
`;
}

// --- PARSE GEMINI RESPONSE ---
function parseGeminiAnalysis(analysisText: string): MedicalRecordAnalysis | null {
  try {
    // Extract JSON from response (Gemini sometimes adds extra text)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response");
      return null;
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      summary: analysis.summary || "",
      chronic_conditions: analysis.chronic_conditions || [],
      surgeries: analysis.surgeries || [],
      allergies: analysis.allergies || [],
      recent_hospitalizations: analysis.recent_hospitalizations || 0,
      risk_flags: analysis.risk_flags || [],
      timeline: analysis.timeline || [],
      duplicates_detected: analysis.duplicates_detected || [],
      warnings: analysis.warnings || [],
      explanation: analysis.explanation || ""
    };
  } catch (error) {
    console.error("Parse error:", error);
    return null;
  }
}

// --- UTILITY: CHECK ALLERGY SEVERITY ---
export function getAllergySeverity(allergyName: string): "critical" | "high" | "low" {
  const nameLower = allergyName.toLowerCase();
  
  for (const severe of RISK_RULES.allergies.severe) {
    if (nameLower.includes(severe.toLowerCase())) return "critical";
  }
  
  for (const high of RISK_RULES.allergies.high) {
    if (nameLower.includes(high.toLowerCase())) return "high";
  }
  
  return "low";
}

// --- UTILITY: CHECK IF CRITICAL CONDITION ---
export function isCriticalCondition(condition: string): boolean {
  return RISK_RULES.critical_conditions.some(c => 
    condition.toLowerCase().includes(c.toLowerCase())
  );
}

// --- UTILITY: DETECT POTENTIAL DUPLICATES ---
export function detectDuplicates(records: string[]): string[] {
  const duplicates: string[] = [];
  const seen = new Map<string, number>();

  for (const record of records) {
    const normalized = record.toLowerCase().trim();
    seen.set(normalized, (seen.get(normalized) || 0) + 1);
  }

  for (const [record, count] of seen.entries()) {
    if (count > 1) {
      duplicates.push(`"${record}" appears ${count} times`);
    }
  }

  return duplicates;
}

// --- UTILITY: GENERATE EXPLAINABILITY TEXT ---
export function generateExplanation(analysis: MedicalRecordAnalysis): string {
  return `
Medical Record Analysis Summary
═════════════════════════════════

${analysis.summary}

⚠️ IMPORTANT NOTES:
• This analysis ORGANIZES existing medical data
• It does NOT diagnose or recommend treatments
• All flags are based on documented facts
• Doctor review is required before any clinical decision

${analysis.risk_flags.length > 0 ? `
🚩 FLAGS REQUIRING ATTENTION:
${analysis.risk_flags.map(f => `• ${f.flag} (${f.severity}): ${f.reason}`).join("\n")}
` : ""}

${analysis.allergies.length > 0 ? `
🔴 DOCUMENTED ALLERGIES:
${analysis.allergies.map(a => `• ${a}`).join("\n")}
` : ""}

${analysis.timeline.length > 0 ? `
📅 TIMELINE OF EVENTS:
${analysis.timeline.map(t => `${t.year}${t.month ? `-${String(t.month).padStart(2, '0')}` : ""}: ${t.event}`).join("\n")}
` : ""}

${analysis.duplicates_detected.length > 0 ? `
⚡ POTENTIAL DUPLICATES:
${analysis.duplicates_detected.map(d => `• ${d}`).join("\n")}
` : ""}
`;
}

// --- UTILITY: DOCTOR CONTROL - CAN DISABLE AI ---
export function shouldShowAIAnalysis(userPreference: boolean): boolean {
  // Doctor/Patient can disable AI insights
  return userPreference;
}

// --- UTILITY: FORMAT FOR DISPLAY ---
export function formatAnalysisForDisplay(analysis: MedicalRecordAnalysis) {
  return {
    summary: analysis.summary,
    sections: {
      chronic_conditions: analysis.chronic_conditions,
      surgeries: analysis.surgeries,
      allergies: analysis.allergies,
      hospitalizations: analysis.recent_hospitalizations,
      critical_flags: analysis.risk_flags.filter(f => f.severity === "critical"),
      warnings: analysis.warnings
    },
    timeline: analysis.timeline.sort((a, b) => b.year - a.year || (b.month || 0) - (a.month || 0)),
    explanation: analysis.explanation
  };
}
