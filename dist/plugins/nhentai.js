class Nhentai extends ComicSource {
    constructor(...e) {
        super(...e), this.name = "nhentai", this.key = "nhentai", this.version = "1.0.9",
        this.minAppVersion = "1.0.0", this.url = resolvePluginUpdateUrl("nhentai.js"), this.baseUrl = "https://nhentai.net",
        this.apiBaseUrl = "https://nhentai.net/api/v2", this.imageServer = "https://i3.nhentai.net",
        this.thumbServer = "https://t3.nhentai.net", this.account = createNhentaiAccountFeature(),
        this.explore = createNhentaiExploreFeature(this), this.category = createNhentaiCategoryConfig(),
        this.categoryComics = createNhentaiCategoryComicsFeature(this), this.search = createNhentaiSearchFeature(this),
        this.favorites = createNhentaiFavoritesFeature(this), this.comic = createNhentaiComicFeature(this),
        this.translation = NHENTAI_TRANSLATIONS;
    }
    parseComic(e) {
        return parseNhentaiComicElement(this, e);
    }
    normalizeComicId(e) {
        return normalizeNhentaiComicId(e);
    }
    _fixAndWrap(e) {
        return wrapNhentaiMediaRequest(e);
    }
    toAbsoluteMediaUrl(e, a = !1) {
        return toNhentaiAbsoluteMediaUrl(this, e, a);
    }
    parseComicFromApi(e) {
        return parseNhentaiComicFromApi(this, e);
    }
    parseComicListFromApi(e) {
        return parseNhentaiComicListFromApi(this, e);
    }
    formatTimestamp(e) {
        return formatNhentaiTimestamp(e);
    }
    tagNamespace(e) {
        return getNhentaiTagNamespace(e);
    }
    async deleteWithFallback(e, a) {
        return "function" == typeof Network.delete ? await Network.delete(e, a, null) : "function" == typeof Network.request ? await Network.request(e, "DELETE", a, null) : await Network.post(e, {
            ...a,
            "X-HTTP-Method-Override": "DELETE"
        }, null);
    }
    async parseComicList(e, a = "search") {
        return await parseNhentaiHtmlComicList(this, e, a);
    }
    static get nhentaiTags() {
        return NHENTAI_TAG_CATALOG;
    }
}

const NHENTAI_TAG_CATALOG = Object.freeze({
    2937: "big breasts",
    35762: "sole female",
    35763: "sole male",
    8010: "group",
    14283: "anal",
    19440: "lolicon",
    24201: "stockings",
    10314: "schoolgirl uniform",
    13720: "nakadashi",
    29859: "blowjob",
    8378: "glasses",
    20905: "full color",
    32341: "shotacon",
    27553: "rape",
    15658: "bondage",
    23895: "yaoi",
    27473: "mosaic censorship",
    13989: "ahegao",
    22942: "incest",
    21712: "males only",
    1207: "milf",
    19018: "dark skin",
    22945: "double penetration",
    25614: "paizuri",
    20035: "x-ray",
    779: "futanari",
    23237: "tankoubon",
    21572: "multi-work series",
    20525: "defloration",
    14971: "sex toys",
    8653: "netorare",
    3735: "swimsuit",
    19954: "yuri",
    15348: "ffm threesome",
    8368: "full censorship",
    15408: "femdom",
    29224: "impregnation",
    29013: "dilf",
    85295: "twintails",
    31044: "collar",
    85288: "ponytail",
    24380: "pantyhose",
    9260: "cheating",
    28031: "sister",
    16828: "hairy",
    31880: "bbm",
    30555: "big penis",
    15782: "crossdressing",
    31775: "tentacles",
    27384: "mind break",
    19175: "bikini",
    8739: "story arc",
    30473: "muscle",
    24102: "lactation",
    7752: "schoolboy uniform",
    20617: "mind control",
    9083: "big ass",
    29023: "tomgirl",
    81774: "kemonomimi",
    1590: "sweating",
    9162: "masturbation",
    7256: "mmf threesome",
    28550: "teacher",
    190: "maid",
    8693: "uncensored",
    19899: "exhibitionism",
    6343: "pregnant",
    8050: "females only",
    6817: "unusual pupils",
    25871: "lingerie",
    10988: "anthology",
    20282: "footjob",
    15853: "mother",
    15785: "harem",
    14072: "huge breasts",
    30035: "gender bender",
    1643: "kissing",
    130025: "anal intercourse",
    1033: "handjob",
    12824: "condom",
    31386: "catgirl",
    10476: "urination",
    3666: "garter belt",
    26130: "fingering",
    81707: "beauty mark",
    22079: "drugs",
    105833: "gloves",
    4435: "gag",
    25601: "small breasts",
    5820: "piercing",
    12695: "prostitution",
    16228: "demon girl",
    7155: "cunnilingus",
    22950: "tanlines",
    832: "elf",
    31012: "blindfold",
    17773: "kimono",
    2820: "scat",
    29182: "blackmail",
    23132: "bunny girl",
    32484: "stomach deformation",
    2515: "virginity",
    27063: "filming",
    7142: "bbw",
    21989: "inflation",
    88846: "horns",
    104227: "tail",
    26953: "bukkake",
    28800: "bloomers",
    25050: "gyaru",
    24676: "rimjob",
    23632: "big areolae",
    16533: "sleeping",
    73750: "bald",
    18567: "monster",
    35972: "sole dickgirl",
    18328: "thigh high boots",
    5810: "strap-on",
    29565: "school swimsuit",
    32996: "deepthroat",
    370: "business suit",
    7550: "monster girl",
    1067: "inseki",
    50585: "webtoon",
    12523: "bestiality",
    27697: "leotard",
    30645: "dick growth",
    29631: "inverted nipples",
    29366: "tomboy",
    24412: "bodysuit",
    15492: "scanmark",
    9406: "enema",
    35970: "dickgirl on dickgirl",
    29399: "daughter",
    18613: "military",
    11941: "replaced",
    6525: "nurse",
    9661: "cervix penetration",
    33129: "slave",
    4573: "corruption",
    5529: "urethra insertion",
    10542: "snuff",
    683: "squirting",
    51399: "crotch tattoo",
    122908: "very long hair",
    7838: "magical girl",
    24726: "apron",
    23183: "breast expansion",
    20074: "latex",
    28426: "hairy armpits",
    27217: "guro",
    31285: "fox girl",
    106119: "no penetration",
    24764: "drunk",
    9990: "prostate massage",
    35968: "dickgirl on male",
    2956: "old man",
    32752: "shibari",
    6900: "miko",
    2153: "wings",
    706: "birth",
    10794: "breast feeding",
    14069: "ryona",
    25822: "smell",
    5357: "humiliation",
    5962: "spanking",
    2531: "transformation",
    21538: "bike shorts",
    31101: "incomplete",
    32745: "chikan",
    16236: "shemale",
    36957: "bisexual",
    26952: "tall girl",
    25663: "oppai loli",
    7995: "big nipples",
    32602: "fisting",
    106733: "hair buns",
    1088: "bdsm",
    21283: "masked face",
    15225: "blowjob face",
    2633: "leg lock",
    27378: "artbook",
    35971: "male on dickgirl",
    27112: "tiara",
    107705: "facial hair",
    24933: "eyepatch",
    4549: "torture",
    30206: "tribadism",
    1037: "oni",
    89056: "hidden sex",
    13136: "facesitting",
    3391: "nun",
    25766: "gokkun",
    5200: "pegging",
    17531: "cosplaying",
    28521: "voyeurism",
    19479: "nipple fuck",
    17349: "tracksuit",
    22221: "blood",
    50505: "oyakodon",
    50486: "tail plug",
    560: "twins",
    23965: "chloroform",
    15425: "vore",
    25457: "possession",
    129668: "eye-covering bang",
    24984: "orgasm denial",
    144644: "extraneous ads",
    28589: "hotpants",
    17752: "foot licking",
    32282: "piss drinking",
    19390: "cousin",
    32589: "feminization",
    11376: "body modification",
    20362: "gyaru-oh",
    28778: "large insertions",
    27720: "smegma",
    10811: "double vaginal",
    3614: "triple penetration",
    3455: "chastity belt",
    2452: "scar",
    31319: "yandere",
    7354: "amputee",
    28335: "giantess",
    26848: "waitress",
    28349: "cbt",
    24967: "sumata",
    104893: "vtuber",
    8516: "emotionless sex",
    26380: "demon",
    17591: "robot",
    17801: "solo action",
    13640: "frottage",
    25996: "gaping",
    23035: "aunt",
    23967: "huge penis",
    31846: "body writing",
    25744: "cheerleader",
    24708: "cowgirl",
    25085: "swinging",
    18322: "brother",
    101724: "leash",
    10354: "milking",
    97795: "pixie cut",
    11089: "body swap",
    32224: "eggs",
    10606: "pasties",
    3947: "onahole",
    14573: "tall man",
    10604: "dog",
    14362: "low lolicon",
    15242: "lab coat",
    4935: "farting",
    13468: "shimapan",
    5620: "double anal",
    14138: "freckles",
    50390: "josou seme",
    15119: "dog girl",
    93324: "fishnets",
    22025: "prolapse",
    15471: "asphyxiation",
    21774: "human pet",
    31337: "kunoichi",
    15712: "eyemask",
    30126: "big clit",
    92409: "thick eyebrows",
    109360: "cumflation",
    7208: "catboy",
    31687: "randoseru",
    24529: "bride",
    19561: "big balls",
    24450: "chinese dress",
    121738: "focus anal",
    22967: "diaper",
    29347: "miniguy",
    29001: "parasite",
    25296: "armpit licking",
    6220: "orc",
    7546: "witch",
    30895: "sunglasses",
    7372: "corset",
    28119: "nose hook",
    8429: "machine",
    7684: "armpit sex",
    14516: "wolf girl",
    15045: "niece",
    13882: "tutor",
    8391: "public use",
    30811: "christmas",
    104245: "small penis",
    266: "sundress",
    17501: "phimosis",
    17800: "tickling",
    25794: "widow",
    7288: "vomit",
    1215: "unusual teeth",
    72471: "dickgirls only",
    107503: "soushuuhen",
    138044: "exposed clothing",
    1352: "slime",
    31986: "age regression",
    23917: "long tongue",
    24115: "angel",
    114993: "shimaidon",
    13722: "moral degeneration",
    26898: "age progression",
    27120: "selfcest",
    7577: "vampire",
    17676: "ghost",
    88103: "clothed female nude male",
    13515: "coach",
    141098: "nipple stimulation",
    9116: "unbirth",
    5936: "time stop",
    18420: "all the way through",
    72139: "clothed paizuri",
    27530: "ball sucking",
    16518: "coprophagia",
    28869: "stuck in wall",
    2527: "bandages",
    24621: "insect",
    11399: "metal armor",
    106006: "large tattoo",
    3843: "fundoshi",
    20120: "multiple paizuri",
    8400: "goblin",
    129321: "mesuiki",
    124610: "mouth mask",
    10693: "dougi",
    31371: "mecha girl",
    21450: "minigirl",
    10685: "double blowjob",
    118056: "petplay",
    20789: "policewoman",
    3031: "underwater",
    31173: "first person perspective",
    78262: "shaved head",
    19064: "pubic stubble",
    14280: "bunny boy",
    25949: "gothic lolita",
    23463: "wrestling",
    16947: "horse",
    11247: "skinsuit",
    11073: "living clothes",
    30786: "watermarked",
    23073: "assjob",
    52826: "dark sclera",
    107478: "drill hair",
    23225: "non-h",
    109930: "domination loss",
    20170: "poor grammar",
    138200: "gender change",
    16759: "artistcg",
    80978: "nudity only",
    15749: "oil",
    30176: "petrification",
    25848: "human cattle",
    559: "ttf threesome",
    14010: "snake girl",
    11276: "multiple penises",
    90671: "original",
    18024: "touhou project",
    1841: "kantai collection",
    35605: "fate grand order",
    20925: "the idolmaster",
    972: "granblue fantasy",
    78245: "azur lane",
    17137: "neon genesis evangelion",
    3185: "love live",
    391: "girls und panzer",
    11219: "pokemon",
    15021: "sailor moon",
    4505: "mahou shoujo lyrical nanoha",
    128408: "blue archive",
    10222: "fate stay night",
    27431: "to love-ru",
    13159: "naruto",
    123503: "genshin impact",
    3984: "sword art online",
    3603: "street fighter",
    22174: "one piece",
    16285: "puella magi madoka magica",
    91195: "princess connect",
    12232: "my hero academia",
    3163: "king of fighters",
    26172: "k-on",
    7259: "touken ranbu",
    19080: "code geass",
    37544: "love live sunshine",
    17077: "cardcaptor sakura",
    27547: "the melancholy of haruhi suzumiya",
    13508: "final fantasy vii",
    10954: "shingeki no kyojin",
    25430: "vocaloid",
    32687: "free",
    4577: "toheart2",
    22146: "dead or alive",
    20025: "gochuumon wa usagi desu ka",
    8485: "dragon ball z",
    5037: "bleach",
    3218: "bakemonogatari",
    12624: "ore no imouto ga konna ni kawaii wake ga nai",
    37109: "kono subarashii sekai ni syukufuku o",
    4369: "monster hunter",
    127065: "hololive",
    74788: "girls frontline",
    24886: "fate kaleid liner prisma illya",
    6999: "toaru kagaku no railgun",
    22032: "boku wa tomodachi ga sukunai",
    18350: "ragnarok online",
    21674: "dragon quest iii",
    14345: "ojamajo doremi",
    7832: "darkstalkers",
    24135: "ah my goddess",
    32394: "samurai spirits",
    1283: "queens blade",
    16639: "haikyuu",
    13924: "yu-gi-oh",
    79467: "kimetsu no yaiba",
    18238: "danganronpa",
    26336: "yu-gi-oh zexal",
    16984: "persona 4",
    18569: "kuroko no basuke",
    1910: "smile precure",
    30587: "sakura taisen",
    16166: "mahou sensei negima",
    12285: "ranma 12",
    8470: "infinite stratos",
    32363: "toaru majutsu no index",
    22708: "saki",
    8708: "to heart",
    108082: "arknights",
    16707: "detective conan",
    22210: "guilty gear",
    947: "gundam seed destiny",
    22677: "tenchi muyo",
    23429: "pretty cure",
    18512: "strike witches",
    31027: "lucky star",
    7408: "league of legends",
    394: "love hina",
    23201: "kanon",
    27704: "amagami",
    127052: "nijisanji",
    70802: "kemono friends",
    52098: "persona 5",
    22215: "super robot wars",
    27567: "hayate no gotoku",
    35251: "osomatsu-san",
    7633: "pripara",
    34823: "ensemble stars",
    37914: "re zero kara hajimeru isekai seikatsu",
    74918: "bang dream",
    15041: "martian successor nadesico",
    24783: "dragon ball",
    120519: "love live nijigasaki high school idol club",
    2803: "love plus",
    5085: "senki zesshou symphogear",
    28474: "zero no tsukaima",
    15197: "gundam build fighters",
    15427: "dragon quest iv",
    1163: "rozen maiden",
    23859: "yu-gi-oh arc-v",
    75023: "dragon quest xi",
    2112: "dungeon ni deai o motomeru no wa machigatteiru darou ka",
    36418: "voiceroid",
    28281: "mitsudomoe",
    11624: "the legend of zelda",
    14694: "fullmetal alchemist",
    16847: "dragon quest v",
    2497: "urusei yatsura",
    5671: "tengen toppa gurren lagann",
    22754: "amagi brilliant park",
    20606: "tsukihime",
    5165: "gundam build fighters try",
    4114: "macross frontier",
    20763: "inazuma eleven",
    14550: "sister princess",
    19083: "jojos bizarre adventure",
    21052: "fate hollow ataraxia",
    29922: "teitoku",
    51810: "gudao",
    16643: "producer",
    13848: "reimu hakurei",
    25125: "asuka langley soryu",
    17279: "sakuya izayoi",
    10496: "patchouli knowledge",
    37739: "shielder",
    3206: "shinji ikari",
    38068: "gran",
    4675: "sanae kochiya",
    21779: "rei ayanami",
    14040: "fate testarossa",
    3870: "flandre scarlet",
    23902: "remilia scarlet",
    21688: "atago",
    11373: "marisa kirisame",
    35128: "kashima",
    17154: "sakura kinomoto",
    31462: "satori komeiji",
    30080: "kaga",
    10802: "alice margatroid",
    17017: "aya shameimaru",
    17862: "yukari yakumo",
    5340: "shimakaze",
    18935: "nanoha takamachi",
    18896: "shirou emiya",
    16555: "rin tosaka",
    16130: "rito yuuki",
    15890: "reisen udongein inaba",
    7724: "takao",
    27060: "jeanne darc",
    78989: "jeanne alter",
    7718: "naruto uzumaki",
    5337: "nami",
    22975: "chun-li",
    17502: "illyasviel von einzbern",
    20111: "tifa lockhart",
    21131: "youmu konpaku",
    18026: "kazuto kirigaya",
    92923: "shikikan",
    29856: "saber",
    71442: "minamoto no raikou",
    1843: "asuna yuuki",
    51419: "gudako",
    7488: "mai shiranui",
    9835: "koishi komeiji",
    16916: "kasumi",
    30026: "maki nishikino",
    143975: "sensei",
    26906: "izuku midoriya",
    37275: "scathach",
    7696: "momiji inubashiri",
    38039: "astolfo",
    27794: "mikoto misaka",
    20062: "hamakaze",
    78285: "artoria pendragon",
    34860: "katsuki bakugou",
    3328: "homura akemi",
    37687: "djeeta",
    32200: "suzuya",
    21108: "rin shibuya",
    35964: "nico yazawa",
    27494: "levi ackerman",
    609: "eren jaeger",
    11920: "sakura haruno",
    20427: "sailor mercury",
    24714: "chino kafuu",
    31456: "mikan yuuki",
    866: "koyomi araragi",
    12149: "kyousuke kousaka",
    277: "haruka nanase",
    19926: "haruna",
    3763: "haruhi suzumiya",
    26427: "mio akiyama",
    25439: "hinata hyuga",
    17811: "ran yakumo",
    14857: "kongou",
    18548: "kotori minami",
    32364: "rider",
    15641: "madoka kaname",
    2613: "hong meiling",
    491: "makoto tachibana",
    20702: "koakuma",
    15315: "tomoyo daidouji",
    10730: "shigure",
    14265: "touma kamijou",
    80311: "bb",
    4203: "mami tomoe",
    37706: "kazuma satou",
    33070: "umi sonoda",
    27172: "yuyuko saigyouji",
    3353: "yuuka kazami",
    2078: "nagato",
    6311: "arisu tachibana",
    647: "belldandy",
    9274: "maya",
    24889: "sena kashiwazaki",
    15125: "golden darkness",
    6555: "sailor jupiter",
    25695: "mika jougasaki",
    50929: "shuten douji",
    33077: "sailor mars",
    8293: "minami nitta",
    7451: "lelouch vi britannia",
    389: "rika jougasaki",
    22469: "prinz eugen",
    16108: "azusa nakano",
    12812: "tenryuu",
    7311: "ami mizuno",
    6642: "byakuren hijiri",
    7097: "suwako moriya",
    19172: "miki hoshii",
    9657: "ayane",
    29433: "c.c.",
    25220: "sakura matou",
    14499: "tsunade",
    10665: "tenshi hinanai",
    16564: "miku hatsune",
    29190: "kallen stadtfeld",
    3312: "kirino kousaka",
    1234: "yuki nagato",
    26261: "ranma saotome",
    19002: "rin kaenbyou",
    12748: "nico robin",
    32765: "rin matsuoka",
    4241: "fumika sagisawa",
    1729: "tamaki kousaka",
    23997: "ruri gokou",
    29684: "sailor venus",
    19160: "nitori kawashiro",
    27302: "uzuki shimamura",
    23216: "android 18",
    8489: "hibiki",
    7333: "suguha kirigaya",
    1267: "kodaka hasegawa",
    2345: "morrigan aensland",
    9371: "yamato",
    26087: "inazuma",
    27532: "archer",
    26587: "miho nishizumi",
    12346: "utsuho reiuji",
    37108: "megumin",
    22407: "takane shijou",
    15914: "sasuke uchiha",
    2774: "kyouko sakura",
    80930: "abigail williams",
    81288: "gudao | ritsuka fujimaru",
    73756: "nightingale",
    6109: "eri ayase",
    27492: "akagi",
    17899: "sakura kasugano",
    32137: "cirno",
    11760: "yui kotegawa",
    75029: "eli ayase",
    11740: "sailor moon",
    49158: "narmaya",
    29693: "ikazuchi",
    126586: "aether",
    20918: "iori minase",
    24832: "misato katsuragi",
    2883: "kasen ibara",
    6932: "souji okita",
    28555: "tamamo-no-mae",
    14428: "kokoa hoto",
    26783: "taihou",
    12763: "rumia",
    401: "nakoruru",
    72475: "musashi miyamoto",
    23122: "maho nishizumi",
    29188: "eirin yagokoro",
    466: "usagi tsukino",
    29638: "kyon",
    15995: "makoto kino",
    11744: "amatsukaze",
    6175: "cammy white",
    30331: "ichika orimura",
    23473: "mikuru asahina",
    28807: "ruri hoshino",
    2572: "hatate himekaidou",
    15291: "chen",
    23386: "fujiwara no mokou",
    9237: "shoukaku",
    28763: "tewi inaba",
    23851: "gilgamesh",
    10672: "aqua",
    9702: "ro-500",
    31074: "keine kamishirasawa",
    32443: "charlotte dunois",
    2196: "sayaka miki",
    1645: "zuikaku",
    5925: "akatsuki",
    4196: "hestia",
    33171: "shiho nishizumi",
    19534: "hayate yagami",
    79507: "belfast",
    12433: "kaede takagaki",
    12872: "warrior",
    8170: "len kagamine",
    50415: "rem",
    14409: "momoka sakurai",
    2211: "mari illustrious makinami",
    99075: "kokkoro",
    1907: "rei hino",
    15651: "miyu edelfelt",
    26169: "musashi",
    8053: "lum",
    50596: "you watanabe",
    9883: "kagami hiiragi",
    24509: "darjeeling",
    11992: "lala satalin deviluke",
    32683: "hachiman hikigaya",
    31076: "kuroko shirai",
    20836: "red saber",
    12902: "isuzu sento",
    10379: "bianca whitaker",
    16181: "nozomi toujou",
    27774: "bismarck",
    28219: "yui hirasawa",
    1271: "momo velia deviluke",
    49852: "subaru natsuki",
    5918: "shinobu oshino",
    28056: "link",
    25605: "rangiku matsumoto",
    35313: "cagliostro",
    18453: "hero",
    75102: "nozomi tojo",
    20722: "mutsu",
    29170: "yuma tsukumo",
    9486: "nue houjuu",
    33049: "ritsuko akizuki",
    23626: "murakumo",
    20323: "tsumugi kotobuki",
    16566: "ritsu tainaka",
    14016: "yuu narukami",
    11609: "yoko ritona",
    107011: "chloe von einzbern",
    52132: "riko sakurauchi",
    32114: "onpu segawa",
    11924: "kagerou imaizumi"
}), NHENTAI_TAG_VALUES = Object.freeze(Object.values(NHENTAI_TAG_CATALOG));

function normalizeNhentaiTagIds(e) {
    return Array.isArray(e) ? e.map(e => String(e)) : String(e || "").split(/\s+/).map(e => e.trim()).filter(Boolean);
}

function collectNhentaiTagNames(e) {
    return normalizeNhentaiTagIds(e).map(e => NHENTAI_TAG_CATALOG[e]).filter(e => null != e);
}

const NHENTAI_TRANSLATIONS = {
    zh_CN: {
        Tags: "标签",
        Language: "语言",
        Recent: "最近",
        "Popular Today": "今日热门",
        "Popular Week": "本周热门",
        "Popular Month": "本月热门",
        "Popular All": "热门",
        sort: "排序",
        Languages: "语言",
        Artists: "画师",
        Characters: "角色",
        Groups: "团队",
        Parodies: "原作",
        Categories: "分类"
    },
    zh_TW: {
        Tags: "標籤",
        Language: "語言",
        Recent: "最近",
        "Popular Today": "今日熱門",
        "Popular Week": "本週熱門",
        "Popular Month": "本月熱門",
        "Popular All": "熱門",
        sort: "排序",
        Languages: "語言",
        Artists: "畫師",
        Characters: "角色",
        Groups: "團隊",
        Parodies: "原作",
        Categories: "分類"
    },
    en: {}
}, NHENTAI_LANGUAGE_TAGS = {
    6346: "日本語",
    12227: "English",
    29963: "中文"
}, NHENTAI_TAG_NAMESPACES = {
    language: "Languages",
    artist: "Artists",
    character: "Characters",
    group: "Groups",
    parody: "Parodies",
    category: "Categories",
    tag: "Tags"
}, NHENTAI_CATEGORY_PARAM_ALIASES = {
    tags: "tag",
    languages: "language",
    artists: "artist",
    characters: "character",
    parodies: "parody",
    groups: "group",
    categories: "category"
}, NHENTAI_LANGUAGE_CATEGORIES = [ "chinese", "english", "japanese" ], NHENTAI_CATEGORY_SORT_OPTIONS = [ "/-Recent", "/popular@today-Popular Today", "/popular@week-Popular Week", "/popular@month-Popular Month", "/popular-Popular All" ], NHENTAI_SEARCH_SORT_OPTIONS = [ "date-Recent", "popular-today-Popular Today", "popular-week-Popular Week", "popular-month-Popular Month", "popular-Popular All" ], NHENTAI_CATEGORY_SORT_QUERY_VALUES = new Set([ "popular", "popular-today", "popular-week", "popular-month" ]), NHENTAI_COMIC_ID_REGEX = "^(\\d+|nh\\d+|nhentai\\d+)$";

function getNhentaiLanguageFromTags(e) {
    const a = normalizeNhentaiTagIds(e);
    for (const [e, t] of Object.entries(NHENTAI_LANGUAGE_TAGS)) if (a.includes(e)) return t;
    return "Unknown";
}

function getNhentaiTagNamespace(e) {
    const a = String(e || "").toLowerCase();
    return NHENTAI_TAG_NAMESPACES[a] ? NHENTAI_TAG_NAMESPACES[a] : e ? e.charAt(0).toUpperCase() + e.slice(1) : "Tags";
}

function normalizeNhentaiCategoryParam(e) {
    if (!e) return e;
    const a = String(e).toLowerCase();
    return NHENTAI_CATEGORY_PARAM_ALIASES[a] || e;
}

function normalizeNhentaiComicId(e) {
    return String(e).startsWith("nhentai") ? String(e).replace("nhentai", "") : String(e).startsWith("nh") ? String(e).replace("nh", "") : String(e);
}

function normalizeNhentaiCategorySlug(e) {
    return String(e).replaceAll(" ", "-").replaceAll(".", "-");
}

function normalizeNhentaiCategorySort(e) {
    return String(e || "popular").replaceAll("@", "-").replace(/^\//, "");
}

function buildNhentaiCategoryUrl(e, a, t, i, r) {
    const n = normalizeNhentaiCategoryParam(t), o = normalizeNhentaiCategorySlug(a), s = normalizeNhentaiCategorySort(i && i[0] || "popular");
    let l = `${e.baseUrl}/${n}/${encodeURIComponent(o)}`;
    const u = [];
    return s && "-Recent" !== s && NHENTAI_CATEGORY_SORT_QUERY_VALUES.has(s) && u.push(`sort=${s}`),
    u.push(`page=${r}`), u.length > 0 && (l += `?${u.join("&")}`), l;
}

function buildNhentaiSearchUrl(e, a, t, i) {
    const r = t && t[0] || "date";
    return `${e.apiBaseUrl}/search?query=${encodeURIComponent(a)}&page=${i}&sort=${r}`;
}

function buildNhentaiGalleryUrl(e, a) {
    return `${e.baseUrl}/g/${a}/`;
}

function buildNhentaiGalleryPageUrl(e, a, t) {
    return `${e.baseUrl}/g/${a}/${t}/`;
}

function buildNhentaiApiGalleryUrl(e, a, t = "") {
    const i = `${e.apiBaseUrl}/galleries/${a}`;
    return t ? `${i}/${t}` : i;
}

function buildNhentaiApiFavoritesUrl(e, a) {
    return `${e.apiBaseUrl}/favorites?page=${a}`;
}

function buildNhentaiWebFavoritesUrl(e, a) {
    return `${e.baseUrl}/favorites?page=${a}`;
}

function buildNhentaiLegacyFavoriteUrl(e, a, t) {
    return `${e.baseUrl}/api/gallery/${a}/${t ? "favorite" : "unfavorite"}`;
}

function buildNhentaiCommentsUrl(e, a) {
    return `${e.apiBaseUrl}/galleries/${a}/comments`;
}

function parseNhentaiLinkToId(e) {
    const a = /\/g\/(\d+)\/?$/g.exec(e);
    return a ? a[1] : null;
}

function wrapNhentaiMediaRequest(e) {
    if (!e) return {
        url: ""
    };
    let a = String(e).replace(/(\.(jpg|png|webp|gif))+/g, e => e.match(/\.(jpg|png|webp|gif)/g)[0]);
    return a.includes("/cover.") && (a = a.replace(/https?:\/\/[it]\d\.nhentai\.net/, "https://t3.nhentai.net")),
    a.startsWith("//") && (a = "https:" + a), a.startsWith("http") || (a = "https://" + a.replace(/^\/+/, "")),
    {
        url: a,
        headers: {
            Referer: "https://nhentai.net/",
            "User-Agent": "Mozilla/5.0"
        }
    };
}

function toNhentaiAbsoluteMediaUrl(e, a, t = !1) {
    if (!a) return a;
    if (a.startsWith("http")) return a;
    if (a.startsWith("//")) return "https:" + a;
    let i = a;
    return i.startsWith("/") && (i = i.slice(1)), (i.includes("cover") || i.includes("thumb")) && (t = !0),
    `${t ? e.thumbServer : e.imageServer}/${i}`;
}

function getNhentaiMediaExtensionFromPath(e) {
    const a = String(e || "");
    return a.includes(".webp") ? "webp" : a.includes(".png") ? "png" : a.includes(".gif") ? "gif" : "jpg";
}

function getNhentaiMediaExtensionFromToken(e) {
    switch (e) {
      case "p":
        return "png";

      case "g":
        return "gif";

      case "w":
        return "webp";

      default:
        return "jpg";
    }
}

function buildNhentaiGalleryImageUrl(e, a, t, i) {
    return `${e.imageServer}/galleries/${a}/${t + 1}.${i}`;
}

function buildNhentaiApiImages(e, a) {
    return null != a && a.pages && null != a && a.media_id ? a.pages.map((t, i) => buildNhentaiGalleryImageUrl(e, a.media_id, i, getNhentaiMediaExtensionFromPath(t.path || ""))) : [];
}

function parseNhentaiGalleryScriptPayload(e) {
    let a = null, t = [];
    for (const r of e.querySelectorAll("script")) if (null != r && r.text) {
        if (r.text.includes("window._gallery")) try {
            const e = r.text.match(/JSON\.parse\(["']([^"']+)["']\)/);
            if (null != e && e[1]) {
                var i;
                const a = e[1].replaceAll("\\u0022", '"').replaceAll("\\u005C", "\\"), t = JSON.parse(a);
                if (t.media_id && null != (i = t.images) && i.pages) return {
                    mediaId: t.media_id,
                    pages: t.images.pages
                };
            }
        } catch (e) {}
        if (r.text.includes("media_id")) try {
            const e = r.text.match(/media_id:\s*(\d+)/), i = r.text.match(/pages:\s*\[(.*?)\]/s);
            if (e && i) {
                a = e[1];
                const r = i[1].match(/\{[^}]+\}/g);
                if (r) return t = r.map(e => {
                    const a = e.match(/t:\s*['"]([^'"]+)['"]/);
                    return {
                        t: a ? a[1] : "j"
                    };
                }), {
                    mediaId: a,
                    pages: t
                };
            }
        } catch (e) {}
    }
    return {
        mediaId: a,
        pages: t
    };
}

function extractNhentaiInlineImageUrls(e, a) {
    return a.querySelectorAll("img.lazyload").map(e => {
        var a, t;
        return (null == (a = e.attributes) ? void 0 : a["data-src"]) || (null == (t = e.attributes) ? void 0 : t.src) || "";
    }).filter(e => e && e.includes("nhentai.net")).map(a => e.toAbsoluteMediaUrl(a, !1));
}

function parseNhentaiComicElement(e, a) {
    var t, i, r, n, o;
    const s = a.querySelector("a > img"), l = (null == s || null == (t = s.attributes) ? void 0 : t["data-src"]) || (null == s || null == (i = s.attributes) ? void 0 : i.src) || "", u = (null == (r = a.querySelector("div.caption")) ? void 0 : r.text) || "", m = ((null == (n = a.querySelector("a")) || null == (n = n.attributes) ? void 0 : n.href) || "").match(/\d+/g), c = m ? m.join("") : "", h = (null == (o = a.attributes) ? void 0 : o["data-tags"]) || "";
    return new Comic({
        id: c,
        title: u,
        subtitle: "",
        cover: e.toAbsoluteMediaUrl(l, !0),
        tags: collectNhentaiTagNames(h),
        description: c,
        language: getNhentaiLanguageFromTags(h)
    });
}

function parseNhentaiComicFromApi(e, a) {
    const t = a.tag_ids || [];
    return new Comic({
        id: String(a.id),
        title: a.english_title || a.japanese_title || String(a.id),
        subtitle: "",
        cover: e.toAbsoluteMediaUrl(a.thumbnail, !0),
        tags: collectNhentaiTagNames(t),
        description: String(a.id),
        language: getNhentaiLanguageFromTags(t)
    });
}

function parseNhentaiComicListFromApi(e, a) {
    return {
        comics: (a.result || []).map(a => parseNhentaiComicFromApi(e, a)),
        maxPage: a.num_pages || 1
    };
}

function formatNhentaiTimestamp(e) {
    const a = new Date(1e3 * Number(e));
    return Number.isNaN(a.getTime()) ? "" : `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()} ${a.getHours()}:${a.getMinutes()}`;
}

async function parseNhentaiHtmlComicList(e, a, t = "search") {
    const i = new HtmlDocument(a), r = i.querySelectorAll("div.gallery");
    let n = r.length, o = null;
    if ("search" === t) {
        var s;
        const e = ((null == (s = i.querySelector("div#content > h1")) ? void 0 : s.text) || "").match(/\d+/g);
        e && (n = parseInt(e.join("")));
    } else {
        var l, u;
        const a = i.querySelector("div#content > h1 > a"), t = null == a || null == (l = a.attributes) ? void 0 : l.class, r = null == t || null == (u = t.match(/tag-(\d+)/)) ? void 0 : u[1];
        if (r) {
            const a = await Network.get(`${e.apiBaseUrl}/galleries/tagged?tag_id=${r}`, {});
            if (200 !== a.status) {
                var m;
                const e = ((null == (m = i.querySelector("div#content > h1")) ? void 0 : m.text) || "").match(/\d+/g);
                e && (n = parseInt(e.join("")));
            } else {
                const e = JSON.parse(a.body);
                null != (null == e ? void 0 : e.num_pages) && (o = e.num_pages), null != (null == e ? void 0 : e.total) && (n = e.total);
            }
        } else {
            var c;
            const e = ((null == (c = i.querySelector("div#content > h1")) ? void 0 : c.text) || "").match(/\d+/g);
            e && (n = parseInt(e.join("")));
        }
    }
    return {
        comics: r.map(a => e.parseComic(a)),
        maxPage: o || Math.ceil(n / 25)
    };
}

function parseNhentaiApiTagMap(e, a) {
    const t = new Map;
    for (const i of a || []) {
        const a = e.tagNamespace(i.type);
        t.has(a) || t.set(a, []), t.get(a).push(i.name);
    }
    return t;
}

function parseNhentaiHtmlTagMap(e) {
    const a = new Map;
    for (const i of e.querySelectorAll("div.tag-container")) {
        var t;
        const e = ((null == (t = i.nodes) || null == (t = t[0]) ? void 0 : t.text) || "").trim().replaceAll(":", "");
        if ("Uploaded" === e) continue;
        const r = i.querySelectorAll("span.name").map(e => e.text);
        r.length > 0 && a.set(e, r);
    }
    return a;
}

function parseNhentaiHtmlUploadTime(e) {
    var a;
    const t = (null == (a = e.querySelector("time")) || null == (a = a.attributes) ? void 0 : a.datetime) || "";
    if (!t) return "";
    const i = new Date(Date.parse(t));
    return Number.isNaN(i.getTime()) ? "" : `${i.getFullYear()}-${i.getMonth() + 1}-${i.getDate()} ${i.getHours()}:${i.getMinutes()}`;
}

function parseNhentaiApiDetails(e, a, t) {
    var i, r, n, o, s;
    const l = (null == t || null == (i = t.title) ? void 0 : i.pretty) || (null == t || null == (r = t.title) ? void 0 : r.english) || String(a), u = (null == t || null == (n = t.title) ? void 0 : n.english) || "", m = u && u !== l ? u : "", c = e.toAbsoluteMediaUrl((null == t || null == (o = t.cover) ? void 0 : o.path) || (null == t || null == (s = t.thumbnail) ? void 0 : s.path) || "", !0), h = new ComicDetails({
        id: String(a),
        title: l || String(a),
        subtitle: m || "",
        cover: c || "",
        tags: parseNhentaiApiTagMap(e, t.tags || []),
        uploadTime: e.formatTimestamp(null == t ? void 0 : t.upload_date),
        isFavorite: !(null == t || !t.is_favorited),
        thumbnails: [],
        related: (t.related || []).map(a => e.parseComicFromApi(a)),
        url: buildNhentaiGalleryUrl(e, a)
    });
    return h.csrfToken = "", h;
}

function parseNhentaiHtmlDetails(e, a, t) {
    var i, r, n, o, s;
    const l = t.querySelector("div#cover > a > img"), u = (null == l || null == (i = l.attributes) ? void 0 : i["data-src"]) || (null == l || null == (r = l.attributes) ? void 0 : r.src) || "", m = (null == (n = t.querySelector("h1.title")) ? void 0 : n.text) || "", c = (null == (o = t.querySelector("h2.title")) ? void 0 : o.text) || m || String(a);
    let h = m && m !== c ? m : "";
    h || (h = "");
    const g = new ComicDetails({
        id: String(a),
        title: c || String(a),
        subtitle: h,
        cover: u || "",
        tags: parseNhentaiHtmlTagMap(t),
        uploadTime: parseNhentaiHtmlUploadTime(t),
        isFavorite: e.isLogged && "Favorite" !== (null == (s = t.querySelector("button#favorite > span.text")) ? void 0 : s.text),
        thumbnails: t.querySelectorAll("a.gallerythumb > img").map(e => {
            var a, t;
            return (null == (a = e.attributes) ? void 0 : a["data-src"]) || (null == (t = e.attributes) ? void 0 : t.src) || "";
        }).filter(Boolean),
        related: t.querySelectorAll("div.gallery").map(a => e.parseComic(a)),
        url: buildNhentaiGalleryUrl(e, a)
    });
    let d = "";
    try {
        d = t.querySelectorAll("script").find(e => e.text.includes("csrf_token")).text.split('csrf_token: "')[1].split('",')[0];
    } catch (e) {}
    return g.csrfToken = d, g;
}

function parseNhentaiComments(e, a) {
    return (a || []).map(a => new Comment({
        userName: a.poster.username,
        avatar: e.toAbsoluteMediaUrl(a.poster.avatar_url, !1),
        content: a.body,
        time: "number" == typeof a.post_date ? new Date(1e3 * a.post_date).toISOString() : String(a.post_date)
    }));
}

function createNhentaiAccountFeature() {
    return {
        loginWithWebview: {
            url: "https://nhentai.net/login/?next=/",
            checkStatus: (e, a) => "https://nhentai.net/" === e
        },
        logout: () => {
            Network.deleteCookies("https://nhentai.net");
        },
        registerWebsite: "https://nhentai.net/register/"
    };
}

function createNhentaiExploreFeature(e) {
    return [ {
        title: "nhentai",
        type: "mixed",
        load: async a => {
            let t = e.baseUrl;
            a && 1 !== a && (t = `${t}?page=${a}`);
            const i = await Network.get(t, {});
            if (200 !== i.status) throw "Invalid Status Code: " + i.status;
            const r = new HtmlDocument(i.body), n = [];
            t === e.baseUrl && n.push({
                title: "Popular",
                comics: r.querySelectorAll("div.container.index-container.index-popular > div.gallery").map(a => e.parseComic(a))
            });
            let o = r.querySelectorAll("div.container.index-container > div.gallery").map(a => e.parseComic(a));
            return t === e.baseUrl && (o = o.slice(n[0].comics.length)), n.push(o), {
                data: n,
                maxPage: 2e4
            };
        }
    } ];
}

function createNhentaiCategoryConfig() {
    return {
        title: "nhentai",
        parts: [ {
            name: "Language",
            type: "fixed",
            categories: NHENTAI_LANGUAGE_CATEGORIES.slice(),
            itemType: "category",
            groupParam: "language"
        }, {
            name: "Tags",
            type: "random",
            randomNumber: 20,
            categories: NHENTAI_TAG_VALUES.slice(),
            itemType: "search"
        } ],
        enableRankingPage: !1
    };
}

function createNhentaiCategoryComicsFeature(e) {
    return {
        load: async (a, t, i, r) => {
            const n = buildNhentaiCategoryUrl(e, a, t, i, r), o = await Network.get(n, {});
            return await e.parseComicList(o.body, "category");
        },
        optionList: [ {
            options: NHENTAI_CATEGORY_SORT_OPTIONS.slice()
        } ]
    };
}

function createNhentaiSearchFeature(e) {
    return {
        load: async (a, t, i) => {
            const r = buildNhentaiSearchUrl(e, a, t, i), n = await Network.get(r, {});
            if (200 !== n.status) throw "Invalid Status Code: " + n.status;
            return e.parseComicListFromApi(JSON.parse(n.body));
        },
        optionList: [ {
            options: NHENTAI_SEARCH_SORT_OPTIONS.slice(),
            label: "sort"
        } ],
        enableTagsSuggestions: !0
    };
}

function createNhentaiFavoritesFeature(e) {
    return {
        multiFolder: !1,
        addOrDelFavorite: async (a, t, i) => {
            const r = e.normalizeComicId(a), n = `${buildNhentaiApiGalleryUrl(e, r)}/favorite`, o = {
                "X-Requested-With": "XMLHttpRequest"
            }, s = i ? await Network.post(n, o, null) : await e.deleteWithFallback(n, o);
            if (200 !== s.status) {
                const a = await e.comic.loadInfo(r), t = await Network.post(buildNhentaiLegacyFavoriteUrl(e, r, i), {
                    "X-CSRFToken": a.csrfToken,
                    Referer: buildNhentaiGalleryUrl(e, r),
                    "X-Requested-With": "XMLHttpRequest"
                }, null);
                if (200 === t.status) return !0;
                if (401 === t.status) throw "Login expired";
                throw "Invalid Status Code: " + t.status;
            }
            if (200 === s.status) return !0;
            throw "Failed";
        },
        loadComics: async (a, t) => {
            const i = await Network.get(buildNhentaiApiFavoritesUrl(e, a), {});
            if (200 === i.status) return e.parseComicListFromApi(JSON.parse(i.body));
            const r = await Network.get(buildNhentaiWebFavoritesUrl(e, a), {});
            if (200 !== r.status) {
                if (401 === i.status || 401 === r.status) throw "Login expired";
                throw "Invalid Status Code: " + r.status;
            }
            return await e.parseComicList(r.body);
        }
    };
}

function createNhentaiComicFeature(e) {
    return {
        onThumbnailLoad: a => e._fixAndWrap(a),
        onImageLoad: a => e._fixAndWrap(a),
        loadInfo: async a => {
            const t = e.normalizeComicId(a), i = await Network.get(`${buildNhentaiApiGalleryUrl(e, t)}?include=related,favorite`, {});
            if (200 === i.status) {
                const a = JSON.parse(i.body), r = parseNhentaiApiDetails(e, t, a);
                let n = (a.pages || []).map(a => e.toAbsoluteMediaUrl(a.thumbnail, !0)).filter(Boolean);
                if (0 === n.length) {
                    const a = await Network.get(`${buildNhentaiApiGalleryUrl(e, t, "pages")}`, {});
                    200 === a.status && (n = (JSON.parse(a.body).pages || []).map(a => e.toAbsoluteMediaUrl(a.thumbnail, !0)).filter(Boolean));
                }
                return r.thumbnails = n, r;
            }
            const r = await Network.get(buildNhentaiGalleryUrl(e, t), {});
            if (200 !== r.status) throw "Invalid Status Code: " + r.status;
            const n = new HtmlDocument(r.body);
            return parseNhentaiHtmlDetails(e, t, n);
        },
        loadEp: async (a, t) => {
            const i = e.normalizeComicId(a), r = await Network.get(buildNhentaiApiGalleryUrl(e, i), {});
            if (200 === r.status) {
                const a = JSON.parse(r.body), t = buildNhentaiApiImages(e, a);
                if (t.length > 0) return {
                    images: t
                };
            }
            const n = await Network.get(buildNhentaiGalleryPageUrl(e, i, 1), {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    Referer: "https://nhentai.net/"
                }
            });
            if (200 !== n.status) throw "Invalid Status Code: " + n.status;
            const o = new HtmlDocument(n.body), s = parseNhentaiGalleryScriptPayload(o);
            if (s.mediaId && s.pages.length > 0) return {
                images: s.pages.map((a, t) => buildNhentaiGalleryImageUrl(e, s.mediaId, t, getNhentaiMediaExtensionFromToken(a.t)))
            };
            const l = extractNhentaiInlineImageUrls(e, o);
            if (l.length > 0) return {
                images: l
            };
            throw "Failed to load images for this gallery";
        },
        loadComments: async (a, t, i, r) => {
            const n = e.normalizeComicId(a), o = await Network.get(buildNhentaiCommentsUrl(e, n), {});
            if (200 !== o.status) throw "Invalid Status Code: " + o.status;
            return {
                comments: parseNhentaiComments(e, JSON.parse(o.body)),
                maxPage: 1
            };
        },
        sendComment: async (e, a, t, i) => {
            throw "Not implemented";
        },
        idMatch: NHENTAI_COMIC_ID_REGEX,
        onClickTag: (e, a) => ({
            action: "category",
            keyword: a,
            param: e
        }),
        link: {
            domains: [ "nhentai.net" ],
            linkToId: e => parseNhentaiLinkToId(e)
        },
        enableTagsTranslate: !0
    };
}

function __veneraGetRuntimeGlobal() {
    return "object" == typeof globalThis && null !== globalThis ? globalThis : {};
}

function __veneraNormalizeAuthorityPart(e, a, t) {
    const i = String(null == e ? "" : e).trim() || a;
    return t ? i.replace(/^\/+|\/+$/g, "") : i;
}

function resolvePluginUpdateUrl(e) {
    const a = __veneraGetRuntimeGlobal(), t = a.__VENERA_RELEASE_AUTHORITY__ && "object" == typeof a.__VENERA_RELEASE_AUTHORITY__ ? a.__VENERA_RELEASE_AUTHORITY__ : {}, i = __veneraNormalizeAuthorityPart(t.cdnOrigin, "https://cdn.jsdelivr.net", !1).replace(/\/+$/, ""), r = __veneraNormalizeAuthorityPart(t.providerPath, "gh", !0), n = __veneraNormalizeAuthorityPart(t.repository, "mythic3011/venera-configs", !0), o = __veneraNormalizeAuthorityPart(t.releaseRef, "main", !1), s = __veneraNormalizeAuthorityPart(t.artifactPathPrefix, "dist/plugins", !0), l = String(e || "").replace(/^\/+/, "");
    if (!l) return `${i}/${r}/${n}@${o}`;
    const u = s ? `${s}/${l}` : l;
    return `${i}/${r}/${n}@${o}/${l.startsWith(`${s}/`) ? l : u}`;
}

"undefined" != typeof module && module && module.exports && (module.exports = {
    resolvePluginUpdateUrl
});

"use strict";
