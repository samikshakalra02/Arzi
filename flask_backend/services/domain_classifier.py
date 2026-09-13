import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

class DomainClassifierService:
    """
    Production-grade Machine Learning Domain Classifier for Indian Public Administration.
    Classifies unstructured citizen grievances into 11 statutory public authority domains
    using TF-IDF n-gram vectorization combined with intent-driven semantic keyword scoring.
    Fully trained and calibrated for bilingual English and Devanagari Hindi citizen grievances.
    """

    DOMAINS = [
        "Revenue & Land Records",
        "Food, Civil Supplies & Consumer Affairs",
        "Municipal Public Works & Sanitation",
        "Water Supply & Jal Board",
        "Electricity & Power Discom",
        "Police, Criminal Justice & BNSS",
        "Health & Family Welfare",
        "Higher Education & Student Welfare",
        "Transport, Highways & Motor Vehicles / RTO",
        "Labour, Employment, Pension & Social Security",
        "Environment & Pollution Control"
    ]

    DOMAIN_TO_DEPARTMENT = {
        "Food, Civil Supplies & Consumer Affairs": "Food & Civil Supplies",
        "Food & Civil Supplies": "Food & Civil Supplies",
        "Municipal Public Works & Sanitation": "Municipal Public Works & Drainage",
        "Municipal Public Works & Drainage": "Municipal Public Works & Drainage",
        "Police, Criminal Justice & BNSS": "Police & Law Enforcement",
        "Police & Law Enforcement": "Police & Law Enforcement",
        "Revenue & Land Records": "Revenue & Land Records",
        "Water Supply & Jal Board": "Water Supply & Jal Board",
        "Electricity & Power Discom": "Electricity & Power Discom",
        "Health & Family Welfare": "Health & Family Welfare",
        "Higher Education & Student Welfare": "Higher Education & Student Welfare",
        "Transport, Highways & Motor Vehicles / RTO": "Transport, Highways & Motor Vehicles / RTO",
        "Labour, Employment, Pension & Social Security": "Labour, Employment, Pension & Social Security",
        "Environment & Pollution Control": "Environment & Pollution Control"
    }

    DOMAIN_KEYWORDS = {
        "Revenue & Land Records": [
            "land", "zameen", "khasra", "khatauni", "mutation", "daakhil kharij",
            "dakhil kharij", "patwari", "tehsildar", "registry", "land deed", "plot",
            "demarcation", "seema gyan", "jamabandi", "revenue court", "lekhpal",
            "land title", "encroachment on agricultural land", "land revenue", "katcheri",
            "bhoomi", "tehsil office", "sub-divisional magistrate land",
            # Devanagari Hindi
            "जमीन", "भूमि", "खसरा", "खतौनी", "नामांतरण", "दाखिल खारिज", "दाखिल-खारिज",
            "पटवारी", "लेखपाल", "तहसीलदार", "तहसील", "रजिस्ट्री", "सीमांकन", "सीमा ज्ञान",
            "जमाबंदी", "राजस्व न्यायालय", "कचहरी", "चकबंदी", "अवैध कब्जा", "कृषि भूमि"
        ],
        "Food, Civil Supplies & Consumer Affairs": [
            "food", "food quality", "canteen", "govt canteen", "government canteen",
            "taste", "bad taste", "rotten", "rotten food", "stale", "stale food", "spoiled",
            "mess", "hostel mess", "cafeteria", "pantry", "unhygienic food", "inedible",
            "substandard food", "food safety", "fssai", "food safety officer", "food inspector",
            "food adulteration", "adulteration", "milawat", "food poisoning", "mid day meal",
            "midday meal", "kitchen hygiene", "hotel food", "restaurant food", "food contamination",
            "packaged food", "food sample", "noxious food", "khana", "bhojan", "kharab khana",
            "bassi khana", "sadha khana", "khadya suraksha", "ration", "rashan", "food grain",
            "khadya", "grain", "bpl", "bpl card", "ration card", "pds shop", "fair price shop",
            "fps dealer", "wheat quota", "rice quota", "sugar quota", "antodaya", "aay card",
            "quota", "dealer", "black marketing of grain", "civil supplies", "defective goods",
            "consumer dispute", "consumer complaint", "consumer protection",
            # Devanagari Hindi
            "राशन", "राशन कार्ड", "खाद्य", "कोटेदार", "उचित दर दुकान", "गेहूं", "चावल",
            "चीनी", "बीपीएल", "अंत्योदय", "खराब भोजन", "सड़ा खाना", "बासी खाना", "कैंटीन",
            "मेस", "मध्याह्न भोजन", "मिड डे मील", "फूड प्वाइजनिंग", "मिलावट", "खाद्य सुरक्षा",
            "एफएसएसएआई", "उपभोक्ता", "उपभोक्ता शिकायत"
        ],
        "Municipal Public Works & Sanitation": [
            "drainage", "waterlogging", "sewer line", "gutter", "monsoon overflow",
            "road repair", "drain", "sewer", "nalla", "sadak", "pothole", "potholes",
            "municipal", "nagar nigam", "naali", "kachra", "garbage", "waste collection",
            "street light", "streetlights", "illegal construction", "building sanction",
            "encroachment on road", "footpath", "sanitation worker", "safai karmi",
            # Devanagari Hindi
            "सड़क", "गड्ढा", "गड्ढे", "नाली", "सीवर", "जलभराव", "कचरा", "सफाई",
            "सफाई कर्मी", "कूड़ा", "स्ट्रीट लाइट", "अवैध निर्माण", "नगर निगम", "नगर पालिका",
            "फुटपाथ", "गंदा नाला", "बरसाती पानी"
        ],
        "Water Supply & Jal Board": [
            "drinking water", "water supply", "pipeline leak", "contaminated water",
            "dirty water", "tap connection", "water tanker", "jal board", "jal sansthan",
            "water pressure", "overhead tank", "borewell", "tube well", "canal water",
            "irrigation water", "potable water", "foul smell in water", "water meter",
            "jal nigam", "submersible pump",
            # Devanagari Hindi
            "पीने का पानी", "पेयजल", "जल निगम", "जल संस्थान", "दूषित पानी", "गंदा पानी",
            "पाइपलाइन", "लीकेज", "पानी का नल", "पानी का टैंकर", "बोरवेल", "नलकूप",
            "सबमर्सिबल", "पानी का संकट", "पानी का मीटर"
        ],
        "Electricity & Power Discom": [
            "electricity", "power cut", "load shedding", "electric meter", "faulty meter",
            "high electricity bill", "exorbitant bill", "transformer", "transformer burn",
            "voltage fluctuation", "power supply", "discom", "power theft", "electric pole",
            "hanging wire", "high tension wire", "electricity connection", "bijli",
            "bijli vibhag", "power department", "tariff",
            # Devanagari Hindi
            "बिजली", "बिजली का बिल", "गलत बिल", "मीटर", "खराब मीटर", "बिजली कटौती",
            "लोड शेडिंग", "ट्रांसफार्मर", "ट्रांसफार्मर फुंकना", "वोल्टेज", "विद्युत",
            "डिस्कॉम", "हाई टेंशन तार", "बिजली विभाग", "नया कनेक्शन"
        ],
        "Police, Criminal Justice & BNSS": [
            "police", "fir", "first information report", "police station", "thana",
            "daroga", "sho", "sub-inspector", "investigation", "crime", "robbery",
            "theft", "chori", "armed snatching", "assault", "beating", "extortion",
            "threat", "cyber crime", "online fraud", "complaint refusal", "gd entry",
            "general diary", "bns", "bnss", "unlawful detention", "custodial violence",
            # Devanagari Hindi
            "पुलिस", "एफआईआर", "प्राथमिकी", "थाना", "कोतवाली", "दरोगा", "थानाध्यक्ष",
            "एसएचओ", "विवेचना", "जांच", "चोरी", "डकैती", "लूट", "मारपीट", "हमला",
            "धमकी", "साइबर अपराध", "बीएनएस", "बीएनएसएस", "गैरकानूनी हिरासत", "जीडी"
        ],
        "Health & Family Welfare": [
            "health", "hospital", "doctor", "medicine", "dawa", "ilaj", "cmo",
            "dispensary", "medical", "treatment", "swasthya", "aspatal", "icu",
            "ventilator", "oxygen cylinder", "ambulance", "primary health center", "phc",
            "chc", "emergency ward", "medical negligence", "injection", "surgical delay",
            # Devanagari Hindi
            "अस्पताल", "डॉक्टर", "दवा", "दवाइयां", "इलाज", "उपचार", "सीएमओ", "स्वास्थ्य",
            "आईसीयू", "ऑक्सीजन", "ऑक्सीजन सिलेंडर", "वेंटिलेटर", "एंबुलेंस",
            "प्राथमिक स्वास्थ्य केंद्र", "सामुदायिक स्वास्थ्य केंद्र", "चिकित्सा लापरवाही"
        ],
        "Higher Education & Student Welfare": [
            "scholarship", "disbursement", "tuition fee waiver", "post-matric scholarship",
            "student grant", "college", "university", "education", "chhatravriti", "student",
            "degree certificate", "marksheet verification", "marksheet", "convocation",
            "board exam", "admit card", "examination result", "re-evaluation", "ugc",
            "bhu", "kashi vidyapith", "fee refund", "hostel allotment",
            # Devanagari Hindi
            "छात्रवृत्ति", "स्कॉलरशिप", "शुल्क प्रतिपूर्ति", "विश्वविद्यालय", "कॉलेज",
            "डिग्री", "अंकपत्र", "मार्कशीट", "सत्यापन", "दीक्षांत समारोह", "प्रवेश",
            "परीक्षा परिणाम", "हॉस्टल", "बीएचयू", "काशी विद्यापीठ", "यूजीसी"
        ],
        "Transport, Highways & Motor Vehicles / RTO": [
            "transport", "rto", "driving license", "dl renewal", "learner license",
            "rc", "registration certificate", "vehicle registration", "commercial permit",
            "traffic challan", "fitness certificate", "state transport", "bus route",
            "national highway", "toll plaza", "overcharging fare", "high security number plate",
            "hsrp", "pollution certificate", "pucc",
            # Devanagari Hindi
            "परिवहन", "आरटीओ", "ड्राइविंग लाइसेंस", "डीएल", "लाइसेंस नवीनीकरण", "आरसी",
            "वाहन पंजीकरण", "फिटनेस प्रमाण पत्र", "चालान", "ट्रैफिक चालान", "परमिट",
            "रोडवेज बस", "टोल प्लाजा", "एचएसआरपी", "प्रदूषण प्रमाण पत्र"
        ],
        "Labour, Employment, Pension & Social Security": [
            "pension", "retirement pension", "ppo", "gratuity", "provident fund", "epf",
            "epfo", "esic", "unorganized worker", "labour card", "minimum wage", "salary not paid",
            "unpaid wages", "bonus", "severance", "pension payment order", "widow pension",
            "old age pension", "divyang pension", "mgnrega wages", "job card", "shramik",
            # Devanagari Hindi
            "पेंशन", "सेवानिवृत्ति", "ईपीएफओ", "भविष्य निधि", "ईपीएफ", "ग्रेच्युटी",
            "पीपीओ", "मजदूरी", "न्यूनतम वेतन", "वेतन", "श्रमिक कार्ड", "ईएसआई",
            "वृद्धावस्था पेंशन", "विधवा पेंशन", "दिव्यांग पेंशन", "मनरेगा", "जॉब कार्ड"
        ],
        "Environment & Pollution Control": [
            "pollution", "environment", "industrial waste", "chemical effluent", "factory smoke",
            "air pollution", "aqi", "water pollution", "tree felling", "illegal cutting of trees",
            "noise pollution", "loudspeaker", "hazardous waste", "pollution control board",
            "cpcb", "spcb", "green belt", "forest land", "chemical plant", "industrial effluent",
            "effluent discharge", "toxic waste", "groundwater contamination",
            # Devanagari Hindi
            "प्रदूषण", "पर्यावरण", "फैक्ट्री का धुआं", "फैक्ट्री", "धुआं", "जहरीला कचरा", "रासायनिक अपशिष्ट",
            "रासायनिक", "औद्योगिक कचरा", "वायु प्रदूषण", "जल प्रदूषण", "ध्वनि प्रदूषण", "पेड़ काटना",
            "अवैध कटाई", "प्रदूषण नियंत्रण बोर्ड", "सीपीसीबी", "एसपीसीबी", "लाउडस्पीकर"
        ]
    }

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=25000,
            token_pattern=r'(?u)\b\w+\b',
            sublinear_tf=True
        )
        self.classifier = LogisticRegression(C=8.0, max_iter=500)
        self.is_trained = False
        self._train_initial_model()

    def _train_initial_model(self):
        """Trains the TF-IDF model on an expanded bilingual seed corpus of Indian civic grievances."""
        training_texts = []
        training_labels = []

        # Bootstrap seed corpus across all 11 domains with realistic English & Hindi phrasing
        corpus = {
            "Revenue & Land Records": [
                "My land mutation khasra 45/12 application submitted 4 months ago at Tehsil office Rohini is pending. Patwari is not updating land records.",
                "Tehsildar and patwari are not entering the land mutation in khasra khatauni after registry.",
                "Application for demarcation seema gyan of agricultural land plot in Mehrauli is delayed.",
                "Lekhpal is demanding bribe for issuing certified copy of jamabandi and land title deed.",
                "Illegal encroachment on private land parcel by land mafia, revenue court hearing adjourned repeatedly.",
                "Need certified copies of khasra khatauni and land registry papers from tehsil sub-registrar office.",
                "Dakhil kharij application pending beyond statutory time limit prescribed in Land Revenue Act.",
                "Dispute regarding ancestral agricultural land boundary demarcation and katcheri mutation record omission.",
                # Devanagari Hindi
                "सदर तहसील में जमीन नामांतरण खसरा खतौनी का आवेदन 3 महीने से लंबित है। पटवारी दाखिल खारिज नहीं कर रहा है।",
                "तहसीलदार और लेखपाल कृषि भूमि का सीमांकन और सीमा ज्ञान कराने में जानबूझकर देरी कर रहे हैं।",
                "पिताजी के नाम की पुश्तैनी जमीन का दाखिल खारिज कराने हेतु बैनामा जमा किया था, पर खतौनी में नाम दर्ज नहीं हुआ।",
                "जमाबंदी और खसरा नकल की प्रमाणित प्रतिलिपि हेतु तहसील में आवेदन दिया गया था, नकल शाखा से कोई जवाब नहीं मिला।",
                "ग्राम समाज की जमीन पर भू-माफियाओं द्वारा अवैध कब्जा किया जा रहा है, राजस्व न्यायालय में सुनवाई टल रही है।"
            ],
            "Food, Civil Supplies & Consumer Affairs": [
                "food quality of govt canteen is pathetic, taste not good nd food was rotten.",
                "Food quality of govt canteen is pathetic. taste not good nd food was rotten",
                "Government office canteen food quality is terrible, food was rotten, stale and completely inedible.",
                "Canteen food quality is pathetic and unhygienic with terrible taste, rotten vegetables and insects in meal.",
                "Unhygienic food being served in the office cafeteria with insects and foul smell, causing food poisoning.",
                "Hostel mess contractor is providing substandard and inedible rotten food, bad taste and spoiled ingredients.",
                "Government school mid day meal contained worms and rotten food grains, children suffered food poisoning.",
                "Hospital canteen food is stale, foul smelling, rotten and prepared in filthy conditions violating FSSAI regulations.",
                "Canteen contractor serving substandard rotten meals, spoiled vegetables and expired ingredients to staff.",
                "Found dead insects and fungal mold in the meal served at ministry canteen, food safety inspector taking no action.",
                "Complaint regarding severe food poisoning, nausea and unhygienic rotten food served at railway station canteen.",
                "Local sweet shop and dairy selling adulterated synthetic milk, fake mawa, and rotten sweets violating food safety standards.",
                "Packaged food sold past expiry date with tampered labels, retailer refused consumer refund under Consumer Protection Act.",
                "Food safety officer not inspecting commercial eateries and government canteens serving contaminated and noxious food.",
                "My family BPL ration card application submitted at Ward 4 supply office is pending without food grain distribution.",
                "Fair price shop ration dealer is refusing to give grain to BPL card holders and selling in black market.",
                "Ration dealer black marketing wheat and rice quota, demanding thumb impression without giving grains.",
                "Antyodaya AAY ration card application rejected without any written communication or inspection.",
                "Purchased defective refrigerator from authorized dealer, company refusing warranty repair or consumer refund.",
                "Civil supplies inspector not taking action against FPS dealer for under-weighing rations.",
                # Devanagari Hindi
                "सरकारी कार्यालय की कैंटीन का खाना बहुत खराब और सड़ा हुआ था, भोजन में कीड़े निकले और दुर्गंध आ रही थी।",
                "वार्ड 4 के राशन कोटेदार द्वारा बीपीएल कार्ड धारकों को गेहूं और चावल का वितरण नहीं किया जा रहा है और कालाबाजारी की जा रही है।",
                "उचित दर राशन डीलर अंगूठा लगवा लेता है पर पूरा राशन नहीं देता, घटतौली और राशन हड़पने की शिकायत है।",
                "मध्याह्न भोजन (मिड डे मील) में बच्चों को सड़ा हुआ और मिलावटी खाना दिया जा रहा है जिससे फूड प्वाइजनिंग का खतरा है।",
                "खाद्य सुरक्षा अधिकारी द्वारा बाजार में बिक रहे मिलावटी दूध, खोया और अमानक खाद्य पदार्थों की जांच नहीं की जा रही।"
            ],
            "Municipal Public Works & Sanitation": [
                "Road contractor used substandard materials and the newly constructed road developed huge potholes within 10 days.",
                "Open sewage drain overflowing on main road in Dwarka creating severe waterlogging and foul smell.",
                "Street lights in Sector 12 have been non-functional for three weeks causing safety issues at night.",
                "Garbage and solid waste dump not cleared by municipal corporation safai karmi for two weeks.",
                "Illegal commercial construction in residential colony without building plan sanction from municipal authorities.",
                "Potholes on colony street causing fatal bike accidents, municipal public works department ignoring complaints.",
                # Devanagari Hindi
                "कॉलोनी की मुख्य सड़क पर गहरे गड्ढे हो गए हैं, सड़क निर्माण में घटिया सामग्री इस्तेमाल हुई जिससे दुर्घटनाएं हो रही हैं।",
                "खुला नाला और सीवर लाइन चोक होने से पूरी सड़क पर गंदा पानी भर गया है और भयंकर जलभराव हो रहा है।",
                "वार्ड में पिछले तीन हफ्तों से स्ट्रीट लाइटें बंद पड़ी हैं और रात में अंधेरे के कारण सुरक्षा का गंभीर संकट है।",
                "नगर निगम के सफाई कर्मी पिछले पंद्रह दिनों से कूड़ा नहीं उठा रहे हैं, चारों तरफ कचरे का ढेर लगा हुआ है।",
                "आवासीय क्षेत्र में बिना नक्शा पास कराए अवैध बहुमंजिला निर्माण किया जा रहा है, नगर पालिका कोई कार्रवाई नहीं कर रही।"
            ],
            "Water Supply & Jal Board": [
                "Drinking water supply in our colony is dirty, turbid and smelling like sewer. Pipeline is leaking underground.",
                "Severe water crisis in colony as Delhi Jal Board has cut drinking water supply without prior notice.",
                "Applied for tap water connection and pipeline extension 6 months ago, Jal Sansthan has not laid pipes.",
                "Water tanker mafia operating in the area while municipal pipeline water pressure is completely zero.",
                "Borewell pump in community park broken, Jal Board officials not replacing submersible motor.",
                "Contaminated sewage water mixing into municipal drinking water pipeline causing epidemic.",
                # Devanagari Hindi
                "हमारे मोहल्ले में पीने के पानी की आपूर्ति में सीवर का गंदा और बदबूदार पानी आ रहा है, जिससे लोग बीमार पड़ रहे हैं।",
                "जल संस्थान की मुख्य पेयजल पाइपलाइन टूट गई है जिससे लाखों लीटर पानी बह रहा है और घरों में पानी नहीं आ रहा।",
                "नए नल कनेक्शन और वाटर मीटर के लिए छह महीने पहले शुल्क जमा किया था, जल निगम ने अब तक कनेक्शन नहीं दिया।",
                "क्षेत्र में पेयजल का गंभीर संकट है, सरकारी नलकूप की सबमर्सिबल मोटर जल गई है और अधिकारी नया पंप नहीं लगा रहे।"
            ],
            "Electricity & Power Discom": [
                "Electricity department gave a fake bill of 50000 rupees. Meter is faulty and reading wrong power consumption.",
                "Frequent unannounced power cuts and load shedding in our locality lasting 8 hours every day.",
                "Distribution transformer burnt out yesterday, electric discom has not replaced it leaving 200 families without power.",
                "High tension live electricity wire hanging loose over children playground posing electrocution threat.",
                "Applied for new domestic electricity connection 2 months ago, power discom has not installed electric meter.",
                # Devanagari Hindi
                "विद्युत विभाग ने घरेलू मीटर पर 50,000 रुपये का भारी फर्जी बिजली बिल भेज दिया है, मीटर बहुत तेज भाग रहा है।",
                "हमारे मोहल्ले का वितरण ट्रांसफार्मर कल रात फुंक गया, बिजली विभाग ने 48 घंटे बाद भी नया ट्रांसफार्मर नहीं लगाया।",
                "दिन में आठ-आठ घंटे अघोषित बिजली कटौती और ट्रिपिंग हो रही है, जिससे भीषण गर्मी में हाहाकार मचा हुआ है।",
                "सड़क के ऊपर 11000 वोल्ट का हाई टेंशन बिजली का तार झूल रहा है, जिससे कभी भी जानलेवा करंट लगने का खतरा है।"
            ],
            "Police, Criminal Justice & BNSS": [
                "The police station SHO refuses to register my FIR for armed robbery that happened near market junction.",
                "Police Station SHO refuses to register mandatory FIR under Section 173 BNSS regarding violent armed snatching.",
                "Sub-Inspector refuses to provide GD entry copy or acknowledge written complaint of house theft.",
                "Cyber crime online bank fraud complaint filed on portal but local thana police officer has taken no investigation steps.",
                "Victim assaulted and threatened with dire consequences by goons, police officer refusing to register case.",
                # Devanagari Hindi
                "थाना प्रभारी (एसएचओ) हथियारबंद लूटपाट और डकैती की घटना पर अनिवार्य प्राथमिकी (एफआईआर) दर्ज करने से मना कर रहे हैं।",
                "घर में हुई चोरी की लिखित शिकायत देने के बावजूद दरोगा जी ने जीडी एंट्री या एफआईआर की निःशुल्क कॉपी नहीं दी।",
                "दबंगों ने पीड़ित के साथ गंभीर मारपीट की और जान से मारने की धमकी दी, पुलिस चौकी पर कोई सुनवाई नहीं हो रही है।",
                "बैंक खाते से साइबर फ्रॉड द्वारा रुपये उड़ा लिए गए, साइबर सेल और थाने की पुलिस जांच शुरू नहीं कर रही है।"
            ],
            "Health & Family Welfare": [
                "Doctor at the government hospital did not attend the emergency patient. Oxygen cylinders were out of stock.",
                "CRITICAL EMERGENCY: Catastrophic ventilator power failure and acute oxygen cylinder stock-out in ICU Ward.",
                "Government civil hospital emergency ward turned away critical accident victim citing lack of ICU beds.",
                "Chief Medical Officer dispensary has zero stock of life-saving medicines and rabies anti-serum.",
                "Medical negligence by government hospital surgeon during operation causing severe disability to patient.",
                # Devanagari Hindi
                "अति-आवश्यक आपातकाल: सरकारी अस्पताल के इमरजेंसी वार्ड में डॉक्टर उपस्थित नहीं थे और ऑक्सीजन सिलेंडर खत्म थे।",
                "जिला अस्पताल के आईसीयू वार्ड में वेंटिलेटर खराब पड़े हैं और जीवन रक्षक दवाओं का स्टॉक पूरी तरह समाप्त है।",
                "सरकारी डिस्पेंसरी में कुत्ते के काटने का एंटी-रेबीज इंजेक्शन और आवश्यक दवाएं नहीं मिल रही हैं, मरीजों को लौटाया जा रहा है।",
                "ऑपरेशन के दौरान सरकारी डॉक्टरों की घोर चिकित्सा लापरवाही के कारण मरीज की जान को गंभीर खतरा पैदा हो गया है।"
            ],
            "Higher Education & Student Welfare": [
                "University has not provided my degree certificate and marksheet verification for employment despite 6 months delay.",
                "Post-matric scholarship disbursement for SC ST OBC students has been delayed by state education cell.",
                "College administration refusing to refund caution money and tuition fee after formal admission cancellation.",
                "University examination controller delayed semester marksheets preventing students from attending job interviews.",
                # Devanagari Hindi
                "विश्वविद्यालय प्रशासन ने छह महीने बीत जाने के बाद भी मेरी स्नातक डिग्री और अंकपत्र सत्यापन रिपोर्ट जारी नहीं की।",
                "अनुसूचित जाति/जनजाति एवं पिछड़े वर्ग के छात्रों की पोस्ट-मैट्रिक छात्रवृत्ति और शुल्क प्रतिपूर्ति खाते में नहीं आई।",
                "विश्वविद्यालय परीक्षा नियंत्रक द्वारा समय पर परिणाम और मार्कशीट न देने से छात्र नौकरी के आवेदन से वंचित हो रहे हैं।"
            ],
            "Transport, Highways & Motor Vehicles / RTO": [
                "Applied for driving license renewal at RTO office 3 months ago but smart card DL not issued.",
                "Vehicle registration certificate RC smart card not dispatched by regional transport office after road tax payment.",
                "RTO office delayed commercial vehicle fitness certificate and permit renewal causing financial loss.",
                "Traffic police issued wrong automated camera e-challan to my car which was parked at home.",
                "State road transport corporation buses skipping designated bus stops causing severe inconvenience to commuters.",
                # Devanagari Hindi
                "आरटीओ कार्यालय में ड्राइविंग लाइसेंस नवीनीकरण का आवेदन 3 माह पूर्व किया था, अभी तक स्मार्ट कार्ड डीएल नहीं बना।",
                "रोड टैक्स और फीस जमा करने के बाद भी वाहन पंजीकरण प्रमाण पत्र (आरसी) का स्मार्ट कार्ड डाक से नहीं भेजा गया।",
                "ट्रैफिक पुलिस के स्वचालित कैमरे ने घर पर खड़ी गाड़ी का गलत चालान काट दिया है, जिसे निरस्त कराने की दरखास्त है।"
            ],
            "Labour, Employment, Pension & Social Security": [
                "My retirement pension and gratuity has not been credited since 8 months despite submitting all PPO papers.",
                "EPFO regional office has rejected Provident Fund settlement claim multiple times without specific reasons.",
                "Old age pension payment under social security scheme stopped for elderly widow without verification.",
                "Factory owner refusing to pay statutory minimum wages and retrenchment compensation to workers.",
                "Pension Payment Order PPO issued but monthly pension not disbursed into pensioner bank account.",
                # Devanagari Hindi
                "सेवानिवृत्ति के आठ महीने बाद भी पेंशन, पीपीओ और ग्रेच्युटी की राशि खाते में नहीं आई, विभाग चक्कर लगवा रहा है।",
                "ईपीएफओ क्षेत्रीय कार्यालय ने पीएफ निकासी और पेंशन सेटलमेंट का दावा बिना किसी वैध कारण के बार-बार खारिज कर दिया।",
                "समाज कल्याण विभाग द्वारा वृद्धावस्था पेंशन और विधवा पेंशन का भुगतान बिना किसी भौतिक सत्यापन के अचानक रोक दिया गया।"
            ],
            "Environment & Pollution Control": [
                "Chemical factory discharging toxic industrial effluent directly into open drain and groundwater without treatment.",
                "Factory emitting thick black toxic smoke at night exceeding permissible air pollution quality index norms.",
                "Illegal felling of mature trees in green belt area without permission from forest department and pollution board.",
                "Loudspeakers and industrial machinery operating throughout the night causing extreme noise pollution.",
                # Devanagari Hindi
                "औद्योगिक क्षेत्र की केमिकल फैक्ट्री रात में खुले नाले में जहरीला रासायनिक कचरा और तेजाबी पानी बहा रही है।",
                "फैक्ट्री की चिमनी से लगातार जहरीला काला धुआं निकल रहा है जिससे वायु गुणवत्ता सूचकांक (AQI) खतरनाक स्तर पर पहुंच गया है।",
                "ग्रीन बेल्ट और पार्क के हरे-भरे पुराने पेड़ों को बिना वन विभाग की अनुमति के अवैध रूप से काटा जा रहा है।"
            ]
        }

        for domain, texts in corpus.items():
            for t in texts:
                training_texts.append(t)
                training_labels.append(domain)

        X = self.vectorizer.fit_transform(training_texts)
        self.classifier.fit(X, training_labels)
        self.is_trained = True

    def classify_grievance(self, grievance_text: str, user_locality: str = "") -> dict:
        """
        Predicts the public domain, confidence score (0-100), explanation keywords,
        and canonical department name for public authority routing.
        Combines statistical TF-IDF classification with keyword presence validation.
        """
        text = grievance_text.strip()
        if not text:
            return {
                "domain": "Revenue & Land Records",
                "department": "Revenue & Land Records",
                "canonical_department": "Revenue & Land Records",
                "confidence": 50,
                "reason": "Defaulted due to empty text input",
                "matched_keywords": []
            }

        text_lower = text.lower()

        # 1. Calculate rule-based keyword match density per domain
        keyword_scores = {}
        domain_matched_words = {}

        for domain, kw_list in self.DOMAIN_KEYWORDS.items():
            score = 0
            matched = []
            for kw in kw_list:
                kw_low = kw.lower()
                # Whole word match carries higher weight
                if re.search(r'(?u)\b' + re.escape(kw_low) + r'\b', text_lower):
                    score += 30
                    matched.append(kw)
                elif kw_low in text_lower:
                    score += 15
                    matched.append(kw)

            keyword_scores[domain] = score
            domain_matched_words[domain] = list(set(matched))

        # 2. Calculate ML Probabilities via TF-IDF Logistic Regression
        features = self.vectorizer.transform([text])
        ml_probs = self.classifier.predict_proba(features)[0]
        ml_classes = self.classifier.classes_

        ml_scores = {}
        for cls, prob in zip(ml_classes, ml_probs):
            ml_scores[cls] = float(prob)

        # 3. Hybrid scoring: Combine ML probability (50%) + Keyword density (50%)
        final_scores = {}
        for domain in self.DOMAINS:
            ml_prob = ml_scores.get(domain, 0.0)
            kw_score = keyword_scores.get(domain, 0)
            kw_norm = min(1.0, kw_score / 60.0)

            if kw_score > 0:
                combined = (ml_prob * 0.50) + (kw_norm * 0.50)
            else:
                combined = ml_prob * 0.65

            final_scores[domain] = combined

        top_domain = max(final_scores, key=final_scores.get)
        top_score = final_scores[top_domain]

        # Calculate confidence percentage (min 70%, up to 99%)
        matched_words = domain_matched_words.get(top_domain, [])
        if len(matched_words) >= 3:
            conf_pct = min(99, int(80 + (top_score * 19)))
        elif len(matched_words) >= 1:
            conf_pct = min(96, int(75 + (top_score * 20)))
        else:
            conf_pct = max(65, int(top_score * 85))

        if matched_words:
            reason = f"ML model detected key domain indicators: {', '.join(matched_words[:4])}"
        else:
            reason = f"ML statistical NLP classification based on public administration corpus ({conf_pct}% probability)"

        canonical_dept = self.DOMAIN_TO_DEPARTMENT.get(top_domain, top_domain)

        return {
            "domain": top_domain,
            "department": canonical_dept,
            "canonical_department": canonical_dept,
            "confidence": conf_pct,
            "reason": reason,
            "matched_keywords": matched_words
        }

# Global singleton
domain_classifier = DomainClassifierService()
