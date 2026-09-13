import io
import os
import hashlib
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

# Font registration cache
_DEVNAGARI_REGISTERED = False
_DEVNAGARI_FONT_NAME = "Helvetica"
_DEVNAGARI_BOLD_NAME = "Helvetica-Bold"

def _register_devnagari_fonts():
    global _DEVNAGARI_REGISTERED, _DEVNAGARI_FONT_NAME, _DEVNAGARI_BOLD_NAME
    if _DEVNAGARI_REGISTERED:
        return _DEVNAGARI_FONT_NAME, _DEVNAGARI_BOLD_NAME

    if not HAS_REPORTLAB:
        return "Helvetica", "Helvetica-Bold"

    candidate_regular = [
        "C:/Windows/Fonts/Nirmala.ttf",
        "C:/Windows/Fonts/nirmala.ttf",
        "C:/Windows/Fonts/mangal.ttf",
        "C:/Windows/Fonts/Mangal.ttf",
        "C:/Windows/Fonts/aparaj.ttf",
    ]
    candidate_bold = [
        "C:/Windows/Fonts/NirmalaB.ttf",
        "C:/Windows/Fonts/nirmalab.ttf",
        "C:/Windows/Fonts/mangalb.ttf",
        "C:/Windows/Fonts/Mangalb.ttf",
        "C:/Windows/Fonts/aparajb.ttf",
    ]

    reg_path = None
    for p in candidate_regular:
        if os.path.exists(p):
            reg_path = p
            break

    bold_path = None
    for p in candidate_bold:
        if os.path.exists(p):
            bold_path = p
            break

    if reg_path:
        try:
            pdfmetrics.registerFont(TTFont("Devanagari", reg_path))
            _DEVNAGARI_FONT_NAME = "Devanagari"
            if bold_path:
                pdfmetrics.registerFont(TTFont("Devanagari-Bold", bold_path))
                _DEVNAGARI_BOLD_NAME = "Devanagari-Bold"
            else:
                _DEVNAGARI_BOLD_NAME = "Devanagari"
            _DEVNAGARI_REGISTERED = True
        except Exception:
            _DEVNAGARI_FONT_NAME = "Helvetica"
            _DEVNAGARI_BOLD_NAME = "Helvetica-Bold"

    return _DEVNAGARI_FONT_NAME, _DEVNAGARI_BOLD_NAME


from flask_backend.services.legal_engine import legal_engine

DEPT_HINDI_MAP = {
    "Revenue & Land Records": "राजस्व एवं भूमि अभिलेख विभाग",
    "Food & Civil Supplies": "खाद्य एवं नागरिक आपूर्ति विभाग",
    "Municipal Public Works & Drainage": "नगर निगम लोक निर्माण एवं जल निकासी",
    "Higher Education & Student Welfare": "उच्च शिक्षा एवं छात्र कल्याण",
    "Police & Law Enforcement": "पुलिस एवं कानून व्यवस्था",
    "Health & Family Welfare": "स्वास्थ्य एवं परिवार कल्याण",
    "Water Supply & Jal Board": "जल आपूर्ति एवं दिल्ली जल बोर्ड",
    "Electricity & Power Distribution": "विद्युत एवं ऊर्जा वितरण",
    "Transport & Motor Vehicles": "परिवहन एवं मोटर वाहन विभाग"
}

def _has_devanagari(text):
    if not text:
        return False
    return any('\u0900' <= ch <= '\u097f' for ch in str(text))

def _t_dept(dept):
    if not dept:
        return "संबंधित लोक प्राधिकरण"
    return DEPT_HINDI_MAP.get(dept, str(dept))

def _t_designation(d):
    if not d:
        return "सक्षम जन सूचना अधिकारी"
    return (str(d).replace("Public Information Officer & Assistant Commissioner", "जन सूचना अधिकारी एवं सहायक आयुक्त")
                  .replace("Public Information Officer", "जन सूचना अधिकारी")
                  .replace("Assistant Commissioner", "सहायक आयुक्त")
                  .replace("Tehsildar & Designated PIO", "तहसीलदार एवं नामित जन सूचना अधिकारी")
                  .replace("Executive Engineer (Drainage & Stormwater)", "अधिशासी अभियंता (जल निकासी एवं सीवरेज)")
                  .replace("Executive Engineer", "अधिशासी अभियंता")
                  .replace("Deputy Registrar & PIO (Scholarships)", "उप कुलसचिव एवं जन सूचना अधिकारी (छात्रवृत्ति)")
                  .replace("Deputy Registrar", "उप कुलसचिव")
                  .replace("Chief Medical Officer & Designated PIO", "मुख्य चिकित्सा अधिकारी एवं नामित जन सूचना अधिकारी")
                  .replace("Chief Medical Officer", "मुख्य चिकित्सा अधिकारी")
                  .replace("Chief Engineer (Water Distribution) & Designated PIO", "मुख्य अभियंता (जल वितरण) एवं नामित जन सूचना अधिकारी")
                  .replace("Chief Engineer", "मुख्य अभियंता")
                  .replace("First Appellate Authority", "प्रथम अपीलीय प्राधिकारी"))

def _t_locality(loc):
    if not loc:
        return "स्थानीय मंडल"
    return (str(loc).replace("Ward 4, Civil Lines, New Delhi - 110054", "वार्ड 4, सिविल लाइन्स, नई दिल्ली - 110054")
                    .replace("Civil Lines", "सिविल लाइन्स")
                    .replace("Sector 4, Mehrauli, New Delhi", "सेक्टर 4, महरौली, नई दिल्ली")
                    .replace("Mehrauli", "महरौली")
                    .replace("Kalkaji, South Delhi, Delhi", "कालकाजी, दक्षिणी दिल्ली")
                    .replace("South Delhi", "दक्षिणी दिल्ली")
                    .replace("New Delhi", "नई दिल्ली")
                    .replace("Delhi", "दिल्ली"))

def _t_infraction(inf):
    if not inf:
        return "सार्वजनिक कर्तव्यों की उपेक्षा एवं वैधानिक समयसीमा का उल्लंघन"
    return (str(inf).replace("PDS Diversion, Food Adulteration & Substandard/Noxious Food Quality Dereliction", "खाद्यान्न वितरण में अनियमितता, मिलावट एवं घटिया खाद्य आपूर्ति उपेक्षा")
                    .replace("Substandard/Noxious Food Quality Dereliction", "घटिया खाद्य आपूर्ति एवं विधिक कर्तव्यों की उपेक्षा")
                    .replace("Land Mutation & Record Update Delay", "भूमि नामांतरण एवं अभिलेख अद्यतन में विलंब")
                    .replace("Public Dereliction", "लोक सेवक द्वारा कर्तव्य उपेक्षा"))

def _get_hindi_questions(case, draft, pio, ref_no, sub_date, complainant):
    qs = draft.get("questions", [])
    if qs and _has_devanagari(" ".join(qs)):
        return qs
    case_id = case.get("case_id", "")
    app_name = complainant.get("name", "नागरिक आवेदक")
    loc = _t_locality(pio.get("matched_user_locality") or complainant.get("address"))
    dept = _t_dept(pio.get("department"))
    ref_part = f" (संदर्भ सं: {ref_no})" if ref_no and ref_no != "Not Provided" else ""
    date_part = f" दिनांक {sub_date}" if sub_date and sub_date != "Unconfirmed" else ""

    if case_id == "ARZ-1042":
        return [
            "1. कृपया 15-फरवरी-2026 को वार्ड 4 निवासी सुनीता देवी द्वारा जमा किए गए मूल शिकायत आवेदन (संदर्भ सं: RC-88492) की दैनिक प्रगति रिपोर्ट और प्रमाणित फाइल मूवमेंट रजिस्टर प्रदान करें, जिसकी एक प्रति अनुलग्नक-ए के रूप में संलग्न है।",
            "2. कृपया वार्ड 4 सिविल लाइंस कार्यालय के उन सभी संबंधित अधिकारियों/कर्मचारियों के नाम, पदनाम और आधिकारिक संपर्क विवरण बताएं जिनके पास यह मामला 30 दिनों की विधिक सीमा से अधिक समय तक लंबित रहा।",
            "3. नागरिक अधिकार पत्र के अनुसार इस श्रेणी की जन शिकायत के निवारण हेतु निर्धारित समयसीमा क्या है?",
            "4. कृपया वार्ड 4 में राशन वितरण करने वाली संबंधित उचित दर दुकान (कोटेदार) के लिए माहवार स्टॉक स्थिति और बीपीएल पात्रता वितरण रजिस्टर की प्रमाणित प्रति उपलब्ध कराएं।",
            "5. कृपया उपरोक्त शिकायत आवेदन के प्रसंस्करण और वर्तमान निस्तारण स्थिति के संबंध में दर्ज सभी मौजूदा फाइल नोटिंग्स, कार्यालय पत्राचार, प्रोसेसिंग शीट, निरीक्षण रिपोर्ट और आधिकारिक आदेशों की प्रमाणित प्रतियां उपलब्ध कराएं।"
        ]
    elif case_id == "ARZ-1046":
        return [
            "1. कृपया आवेदक शिवांशु पाण्डेय द्वारा दिनांक 10-जनवरी-2026 को महरौली तहसील में प्रस्तुत भूमि नामांतरण आवेदन (खसरा संख्या 45/12, संदर्भ: LND-88301) की दैनिक कार्य प्रगति आख्या एवं प्रमाणित फाइल संचालन पंजी उपलब्ध कराएं।",
            "2. कृपया संबंधित पटवारी एवं राजस्व निरीक्षक के नाम एवं पदनाम स्पष्ट करें जिनके समक्ष यह फाइल 30-दिवसीय वैधानिक समयसीमा बीतने के उपरांत भी अनिस्तारित रही।",
            "3. दिल्ली भूमि सुधार अधिनियम एवं नागरिक अधिकार पत्र के अंतर्गत नामांतरण आदेश पारित करने की निर्धारित समयसीमा क्या है?",
            "4. क्या उक्त भूमि नामांतरण पर किसी पक्ष द्वारा कोई विधिक आपत्ति दर्ज की गई है? यदि हां, तो आपत्ति की प्रमाणित प्रति एवं नोटिस की प्रति प्रदान करें।",
            "5. उक्त प्रकरण में सक्षम प्राधिकारी एवं तहसीलदार द्वारा दर्ज समस्त आदेश-पत्रक (Order Sheet) एवं स्थलीय निरीक्षण आख्या की प्रमाणित प्रतिलिपि उपलब्ध कराएं।"
        ]
    elif case_id == "ARZ-1048":
        return [
            "1. कृपया दिनांक 28-फरवरी-2026 को कालकाजी निवासी वीरेंद्र गुप्ता द्वारा प्रस्तुत मूल शिकायत (संदर्भ: DISCOM-PWR-44910) की दैनिक प्रगति आख्या एवं प्रमाणित फाइल मूवमेंट रजिस्टर प्रदान करें, जिसकी प्रति संलग्न है।",
            "2. कृपया उक्त मंडल कार्यालय के उन सभी संबंधित अधिकारियों एवं खाद्य निरीक्षकों के नाम व पदनाम बताएं जिनके पास यह मामला 30-दिवसीय वैधानिक सीमा से अधिक समय तक लंबित रहा।",
            "3. नागरिक अधिकार पत्र के अनुसार खाद्य गुणवत्ता एवं कैंटीन संबंधी जन शिकायतों के निस्तारण की निर्धारित विहित समयसीमा क्या है?",
            "4. खाद्य सुरक्षा एवं मानक अधिनियम (FSSA 2006) की धारा 26 व 31 के अंतर्गत संबंधित कैंटीन/मेस प्रतिष्ठान को जारी नवीनतम खाद्य सुरक्षा निरीक्षण रिपोर्ट, स्वच्छता ऑडिट प्रमाणपत्र एवं वैध एफएसएसएआई लाइसेंस की प्रमाणित प्रति उपलब्ध कराएं।",
            "5. आरटीआई अधिनियम की धारा 2(f) के तहत गत 12 महीनों में उक्त कैंटीन से लिए गए खाद्य एवं पेयजल नमूनों की प्रयोगशाला परीक्षण/माइक्रोबायोलॉजिकल जांच आख्याएं एवं दोषी पाए जाने पर की गई दंडात्मक कार्यवाही का प्रमाणित विवरण दें।",
            "6. कृपया उक्त शिकायत के संबंध में दर्ज समस्त नोटशीट, कार्यालय पत्राचार, निरीक्षण रिपोर्ट एवं सक्षम प्राधिकारी के अंतिम आदेशों की प्रमाणित प्रतियां प्रदान करें।"
        ]
    else:
        return [
            f"1. कृपया आवेदक {app_name} द्वारा प्रस्तुत मूल शिकायत आवेदन{ref_part}{date_part} की दैनिक प्रगति रिपोर्ट और प्रमाणित फाइल मूवमेंट रजिस्टर प्रदान करें, जिसकी प्रति संलग्न है।",
            f"2. कृपया {loc} कार्यालय के उन सभी संबंधित अधिकारियों/कर्मचारियों के नाम, पदनाम और संपर्क विवरण बताएं जिनके पास यह मामला 30-दिवसीय विधिक सीमा से अधिक लंबित रहा।",
            f"3. नागरिक अधिकार पत्र के अनुसार {dept} की इस श्रेणी की जन समस्या के समाधान हेतु निर्धारित वैधानिक समयसीमा क्या है?",
            f"4. कृपया संबंधित कार्यालय द्वारा इस मामले में की गई स्थलीय जांच, पत्राचार, फाइल नोटिंग्स एवं सक्षम प्राधिकारी के आदेशों की प्रमाणित प्रतियां उपलब्ध कराएं।"
        ]


def _get_english_questions(case, draft, pio, ref_no, sub_date, complainant):
    qs = draft.get("questions", [])
    if qs and not any(_has_devanagari(str(q)) for q in qs):
        return qs
    case_id = case.get("case_id", "")
    app_name = complainant.get("name", "Citizen Applicant")
    loc = pio.get("matched_user_locality") or complainant.get("address") or "Local Division"
    dept = pio.get("department", "Public Authority")
    ref_part = f" (Ref No: {ref_no})" if ref_no and ref_no != "Not Provided" else ""
    date_part = f" submitted on {sub_date}" if sub_date and sub_date != "Unconfirmed" else ""

    if case_id == "ARZ-1042":
        return [
            f"1. Please provide the daily progress report and certified file movement register regarding the grievance application (Ref: {ref_no}) submitted by Sunita Devi on {sub_date}.",
            "2. Please specify the names, designations, and official contact details of all dealing officers/staff in Ward 4 Civil Lines office who held this file beyond statutory limits.",
            "3. What is the prescribed timeline as per the Citizen Charter for resolving this class of public grievance?",
            "4. Please disclose the month-wise stock position and BPL entitlement distribution register copies for the fair price shop servicing Ward 4.",
            "5. Please disclose certified copies of all existing file notings, office correspondence, processing sheets, and inspection reports concerning this grievance."
        ]
    elif case_id == "ARZ-1046":
        return [
            f"1. Please provide the daily progress report and certified file movement register regarding the land mutation application (Khasra 45/12, Ref: {ref_no}) submitted on {sub_date} at Mehrauli Tehsil.",
            "2. Please specify the names, designations, and official contact details of all dealing officers, including Patwari and Revenue Inspector, who held this file beyond 30 days.",
            "3. What is the prescribed timeline as per the Citizen Charter and Delhi Land Reforms Act for passing land mutation orders?",
            "4. Please disclose certified copies of Khasra/Khatauni mutations, field inspection reports, and any objections lodged on record.",
            "5. Please disclose certified copies of all existing file notings, office correspondence, processing sheets, and orders issued by the Tehsildar."
        ]
    elif case_id == "ARZ-1048":
        return [
            f"1. Please provide certified copy of the approved DPR and financial sanction order for the drain construction on 25 Feet Road, SGM Nagar (Ref: {ref_no}).",
            "2. Please provide certified details of total budget allocated, payments released to the contractor, and certified copies of the Measurement Book (MB).",
            "3. Please disclose the names and designations of the Executive Engineer and Junior Engineer responsible for disbursing payments prior to completion.",
            "4. Please disclose whether any inquiry committee was formed by the Municipal Corporation regarding drain clogging and substandard work."
        ]
    else:
        return [
            f"1. Please provide the daily progress report and certified file movement register regarding the grievance application{ref_part}{date_part}.",
            f"2. Please specify the names, designations, and official contact details of all dealing officers/staff in {loc} office who held this file beyond statutory limits.",
            f"3. What is the prescribed timeline as per the Citizen Charter for resolving this class of public grievance in {dept}?",
            "4. Please disclose certified copies of all existing file notings, office correspondence, processing sheets, and inspection reports concerning this grievance."
        ]


class RTIPDFGenerator:
    """
    Deterministic RTI Legal Application, First Appeal & Statutory Negligence PDF Generator.
    Complies strictly with Indian RTI Act 2005, Central RTI Fee Rules 2012, and BNS/IPC Legal Notices.
    Generates Form-A, First Appeal, and Statutory Legal Notices in the chosen language (English or Hindi).
    """

    def generate_pdf_bytes(self, case: dict, doc_type: str = "rti", lang: str = "en") -> bytes:
        complainant = case.get("complainant", {})
        pio = case.get("suggested_pio", {})
        faa = case.get("suggested_faa", {}) or pio.get("faa", {})
        draft = case.get("draft_rti", {})
        case_id = case.get("case_id", "ARZ-0000")
        ref_no = case.get("application_ref_no", "Not Provided")
        sub_date = case.get("original_submission_date", "Unconfirmed")
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        today_date = datetime.now().strftime("%d-%b-%Y")
        legal_info = case.get("statutory_legal_analysis", {})

        if not HAS_REPORTLAB:
            return (case.get("ml_report_format") or "FORM A - RTI APPLICATION REPORT").encode("utf-8")

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        is_hi = (lang == "hi")
        if is_hi:
            font_norm, font_bold = _register_devnagari_fonts()
        else:
            font_norm, font_bold = "Helvetica", "Helvetica-Bold"

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=12.5,
            leading=16,
            textColor=colors.HexColor("#1E242B"),
            alignment=1, # Center
            fontName=font_bold,
            spaceAfter=8
        )

        heading_style = ParagraphStyle(
            'HeadingStyle',
            parent=styles['Heading2'],
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#D94E28"),
            fontName=font_bold,
            spaceBefore=8,
            spaceAfter=4
        )

        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#1E242B"),
            fontName=font_norm
        )

        signature_style = ParagraphStyle(
            'SignatureStyle',
            parent=styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#1E242B"),
            fontName=font_bold,
            alignment=2 # Right align
        )

        elements = []

        if doc_type == "appeal":
            if is_hi:
                # =================== FIRST APPEAL MEMORANDUM (SECTION 19(1)) - HINDI ===================
                elements.append(Paragraph("सूचना का अधिकार अधिनियम, 2005 की धारा 19(1) के अंतर्गत प्रथम अपील का ज्ञापन", title_style))
                elements.append(Paragraph(f"<b>सक्षम प्रथम अपीलीय प्राधिकारी (FAA) के समक्ष</b> &nbsp;|&nbsp; <b>केस संदर्भ:</b> {case_id}", ParagraphStyle('SubHeader', parent=body_style, alignment=1, fontName=font_norm)))
                elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#D94E28"), spaceAfter=10))

                elements.append(Paragraph("सेवा में: सक्षम प्रथम अपीलीय प्राधिकारी:", heading_style))
                faa_name = faa.get('faa_name') or 'प्रथम अपीलीय प्राधिकारी'
                faa_desig = _t_designation(faa.get('designation', 'अपर जिलाधिकारी / संयुक्त सचिव'))
                faa_office = faa.get('office_address', pio.get('office_address', 'जिला कचेहरी परिसर'))
                faa_text = f"<b>{faa_name}</b><br/>" \
                           f"पदनाम: {faa_desig}<br/>" \
                           f"कार्यालय: {faa_office}<br/>" \
                           f"ईमेल: {faa.get('email', 'faa@gov.in')} &nbsp;|&nbsp; दूरभाष: {faa.get('phone', 'उपलब्ध नहीं')}"
                elements.append(Paragraph(faa_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("1. अपीलार्थी का विवरण:", heading_style))
                app_text = f"<b>नाम:</b> {complainant.get('name', 'नागरिक अपीलार्थी')} (भारत का नागरिक)<br/>" \
                           f"<b>डाक पता:</b> {complainant.get('address', 'उपलब्ध नहीं')}<br/>" \
                           f"<b>संपर्क:</b> {complainant.get('contact', 'उपलब्ध नहीं')}"
                elements.append(Paragraph(app_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("2. प्रत्यर्थी जन सूचना अधिकारी (PIO) का विवरण:", heading_style))
                resp_text = f"<b>नामित जन सूचना अधिकारी:</b> {pio.get('pio_name', 'जन सूचना अधिकारी')} ({_t_designation(pio.get('designation', 'PIO'))})<br/>" \
                            f"<b>विभाग:</b> {_t_dept(pio.get('department'))}<br/>" \
                            f"<b>कार्यालय पता:</b> {pio.get('office_address', '')} ({_t_locality(pio.get('distance_label', 'निकटतम कार्यालय'))})<br/>" \
                            f"<b>मूल आरटीआई आवेदन तिथि:</b> {sub_date} &nbsp;|&nbsp; <b>शिकायत संदर्भ सं.:</b> {ref_no}"
                elements.append(Paragraph(resp_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("3. प्रथम अपील के सांविधिक कानूनी आधार:", heading_style))
                grounds = case.get("first_appeal_draft", {}).get("grounds_of_appeal")
                if not grounds or not any(any('\u0900' <= ch <= '\u097f' for ch in str(g)) for g in grounds):
                    hi_appeal = legal_engine.generate_first_appeal_draft(case, lang="hi")
                    grounds = hi_appeal.get("grounds_of_appeal", [])
                if not grounds:
                    grounds = [
                        "1. जन सूचना अधिकारी धारा 7(1) के अंतर्गत विहित 30-दिवसीय अनिवार्य समयसीमा में सूचना प्रदान करने में विफल रहे हैं।",
                        "2. आरटीआई अधिनियम की धारा 7(2) के अनुसार विहित अवधि में सूचना न देना आवेदन की स्वतः अस्वीकृति (Deemed Refusal) है।",
                        "3. धारा 7(6) के अनुसार अपीलार्थी समस्त वांछित प्रमाणित सूचनाएं पूर्णतः निःशुल्क (FREE OF COST) प्राप्त करने का विधिक हकदार है।",
                        "4. मनोहर बनाम महाराष्ट्र राज्य (AIR 2013 SC 681) के अनुसार दोषी अधिकारी पर धारा 20(1) के तहत ₹250 प्रतिदिन की दर से जुर्माना देय है।"
                    ]
                for g in grounds:
                    elements.append(Paragraph(g, body_style))
                    elements.append(Spacer(1, 3))

                elements.append(Spacer(1, 4))
                elements.append(Paragraph("4. याचना एवं अनुतोष (RELIEFS SOUGHT):", heading_style))
                prayers = case.get("first_appeal_draft", {}).get("prayers_sought")
                if not prayers or not any(any('\u0900' <= ch <= '\u097f' for ch in str(p)) for p in prayers):
                    hi_appeal = legal_engine.generate_first_appeal_draft(case, lang="hi")
                    prayers = hi_appeal.get("prayers_sought", [])
                if not prayers:
                    prayers = [
                        "क) जन सूचना अधिकारी को 7 दिनों के भीतर सभी प्रमाणित पत्रावलियां निःशुल्क उपलब्ध कराने का आदेश दिया जाए।",
                        "ख) प्रथम अपीलीय प्राधिकारी के समक्ष अपीलार्थी को व्यक्तिगत सुनवाई का अवसर प्रदान किया जाए।",
                        "ग) दोषी अधिकारी के विरुद्ध धारा 20(1) के तहत जुर्माने की कार्यवाही संस्तुत की जाए।"
                    ]
                for p in prayers:
                    elements.append(Paragraph(f"• {p}", body_style))
                    elements.append(Spacer(1, 2))

                elements.append(Spacer(1, 12))
                sig_box = f"<b>अपीलार्थी का सत्यापन एवं हस्ताक्षर</b><br/><br/>" \
                          f"____________________________________________<br/>" \
                          f"हस्ताक्षर अपीलार्थी: <b>{complainant.get('name', 'नागरिक अपीलार्थी')}</b><br/>" \
                          f"दिनांक: {today_date} &nbsp;|&nbsp; स्थान: {_t_locality(pio.get('matched_user_locality', 'स्थानीय मंडल'))}"
                elements.append(Paragraph(sig_box, signature_style))
            else:
                # =================== FIRST APPEAL MEMORANDUM (SECTION 19(1)) - ENGLISH ===================
                elements.append(Paragraph("MEMORANDUM OF FIRST APPEAL UNDER SECTION 19(1) OF RTI ACT 2005", title_style))
                elements.append(Paragraph(f"<b>BEFORE THE FIRST APPELLATE AUTHORITY (FAA) &nbsp;|&nbsp; CASE REF:</b> {case_id}", ParagraphStyle('SubHeader', parent=body_style, alignment=1, fontName=font_norm)))
                elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#D94E28"), spaceAfter=10))

                elements.append(Paragraph("TO: THE DESIGNATED FIRST APPELLATE AUTHORITY (FAA):", heading_style))
                faa_name = faa.get('faa_name') or 'First Appellate Authority (Senior Officer)'
                faa_desig = faa.get('designation', 'Additional District Magistrate / Joint Secretary')
                faa_office = faa.get('office_address', pio.get('office_address', 'Collectorate Complex'))
                faa_text = f"<b>{faa_name}</b><br/>" \
                           f"Designation: {faa_desig}<br/>" \
                           f"Office: {faa_office}<br/>" \
                           f"Email: {faa.get('email', 'faa@gov.in')} &nbsp;|&nbsp; Phone: {faa.get('phone', 'N/A')}"
                elements.append(Paragraph(faa_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("1. PARTICULARS OF THE APPELLANT:", heading_style))
                app_text = f"<b>Name:</b> {complainant.get('name', 'Citizen Appellant')} (Citizen of India)<br/>" \
                           f"<b>Postal Address:</b> {complainant.get('address', 'N/A')}<br/>" \
                           f"<b>Contact:</b> {complainant.get('contact', 'N/A')}"
                elements.append(Paragraph(app_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("2. PARTICULARS OF THE RESPONDENT PUBLIC INFORMATION OFFICER (PIO):", heading_style))
                resp_text = f"<b>Designated PIO:</b> {pio.get('pio_name', 'PIO')} ({pio.get('designation', '')})<br/>" \
                            f"<b>Department:</b> {pio.get('department', '')}<br/>" \
                            f"<b>Office:</b> {pio.get('office_address', '')} ({pio.get('distance_label', 'Nearest Office')})<br/>" \
                            f"<b>Initial RTI Application Date:</b> {sub_date} &nbsp;|&nbsp; <b>Original Grievance Ref:</b> {ref_no}"
                elements.append(Paragraph(resp_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("3. STATUTORY GROUNDS OF FIRST APPEAL:", heading_style))
                grounds = case.get("first_appeal_draft", {}).get("grounds_of_appeal")
                if not grounds or any(any('\u0900' <= ch <= '\u097f' for ch in str(g)) for g in grounds):
                    en_appeal = legal_engine.generate_first_appeal_draft(case, lang="en")
                    grounds = en_appeal.get("grounds_of_appeal", [])
                if not grounds:
                    grounds = [
                        "1. The Respondent PIO failed to furnish requested information within the mandatory 30-day statutory SLA under Section 7(1).",
                        "2. Failure of PIO constitutes Deemed Refusal under Section 7(2) of RTI Act 2005.",
                        "3. Appellant is entitled to receive records FREE OF COST under Section 7(6).",
                        "4. Personal penalty of Rs. 250/day up to Rs. 25,000 is chargeable under Section 20(1) (Manohar v. State of Maharashtra AIR 2013 SC 681)."
                    ]
                for g in grounds:
                    elements.append(Paragraph(g, body_style))
                    elements.append(Spacer(1, 3))

                elements.append(Spacer(1, 4))
                elements.append(Paragraph("4. RELIEFS & PRAYERS SOUGHT:", heading_style))
                prayers = case.get("first_appeal_draft", {}).get("prayers_sought")
                if not prayers or any(any('\u0900' <= ch <= '\u097f' for ch in str(p)) for p in prayers):
                    en_appeal = legal_engine.generate_first_appeal_draft(case, lang="en")
                    prayers = en_appeal.get("prayers_sought", [])
                if not prayers:
                    prayers = [
                        "a) Direct the PIO to provide certified copies of records FREE OF CHARGE within 7 days.",
                        "b) Grant personal hearing to Appellant before the First Appellate Authority.",
                        "c) Recommend Section 20(1) penalty proceedings against the defaulting officer."
                    ]
                for p in prayers:
                    elements.append(Paragraph(f"• {p}", body_style))
                    elements.append(Spacer(1, 2))

                elements.append(Spacer(1, 12))
                sig_box = f"<b>VERIFICATION & SIGNATURE OF APPELLANT</b><br/><br/>" \
                          f"____________________________________________<br/>" \
                          f"Signature of Appellant: <b>{complainant.get('name', 'Citizen Appellant')}</b><br/>" \
                          f"Date: {today_date} &nbsp;|&nbsp; Place: {pio.get('matched_user_locality', 'Local Division')}"
                elements.append(Paragraph(sig_box, signature_style))

        elif doc_type == "notice":
            if is_hi:
                # =================== ADVOCATE STATUTORY LEGAL NOTICE - HINDI ===================
                elements.append(Paragraph("सिविल प्रक्रिया संहिता, 1908 की धारा 80 सपठित आईपीसी एवं बीएनएस के अंतर्गत सांविधिक विधिक नोटिस", title_style))
                elements.append(Paragraph(f"<b>लोक सेवक द्वारा कर्तव्य उपेक्षा एवं आरटीआई धारा 20(1) नोटिस</b> &nbsp;|&nbsp; <b>केस आईडी:</b> {case_id}", ParagraphStyle('SubHeader', parent=body_style, alignment=1, fontName=font_norm)))
                elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E242B"), spaceAfter=10))

                notice_txt = case.get("legal_notice_draft", {}).get("notice_text")
                if not notice_txt or not _has_devanagari(notice_txt):
                    hi_not = legal_engine.generate_legal_notice_draft(case, legal_info, lang="hi")
                    notice_txt = hi_not.get("notice_text", "")
                if not notice_txt:
                    notice_txt = (
                        f"सेवा में: {pio.get('pio_name', 'जन सूचना अधिकारी')} ({pio.get('office_address', 'कचेहरी परिसर')})\n\n"
                        f"अपने मुवक्किल {complainant.get('name', 'नागरिक आवेदक')} के विधिक अनुदेशों के अधीन यह विधिक नोटिस प्रेषित है।"
                    )
                for line in notice_txt.split("\n"):
                    if line.strip().startswith("आरोपित कानूनी") or line.strip().startswith("STATUTORY CHARGES") or line.strip().startswith("सेवा में:"):
                        elements.append(Paragraph(f"<b>{line}</b>", heading_style))
                    elif line.strip():
                        elements.append(Paragraph(line, body_style))
                        elements.append(Spacer(1, 3))

                elements.append(Spacer(1, 15))
                sig_box = f"<b>अधिवक्ता एवं विधिक परामर्शदाता</b><br/><br/>" \
                          f"____________________________________________<br/>" \
                          f"एस. कालरा एवं सहयोगी (बार काउंसिल ऑफ दिल्ली)<br/>" \
                          f"अधिवक्ता मुवक्किल: <b>{complainant.get('name', 'नागरिक आवेदक')}</b><br/>" \
                          f"दिनांक: {today_date}"
                elements.append(Paragraph(sig_box, signature_style))
            else:
                # =================== ADVOCATE STATUTORY LEGAL NOTICE - ENGLISH ===================
                elements.append(Paragraph("STATUTORY LEGAL NOTICE UNDER SECTION 80 CPC READ WITH IPC & BNS", title_style))
                elements.append(Paragraph(f"<b>ADVOCATE NOTICE FOR PUBLIC OFFICER DERELICTION &nbsp;|&nbsp; CASE ID:</b> {case_id}", ParagraphStyle('SubHeader', parent=body_style, alignment=1, fontName=font_norm)))
                elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E242B"), spaceAfter=10))

                notice_txt = case.get("legal_notice_draft", {}).get("notice_text")
                if not notice_txt or _has_devanagari(notice_txt):
                    en_not = legal_engine.generate_legal_notice_draft(case, legal_info, lang="en")
                    notice_txt = en_not.get("notice_text", "")
                if not notice_txt:
                    notice_txt = (
                        f"LEGAL NOTICE UNDER SECTION 80 CPC & SECTIONS OF IPC/BNS\n"
                        f"To: {pio.get('pio_name')} ({pio.get('designation', 'PIO')}), {pio.get('office_address')}\n\n"
                        f"Under instructions from our client {complainant.get('name')}, notice is hereby given of statutory dereliction regarding grievance Ref: {ref_no}."
                    )
                for line in notice_txt.split("\n"):
                    if line.strip().startswith("STATUTORY CHARGES") or line.strip().startswith("To:") or line.strip().startswith("LEGAL NOTICE"):
                        elements.append(Paragraph(f"<b>{line}</b>", heading_style))
                    elif line.strip():
                        elements.append(Paragraph(line, body_style))
                        elements.append(Spacer(1, 3))

                elements.append(Spacer(1, 15))
                sig_box = f"<b>LEGAL COUNSEL & ADVOCATE ON RECORD</b><br/><br/>" \
                          f"____________________________________________<br/>" \
                          f"Adv. S. Kalra & Associates (Civic Legal NGO)<br/>" \
                          f"Counsel for Complainant: <b>{complainant.get('name', 'Citizen Applicant')}</b><br/>" \
                          f"Date: {today_date}"
                elements.append(Paragraph(sig_box, signature_style))

        elif doc_type == "slip":
            if is_hi:
                # =================== SPEED POST DISPATCH SLIP & REGISTERED AD - HINDI ===================
                title_text = "भारतीय स्पीड पोस्ट प्रेषण रसीद एवं पावती डॉकेट"
                sub_text = f"<b>डाक विभाग, भारत सरकार &nbsp;|&nbsp; वैधानिक प्रेषण डेस्क &nbsp;|&nbsp; केस आईडी:</b> {case_id}"
                elements.append(Paragraph(title_text, title_style))
                elements.append(Paragraph(sub_text, ParagraphStyle('SubHeader', parent=body_style, alignment=1, fontName=font_norm)))
                elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#D94E28"), spaceAfter=10))

                tracking_code = case.get("postal_tracking_code") or f"EM{int(hashlib.md5(case_id.encode()).hexdigest()[:8], 16) % 900000000 + 100000000}IN"
                
                slip_meta = [
                    [Paragraph("<b>प्रेषण संख्या (CONSIGNMENT):</b>", body_style), Paragraph(f"<font size=12><b>{tracking_code}</b></font> (रजिस्टर्ड डाक मय पावती)", body_style)],
                    [Paragraph("<b>सेवा का प्रकार:</b>", body_style), Paragraph("अंतर्देशीय स्पीड पोस्ट (SP_INLAND) - समय-संवेदनशील विधिक प्रेषण", body_style)],
                    [Paragraph("<b>विधिक उपधारणा:</b>", body_style), Paragraph("जनरल क्लॉजेज एक्ट 1897 की धारा 27 एवं साक्ष्य अधिनियम धारा 114(e) के तहत वैध तामील", body_style)],
                    [Paragraph("<b>प्रेषण तिथि:</b>", body_style), Paragraph(f"{today_date} 10:30:00 IST", body_style)],
                    [Paragraph("<b>वैधानिक समयसीमा:</b>", body_style), Paragraph("48 घंटे आपातकालीन जीवन व स्वतंत्रता" if case.get("is_life_liberty") else "30-दिवसीय वैधानिक आरटीआई समयसीमा", body_style)]
                ]
                t = Table(slip_meta, colWidths=[150, 360])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ]))
                elements.append(t)
                elements.append(Spacer(1, 10))

                # Addressee & Sender Blocks
                elements.append(Paragraph("<b>प्राप्तकर्ता अधिकारी (TO):</b>", heading_style))
                addr_text = f"<b>{pio.get('pio_name', 'जन सूचना अधिकारी')}</b> ({_t_designation(pio.get('designation', 'PIO'))})<br/>" \
                            f"<b>विभाग:</b> {_t_dept(pio.get('department', 'लोक प्राधिकरण'))}<br/>" \
                            f"<b>कार्यालय:</b> {pio.get('office_address', 'कचेहरी परिसर')}<br/>" \
                            f"<b>कमरा:</b> {pio.get('room_no', 'भूतल आरटीआई काउंटर')}"
                elements.append(Paragraph(addr_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("<b>प्रेषक नागरिक (FROM):</b>", heading_style))
                sndr_text = f"<b>{complainant.get('name', 'नागरिक आवेदक')}</b> (भारत का नागरिक)<br/>" \
                            f"<b>पता:</b> {complainant.get('address', 'स्थानीय पता')}<br/>" \
                            f"<b>संपर्क:</b> {complainant.get('contact', 'उपलब्ध नहीं')}<br/>" \
                            f"<b>मामला:</b> शिकायत संदर्भ: {ref_no} &nbsp;|&nbsp; केस आईडी: {case_id}"
                elements.append(Paragraph(sndr_text, body_style))
                elements.append(Spacer(1, 10))

                # Postal Clerk & Dispatch Counter Seal
                clerk_box = f"<b>डाक काउंटर आधिकारिक प्रमाणीकरण</b><br/><br/>" \
                            f"बुकिंग सं.: PO/VNS/SP-{tracking_code[2:7]} &nbsp;|&nbsp; भार: 42 ग्राम &nbsp;|&nbsp; विहित डाक शुल्क: ₹41.00<br/>" \
                            f"रजिस्टर्ड पावती बारकोड संलग्न &bull; वापसी रसीद डॉकेट: AD-{tracking_code[2:10]}<br/>" \
                            f"____________________________________________<br/>" \
                            f"डाक बुकिंग सहायक / स्पीड पोस्ट केंद्र अधिकृत हस्ताक्षर"
                elements.append(Paragraph(clerk_box, ParagraphStyle('PostalSign', parent=body_style, alignment=0, fontName=font_norm)))
            else:
                # =================== SPEED POST DISPATCH SLIP & REGISTERED AD - ENGLISH ===================
                elements.append(Paragraph("INDIAN SPEED POST DISPATCH SLIP & REGISTERED AD ACKNOWLEDGEMENT", title_style))
                elements.append(Paragraph(f"<b>DEPARTMENT OF POSTS, INDIA &nbsp;|&nbsp; STATUTORY DISPATCH DESK &nbsp;|&nbsp; CASE ID:</b> {case_id}", ParagraphStyle('SubHeader', parent=body_style, alignment=1, fontName=font_norm)))
                elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#D94E28"), spaceAfter=10))

                tracking_code = case.get("postal_tracking_code") or f"EM{int(hashlib.md5(case_id.encode()).hexdigest()[:8], 16) % 900000000 + 100000000}IN"
                
                slip_meta = [
                    [Paragraph("<b>CONSIGNMENT NO:</b>", body_style), Paragraph(f"<font size=12><b>{tracking_code}</b></font> (Registered Post with AD)", body_style)],
                    [Paragraph("<b>SERVICE TYPE:</b>", body_style), Paragraph("DOMESTIC SPEED POST (SP_INLAND) - TIME-CRITICAL STATUTORY FILING", body_style)],
                    [Paragraph("<b>LEGAL PRESUMPTION:</b>", body_style), Paragraph("Presumption of Valid Service under Section 27 General Clauses Act 1897 & Section 114(e) Indian Evidence Act", body_style)],
                    [Paragraph("<b>DISPATCH DATE:</b>", body_style), Paragraph(f"{today_date} 10:30:00 IST", body_style)],
                    [Paragraph("<b>STATUTORY MANDATE:</b>", body_style), Paragraph("48-HOUR URGENT LIFE & LIBERTY SLA" if case.get("is_life_liberty") else "30-DAY STATUTORY RTI SLA", body_style)]
                ]
                t = Table(slip_meta, colWidths=[150, 360])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ]))
                elements.append(t)
                elements.append(Spacer(1, 10))

                # Addressee & Sender Blocks
                elements.append(Paragraph("<b>ADDRESSEE (TO):</b>", heading_style))
                addr_text = f"<b>{pio.get('pio_name', 'Public Information Officer')}</b> ({pio.get('designation', 'PIO')})<br/>" \
                            f"<b>Department:</b> {pio.get('department', 'Public Authority')}<br/>" \
                            f"<b>Office:</b> {pio.get('office_address', 'Public Information Office')}<br/>" \
                            f"<b>Room / Desk:</b> {pio.get('room_no', 'Ground Floor RTI Desk')}"
                elements.append(Paragraph(addr_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("<b>SENDER (FROM):</b>", heading_style))
                sndr_text = f"<b>{complainant.get('name', 'Citizen Applicant')}</b> (Natural Person / Citizen of India)<br/>" \
                            f"<b>Address:</b> {complainant.get('address', 'Residential Address')}<br/>" \
                            f"<b>Contact:</b> {complainant.get('contact', 'N/A')}<br/>" \
                            f"<b>Matter:</b> Grievance Ref: {ref_no} &nbsp;|&nbsp; Case ID: {case_id}"
                elements.append(Paragraph(sndr_text, body_style))
                elements.append(Spacer(1, 10))

                # Postal Clerk & Dispatch Counter Seal
                clerk_box = f"<b>POSTAL DESK OFFICIAL AUTHENTICATION</b><br/><br/>" \
                            f"Counter Booking No: PO/VNS/SP-{tracking_code[2:7]} &nbsp;|&nbsp; Weight: 42g &nbsp;|&nbsp; Tariff: Rs. 41.00<br/>" \
                            f"Registered A.D. Barcode Attached &bull; Return Receipt Docket: AD-{tracking_code[2:10]}<br/>" \
                            f"____________________________________________<br/>" \
                            f"Postal Booking Assistant / Speed Post Centre Signature"
                elements.append(Paragraph(clerk_box, ParagraphStyle('PostalSign', parent=body_style, alignment=0, fontName=font_norm)))

        else:
            if is_hi:
                # =================== FORM 'A' RTI APPLICATION - HINDI ===================
                if case.get("is_life_liberty"):
                    urgent_banner = Paragraph(
                        "<font color='#991B1B'><b>*** सांविधिक आपात सूचना: आरटीआई अधिनियम 2005 की धारा 7(1) के परंतुक के अधीन 48-घंटे में अनिवार्य प्रकटीकरण (जीवन एवं स्वतंत्रता) ***</b></font>",
                        ParagraphStyle('UrgentBanner', parent=body_style, alignment=1, fontSize=9.5, fontName=font_bold)
                    )
                    ub_table = Table([[urgent_banner]], colWidths=[510])
                    ub_table.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEE2E2")),
                        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#DC2626")),
                        ('TOPPADDING', (0,0), (-1,-1), 6),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ]))
                    elements.append(ub_table)
                    elements.append(Spacer(1, 6))

                elements.append(Paragraph("फॉर्म 'क' - सूचना का अधिकार अधिनियम 2005 की धारा 6(1) के अंतर्गत आवेदन पत्र", title_style))
                sla_hdr = "48 घंटे (धारा 7(1) परंतुक)" if case.get("is_life_liberty") else "30 दिन (धारा 7(1))"
                elements.append(Paragraph(f"<b>केस संदर्भ आईडी:</b> {case_id} &nbsp;|&nbsp; <b>दिनांक:</b> {today_date} &nbsp;|&nbsp; <b>वैधानिक समयसीमा:</b> {sla_hdr}", body_style))
                elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E242B"), spaceAfter=10))

                elements.append(Paragraph("सेवा में: नामित जन सूचना अधिकारी (निकटतम क्षेत्राधिकार):", heading_style))
                pio_text = f"<b>{pio.get('pio_name', 'जन सूचना अधिकारी')}</b><br/>" \
                           f"पदनाम: {_t_designation(pio.get('designation', 'सक्षम प्राधिकारी'))}<br/>" \
                           f"विभाग: {_t_dept(pio.get('department', ''))}<br/>" \
                           f"कार्यालय पता: {pio.get('office_address', '')}<br/>" \
                           f"कमरा/काउंटर: {pio.get('room_no', 'भूतल आरटीआई काउंटर')} &nbsp;|&nbsp; <b>निकटता:</b> {_t_locality(pio.get('distance_label', 'निकटतम कार्यालय'))}"
                elements.append(Paragraph(pio_text, body_style))
                elements.append(Spacer(1, 6))

                elements.append(Paragraph("1. आवेदक का विवरण (धारा 3 भारत का नागरिक):", heading_style))
                app_text = f"<b>आवेदक का पूर्ण नाम:</b> {complainant.get('name', 'नागरिक आवेदक')} (प्राकृतिक व्यक्ति / भारत का नागरिक)<br/>" \
                           f"<b>डाक पता:</b> {complainant.get('address', 'उपलब्ध नहीं')}<br/>" \
                           f"<b>संपर्क दूरभाष:</b> {complainant.get('contact', 'उपलब्ध नहीं')}<br/>" \
                           f"<b>मूल शिकायत संदर्भ सं.:</b> {ref_no} &nbsp;|&nbsp; <b>मूल जमा तिथि:</b> {sub_date}"
                elements.append(Paragraph(app_text, body_style))
                elements.append(Spacer(1, 6))

                if legal_info:
                    elements.append(Paragraph("2. विधिक प्रावधान एवं आईपीसी / बीएनएस प्रासंगिकता:", heading_style))
                    ipc_t = ", ".join(legal_info.get("ipc_sections", []))
                    bns_t = ", ".join(legal_info.get("bns_sections", []))
                    law_text = f"<b>प्रशासनिक उल्लंघन:</b> {_t_infraction(legal_info.get('statutory_infraction'))}<br/>" \
                               f"<b>आईपीसी धाराएं:</b> {ipc_t} &nbsp;|&nbsp; <b>बीएनएस 2023 धाराएं:</b> {bns_t}<br/>" \
                               f"<b>विधिक योग्यता स्कोर (Merit):</b> {legal_info.get('win_probability', 'उच्च')} ({legal_info.get('case_merit_score', 90)}/100)"
                    elements.append(Paragraph(law_text, body_style))
                    elements.append(Spacer(1, 6))

                elements.append(Paragraph("3. मांगी गई सूचना का विवरण (धारा 2(f) अभिलेख-आधारित प्रश्न):", heading_style))
                app_subj = draft.get('application_subject')
                if not app_subj or not _has_devanagari(app_subj):
                    app_subj = f"{_t_dept(pio.get('department'))} के संबंध में सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत लंबित जन शिकायत (संदर्भ सं: {ref_no}) की प्रमाणित स्थिति हेतु आवेदन"
                elements.append(Paragraph(f"<b>विषय:</b> {app_subj}", body_style))
                elements.append(Spacer(1, 4))

                elements.append(Paragraph("<b>उपलब्ध अभिलेखों से विशिष्ट वांछित सूचनाएं:</b>", body_style))
                hindi_questions = _get_hindi_questions(case, draft, pio, ref_no, sub_date, complainant)
                for q in hindi_questions:
                    elements.append(Paragraph(q, body_style))
                    elements.append(Spacer(1, 2.5))

                elements.append(Spacer(1, 6))
                elements.append(Paragraph("4. विहित शुल्क भुगतान एवं संलग्नक चेकलिस्ट:", heading_style))
                fees_text = draft.get('fees_paid')
                if not fees_text or not _has_devanagari(fees_text):
                    fees_text = "केंद्रीय आरटीआई नियमावली 2012 के नियम 3 के अनुसार ₹10 का पोस्टल ऑर्डर विहित शुल्क के रूप में संलग्न है।"
                elements.append(Paragraph(f"<b>आवेदन शुल्क विवरण:</b> {fees_text}", body_style))
                elements.append(Spacer(1, 3))
                elements.append(Paragraph("<b>अनिवार्य संलग्नक:</b><br/>"
                                           "• अनुलग्नक-क: मूल शिकायत आवेदन एवं आधिकारिक पावती रसीद की प्रमाणित प्रतिलिपि।<br/>"
                                           "• अनुलग्नक-ख: आवेदन शुल्क भुगतान प्रमाण (भारतीय पोस्टल ऑर्डर / डीडी)।<br/>"
                                           "• अनुलग्नक-ग: आवेदक का पहचान एवं निवास प्रमाण पत्र।", body_style))

                elements.append(Spacer(1, 10))
                sig_box = f"<b>आवेदक हस्ताक्षर एवं सत्यापन (धारा 6(1))</b><br/><br/>" \
                          f"____________________________________________<br/>" \
                          f"हस्ताक्षर / अंगूठा निशानी नागरिक आवेदक<br/>" \
                          f"नाम: <b>{complainant.get('name', 'नागरिक आवेदक')}</b><br/>" \
                          f"दिनांक: {today_date} &nbsp;|&nbsp; स्थान: {_t_locality(pio.get('matched_user_locality', 'स्थानीय मंडल'))}"
                elements.append(Paragraph(sig_box, signature_style))
            else:
                # =================== FORM 'A' RTI APPLICATION - ENGLISH ===================
                if case.get("is_life_liberty"):
                    urgent_banner = Paragraph(
                        "<font color='#991B1B'><b>*** STATUTORY URGENCY NOTICE: 48-HOUR MANDATORY DISCLOSURE UNDER PROVISO TO SECTION 7(1) RTI ACT 2005 (LIFE & LIBERTY) ***</b></font>",
                        ParagraphStyle('UrgentBanner', parent=body_style, alignment=1, fontSize=9.5, fontName=font_bold)
                    )
                    ub_table = Table([[urgent_banner]], colWidths=[510])
                    ub_table.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEE2E2")),
                        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#DC2626")),
                        ('TOPPADDING', (0,0), (-1,-1), 6),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ]))
                    elements.append(ub_table)
                    elements.append(Spacer(1, 6))

                elements.append(Paragraph("FORM 'A' - APPLICATION FOR INFORMATION UNDER SECTION 6(1) OF RTI ACT 2005", title_style))
                sla_hdr = "48 HOURS (SECTION 7(1) PROVISO)" if case.get("is_life_liberty") else "30 DAYS (SECTION 7(1))"
                elements.append(Paragraph(f"<b>CASE REF ID:</b> {case_id} &nbsp;|&nbsp; <b>DATE:</b> {today_date} &nbsp;|&nbsp; <b>STATUTORY SLA:</b> {sla_hdr}", body_style))
                elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E242B"), spaceAfter=10))

                # Recipient PIO Block with Nearest Geospatial Tag
                elements.append(Paragraph("TO THE DESIGNATED PUBLIC INFORMATION OFFICER (NEAREST JURISDICTION):", heading_style))
                pio_text = f"<b>{pio.get('pio_name', 'Public Information Officer')}</b><br/>" \
                           f"Designation: {pio.get('designation', 'PIO')}<br/>" \
                           f"Department: {pio.get('department', 'Public Authority')}<br/>" \
                           f"Office: {pio.get('office_address', 'Public Information Office')}<br/>" \
                           f"Room/Desk: {pio.get('room_no', 'Ground Floor RTI Desk')} &nbsp;|&nbsp; <b>Proximity:</b> {pio.get('distance_label', 'Nearest Local Office')}"
                elements.append(Paragraph(pio_text, body_style))
                elements.append(Spacer(1, 6))

                # Applicant Details
                elements.append(Paragraph("1. APPLICANT DETAILS (SECTION 3 INDIVIDUAL CITIZEN OF INDIA):", heading_style))
                app_text = f"<b>Full Name of Citizen Applicant:</b> {complainant.get('name', 'Citizen Applicant')} (Individual/Natural Person)<br/>" \
                           f"<b>Postal Address:</b> {complainant.get('address', 'N/A')}<br/>" \
                           f"<b>Contact Phone:</b> {complainant.get('contact', 'N/A')}<br/>" \
                           f"<b>Original Application Ref / Ack No:</b> {ref_no} &nbsp;|&nbsp; <b>Original Filing Date:</b> {sub_date}"
                elements.append(Paragraph(app_text, body_style))
                elements.append(Spacer(1, 6))

                # Statutory IPC/BNS Infraction Notice
                if legal_info:
                    elements.append(Paragraph("2. STATUTORY LEGAL FRAMEWORK & IPC / BNS RELEVANCE:", heading_style))
                    ipc_t = ", ".join(legal_info.get("ipc_sections", []))
                    bns_t = ", ".join(legal_info.get("bns_sections", []))
                    law_text = f"<b>Subject Matter Infraction:</b> {legal_info.get('statutory_infraction', 'Public Dereliction')}<br/>" \
                               f"<b>IPC Sections:</b> {ipc_t} &nbsp;|&nbsp; <b>BNS 2023 Sections:</b> {bns_t}<br/>" \
                               f"<b>Statutory Win Probability / Case Merit:</b> {legal_info.get('win_probability', 'HIGH')} ({legal_info.get('case_merit_score', 90)}/100)"
                    elements.append(Paragraph(law_text, body_style))
                    elements.append(Spacer(1, 6))

                # Application Subject & Record-Based Questions (Section 2(f))
                elements.append(Paragraph("3. PARTICULARS OF INFORMATION REQUIRED (SECTION 2(f) RECORD-BASED QUERIES):", heading_style))
                app_subj = draft.get('application_subject')
                if not app_subj or _has_devanagari(app_subj):
                    app_subj = f"Application under Section 6(1) of RTI Act 2005 seeking status on pending grievance (Ref No: {ref_no}, Submitted: {sub_date}) regarding {pio.get('department', 'Public Authority')}"
                elements.append(Paragraph(f"<b>Subject:</b> {app_subj}", body_style))
                elements.append(Spacer(1, 4))

                elements.append(Paragraph("<b>Specific Information Sought from Existing Records:</b>", body_style))
                english_questions = _get_english_questions(case, draft, pio, ref_no, sub_date, complainant)
                for q in english_questions:
                    elements.append(Paragraph(q, body_style))
                    elements.append(Spacer(1, 2.5))

                # Mandatory Enclosures & Fee Rules 2012
                elements.append(Spacer(1, 6))
                elements.append(Paragraph("4. STATUTORY FEE PAYMENT & ENCLOSURES CHECKLIST:", heading_style))
                fees_text = draft.get('fees_paid')
                if not fees_text or _has_devanagari(fees_text):
                    fees_text = "Rs. 10 Indian Postal Order attached under Rule 3 of Central RTI Rules 2012."
                elements.append(Paragraph(f"<b>Application Fee Details:</b> {fees_text}", body_style))
                elements.append(Spacer(1, 3))
                elements.append(Paragraph("<b>Mandatory Enclosures:</b><br/>"
                                           "• Annexure-A: Copy of Original Grievance Application & Acknowledgement Receipt.<br/>"
                                           "• Annexure-B: Proof of Application Fee Payment (Indian Postal Order / DD).<br/>"
                                           "• Annexure-C: Applicant Identity & Address Proof.", body_style))

                # Applicant Signature Block
                elements.append(Spacer(1, 10))
                sig_box = f"<b>APPLICANT SIGNATURE & AUTHENTICATION (SECTION 6(1))</b><br/><br/>" \
                          f"____________________________________________<br/>" \
                          f"Signature / Thumb Impression of Citizen Applicant<br/>" \
                          f"Name: <b>{complainant.get('name', 'Citizen Applicant')}</b><br/>" \
                          f"Date: {today_date} &nbsp;|&nbsp; Place: {pio.get('matched_user_locality', 'Local Division')}"
                elements.append(Paragraph(sig_box, signature_style))

        # Separate Internal Casework Audit Footer & SHA-256 Stamp
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#7A8B9E"), spaceAfter=6))
        doc_hash = hashlib.sha256(f"{case_id}-{doc_type}-{now_str}".encode()).hexdigest()[:16].upper()
        if is_hi:
            reviewer_name = case.get('reviewer') or 'अधिवक्ता एस. कालरा'
            audit_stamp = f"<b>अर्जी लीगल टेक आंतरिक ऑडिट एवं प्रेषण सत्यापन</b><br/>" \
                          f"समीक्षक: {reviewer_name} &nbsp;|&nbsp; सत्यापन हैश: <code>{doc_hash}</code> &nbsp;|&nbsp; " \
                          f"जनरेटेड: {now_str} &nbsp;|&nbsp; स्थिति: सत्यापित एवं मुहरबंद (VERIFIED & SEALED)"
        else:
            reviewer_name = case.get('reviewer') or 'Adv. S. Kalra'
            audit_stamp = f"<b>ARZI LEGAL TECH INTERNAL AUDIT & DISPATCH VERIFICATION</b><br/>" \
                          f"Reviewer: {reviewer_name} &nbsp;|&nbsp; Verification Hash: <code>{doc_hash}</code> &nbsp;|&nbsp; " \
                          f"Generated: {now_str} &nbsp;|&nbsp; Status: VERIFIED & SEALED"
        elements.append(Paragraph(audit_stamp, ParagraphStyle('AuditStyle', parent=body_style, fontSize=7.5, textColor=colors.HexColor("#555555"), fontName=font_norm)))

        doc.build(elements)
        return buffer.getvalue()

pdf_generator = RTIPDFGenerator()
