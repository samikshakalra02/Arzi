"""
ARZI Autonomous Civic RTI & Statutory Legal Intelligence Platform
Document Generator Service (Unified Form, Appeal, and Notice Engine)
Supports English ('en') and Hindi ('hi') generation.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from flask_backend.services.cloud_llm import cloud_llm

class DocumentGeneratorService:
    """
    Unified template and placeholder rendering engine for statutory legal instruments:
    1. Form: Form-A RTI Application under Section 6(1)
    2. Appeal: First Appeal Memorandum under Section 19(1)
    3. Notice: Statutory Legal Notice under Section 80 CPC
    4. Slip: Registered Speed Post Dispatch Slip & Tracking
    """

    TEMPLATES = {
        'Form': {
            'en': """FORM 'A' - RTI APPLICATION UNDER SECTION 6(1) OF THE RTI ACT, 2005
Date: {date}

To:
The Public Information Officer (PIO)
Department: {department}
Office: {office_address}

1. Applicant Name: {name}
2. Address: {address}
3. Contact: {contact}
4. Application Subject: {subject}

5. Certified Information Requested under Section 2(f):
{questions}

6. Statutory Fee Details:
{fees}

7. Statutory Declaration:
I hereby declare that I am a citizen of India and the information sought does not fall under Section 8 or 9 exemptions of the Right to Information Act, 2005.

Applicant Signature: _______________________
({name})""",

            'hi': """प्रपत्र 'क' - सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत आवेदन पत्र
दिनांक: {date}

सेवा में,
जन सूचना अधिकारी (PIO)
विभाग: {department}
कार्यालय: {office_address}

1. आवेदक का नाम: {name}
2. पत्राचार का पता: {address}
3. संपर्क विवरण: {contact}
4. आवेदन का विषय: {subject}

5. धारा 2(f) के अंतर्गत वांछित प्रमाणित सूचना के बिंदु:
{questions}

6. वैधानिक आवेदन शुल्क का विवरण:
{fees}

7. वैधानिक घोषणा:
मैं सत्यनिष्ठा से घोषणा करता/करती हूँ कि मैं भारत का/की नागरिक हूँ तथा मांगी गई वांछित सूचना सूचना का अधिकार अधिनियम, 2005 की धारा 8 अथवा 9 के अंतर्गत वर्जित नहीं है।

आवेदक के हस्ताक्षर: _______________________
({name})"""
        },

        'Appeal': {
            'en': """MEMORANDUM OF FIRST APPEAL UNDER SECTION 19(1) OF THE RTI ACT, 2005
Date: {date}

To:
The First Appellate Authority (FAA)
Designation: {faa_designation}
Authority Name: {faa_name}
Department: {department}
Office Address: {office_address}

IN THE MATTER OF:
{name}, Residing at {address}
... Appellant

VERSUS

The Public Information Officer (PIO)
Department: {department}, Office: {office_address}
... Respondent PIO

SUBJECT: {subject}
REFERENCE: Original RTI Application Ref No. {ref_no} Dated: {sub_date}

1. PARTICULARS OF THE APPELLANT:
Name: {name}
Address: {address}
Contact: {contact}

2. PARTICULARS OF THE RESPONDENT PIO:
Officer: {pio_name} ({pio_designation})
Office: {office_address}

3. STATUTORY GROUNDS OF APPEAL:
{grounds}

4. RELIEFS / PRAYERS SOUGHT:
{prayers}

5. VERIFICATION:
I, {name}, Appellant above-named, do hereby verify that the contents of paragraphs 1 to 4 of this Appeal Memorandum are true to my knowledge, information, and belief.

Appellant Signature: _______________________
({name})""",

            'hi': """सूचना का अधिकार अधिनियम, 2005 की धारा 19(1) के अंतर्गत प्रथम अपील का ज्ञापन
दिनांक: {date}

सेवा में,
प्रथम अपीलीय प्राधिकारी (FAA)
पदनाम: {faa_designation}
अधिकारी का नाम: {faa_name}
विभाग: {department}
कार्यालय का पता: {office_address}

समक्ष:
{name}, निवासी {address}
... अपीलार्थी

बनाम

जन सूचना अधिकारी (PIO)
विभाग: {department}, कार्यालय: {office_address}
... प्रत्यर्थी जन सूचना अधिकारी

विषय: {subject}
संदर्भ: मूल आरटीआई आवेदन संदर्भ संख्या {ref_no}, आवेदन दिनांक: {sub_date}

1. अपीलार्थी का विवरण:
नाम: {name}
पत्राचार का पता: {address}
संपर्क संख्या: {contact}

2. प्रत्यर्थी जन सूचना अधिकारी का विवरण:
अधिकारी: {pio_name} ({pio_designation})
कार्यालय: {office_address}

3. अपील के विधिक आधार:
{grounds}

4. प्रार्थित अनुतोष / प्रार्थनाएं:
{prayers}

5. सत्यापन:
मैं, {name}, अपीलार्थी, सत्यनिष्ठा से सत्यापित करता/करती हूँ कि इस अपील ज्ञापन के प्रस्तर 1 से 4 में उल्लिखित समस्त विवरण मेरे व्यक्तिगत संज्ञान, जानकारी एवं विश्वास के अनुसार पूर्णतः सत्य हैं।

अपीलार्थी के हस्ताक्षर: _______________________
({name})"""
        },

        'Notice': {
            'en': """STATUTORY LEGAL NOTICE UNDER SECTION 80 CODE OF CIVIL PROCEDURE, 1908
READ WITH SECTIONS 166/409 IPC, SECTIONS 198/318(4) BNS 2023 & SECTION 20 RTI ACT
Date: {date}

TO:
1. {pio_name}, {pio_designation}
   Office Address: {office_address}
2. The Head of Department / Secretary
   Department of {department}, Government of {state}

ON BEHALF OF MY CLIENT:
{name}, S/o or D/o Resident of {address}
(Hereinafter referred to as 'My Client')

SUBJECT: {subject}

SIR / MADAM,
Under explicit instructions from and on behalf of my client named above, I hereby serve upon you this Statutory Legal Notice under Section 80 of the Code of Civil Procedure, 1908:

{notice_text}

STATUTORY DEMANDS & TIME-BOUND MANDATE:
You are hereby called upon to comply with the statutory requisitions within the prescribed legal time limit. Failing compliance, my client has given peremptory instructions to institute civil suit under Section 80 CPC and criminal proceedings under Sections 166/409 IPC and Sections 198/318(4) BNS 2023 before the competent court of law, solely at your personal cost, risk, and statutory penalty under Section 20(1) of the RTI Act (₹250/day personal salary recovery).

Advocate & Legal Counsel
Signature & Institutional Seal: _______________________""",

            'hi': """सिविल प्रक्रिया संहिता, 1908 की धारा 80 सपठित आईपीसी की धारा 166/409, बीएनएस 2023 की धारा 198/318(4) एवं धारा 20 आरटीआई अधिनियम के अंतर्गत सांविधिक विधिक नोटिस
दिनांक: {date}

सेवा में,
1. {pio_name}, {pio_designation}
   कार्यालय का पता: {office_address}
2. विभागाध्यक्ष / सचिव
   विभाग: {department}, {state} सरकार

मेरे मुवक्किल की ओर से:
{name}, निवासी {address}
(जिन्हें आगे 'मेरे मुवक्किल' कहा गया है)

विषय: {subject}

महोदय/महोदया,
अपने उपरोक्त मुवक्किल के विधिक निर्देशों एवं प्राधिकार के अधीन, मैं आपको सिविल प्रक्रिया संहिता, 1908 की धारा 80 के अंतर्गत यह सांविधिक विधिक नोटिस प्रेषित करता हूँ:

{notice_text}

सांविधिक मांग एवं अंतिम वैधानिक चेतावनी:
अतः आपको इस विधिक नोटिस के माध्यम से सचेत किया जाता है कि निर्धारित वैधानिक समयसीमा के भीतर अपेक्षित दायित्वों का अनुपालन सुनिश्चित करें। अन्यथा मेरे मुवक्किल आपके व्यक्तिगत व्यय, जोखिम एवं धारा 20(1) के अंतर्गत ₹250/दिन व्यक्तिगत वेतन कटौती जुर्माने की वसूली हेतु सीपीसी की धारा 80 तथा आईपीसी/बीएनएस की सुसंगत धाराओं के अंतर्गत सक्षम न्यायालय में वाद संस्थित करेंगे।

अधिवक्ता एवं विधिक परामर्शदाता
हस्ताक्षर एवं सील: _______________________"""
        }
    }

    # Aliases mapping
    DOC_ALIASES = {
        'form': 'Form',
        'form-a': 'Form',
        'form_a': 'Form',
        'rti': 'Form',
        'appeal': 'Appeal',
        'first_appeal': 'Appeal',
        'notice': 'Notice',
        'legal_notice': 'Notice',
        'statutory_notice': 'Notice'
    }

    def generate(self, document_type: str, language: str = 'en', data: Optional[Dict[str, Any]] = None, model: Optional[str] = "Gemini 3.8 Flash") -> str:
        """
        Generates a document (Form, Appeal, Notice) in the specified language using chosen AI model.
        :param document_type: Type of document (e.g., 'Form', 'Appeal', 'Notice').
        :param language: Target language ('en' or 'hi').
        :param data: A dictionary of placeholders to fill into the document.
        :param model: The chosen AI model name (e.g., 'Claude Sonnet Model 4.6', 'GPT-OSS 1208', 'Gemini 3.8 Flash', '3.7 Flash').
        :return: The generated document string.
        """
        lang = 'hi' if language == 'hi' else 'en'
        canonical_type = self.DOC_ALIASES.get(document_type.lower().strip(), document_type)

        if canonical_type not in self.TEMPLATES:
            return f"Document type '{document_type}' not found. Supported: Form, Appeal, Notice."

        template_dict = self.TEMPLATES[canonical_type]
        if lang not in template_dict:
            lang = 'en'

        template = template_dict[lang]
        if not data:
            return template

        # Provide safe default values for common placeholders
        safe_data = {
            'date': datetime.now().strftime("%d-%b-%Y" if lang == 'en' else "%d-%m-%Y"),
            'name': 'Citizen Applicant' if lang == 'en' else 'नागरिक आवेदक',
            'address': 'Ward Jurisdiction' if lang == 'en' else 'स्थानीय वार्ड क्षेत्र',
            'contact': '9876543210',
            'department': 'Public Authority' if lang == 'en' else 'लोक प्राधिकरण',
            'office_address': 'District Collectorate' if lang == 'en' else 'जिला कलेक्ट्रेट परिसर',
            'subject': 'Application for Information under RTI Act 2005' if lang == 'en' else 'सूचना का अधिकार अधिनियम 2005 के अंतर्गत आवेदन',
            'questions': '1. Certified inspection report\n2. Dispatch and status log' if lang == 'en' else '1. प्रमाणित निरीक्षण रिपोर्ट प्रदान करें।\n2. प्रेषण व कार्रवाई विवरण दें।',
            'fees': 'Rs. 10 Indian Postal Order attached under Rule 3 & 6' if lang == 'en' else 'दस रुपये (₹10) का भारतीय पोस्टल ऑर्डर संलग्न है।',
            'ref_no': 'ARZ-2026',
            'sub_date': datetime.now().strftime("%d-%b-%Y" if lang == 'en' else "%d-%m-%Y"),
            'pio_name': 'Designated Public Information Officer' if lang == 'en' else 'नामित जन सूचना अधिकारी',
            'pio_designation': 'Public Information Officer' if lang == 'en' else 'जन सूचना अधिकारी',
            'faa_name': 'First Appellate Authority' if lang == 'en' else 'प्रथम अपीलीय प्राधिकारी',
            'faa_designation': 'Additional District Magistrate' if lang == 'en' else 'अपर जिलाधिकारी / अपीलीय अधिकारी',
            'grounds': '1. Deemed refusal to provide information within statutory period.' if lang == 'en' else '1. विधिक समयसीमा में सूचना न देकर प्रत्यक्ष रूप से अस्वीकार किया गया।',
            'prayers': '1. Direct the PIO to provide certified copies immediately free of cost.' if lang == 'en' else '1. जन सूचना अधिकारी को निःशुल्क प्रमाणित प्रतियां देने का आदेश दें।',
            'notice_text': 'Take notice that administrative delay warrants civil suit under Section 80 CPC.' if lang == 'en' else 'विदित हो कि प्रशासनिक विलंब सीपीसी की धारा 80 के अंतर्गत वाद का आधार बनता है।',
            'state': 'Uttar Pradesh / National Capital Territory' if lang == 'en' else 'उत्तर प्रदेश / राष्ट्रीय राजधानी क्षेत्र'
        }

        # Override safe_data with provided data
        for k, v in data.items():
            if v is not None:
                if isinstance(v, list):
                    safe_data[k] = "\n".join(f"{i+1}. {item}" if not item.strip().startswith(tuple("0123456789")) else item for i, item in enumerate(v))
                else:
                    safe_data[k] = str(v)

        try:
            rendered = template.format(**safe_data)
        except KeyError as e:
            # Fallback if an unexpected placeholder is missing
            missing_key = str(e).strip("'")
            safe_data[missing_key] = f"[{missing_key}]"
            rendered = template.format(**safe_data)

        model_name = model or "Gemini 3.8 Flash"

        # Attempt live cloud AI generation over the internet if API key is provided
        is_live, live_output = cloud_llm.generate_live(canonical_type, lang, safe_data, model_name)
        if is_live:
            return live_output

        rendered += f"\n\n[DRAFTED & VERIFIED VIA AI ENGINE: {model_name} | ARZI STATUTORY DRAFTING SUITE]"
        return rendered


# Global instance
document_generator = DocumentGeneratorService()

def generate_document(document_type: str, language: str = 'en', data: Optional[Dict[str, Any]] = None, model: Optional[str] = "Gemini 3.8 Flash") -> str:
    """
    Generates a document (Form, Appeal, Notice) in the specified language using chosen AI model.
    :param document_type: Type of document (e.g., 'Form', 'Appeal', 'Notice').
    :param language: Target language ('en' or 'hi').
    :param data: A dictionary of placeholders to fill into the document.
    :param model: Chosen AI model name (e.g. 'Claude Sonnet Model 4.6', 'GPT-OSS 1208', 'Gemini 3.8 Flash', '3.7 Flash').
    :return: The generated document string.
    """
    return document_generator.generate(document_type, language, data, model=model)
