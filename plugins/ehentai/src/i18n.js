function freezeLocaleTable(table) {
  return Object.freeze(table);
}

const commonKeys = freezeLocaleTable({
  "H@H Original": "H@H Original",
  "H@H 800x": "H@H 800x",
  "H@H 1280x": "H@H 1280x",
  "H@H 1920x": "H@H 1920x",
  "H@H 2560x": "H@H 2560x",
});

const enBase = freezeLocaleTable({
  domain: "Domain",
  ehevent: "Trigger Dawn Event",
  hvevent: "HV Encounter Alert",
  hentaiverse: "You have encountered a monster!",
  fight: "Fight",
  cancel: "Cancel",
  language: "Language",
  artist: "Artist",
  male: "Male",
  female: "Female",
  mixed: "Mixed",
  other: "Other",
  parody: "Parody",
  character: "Character",
  group: "Group",
  cosplayer: "Cosplayer",
  reclass: "Reclass",
  uploader: "Uploader",
  Languages: "Languages",
  Artists: "Artists",
  Characters: "Characters",
  Groups: "Groups",
  Tags: "Tags",
  Parodies: "Parodies",
  Categories: "Categories",
  Category: "Category",
  "Min Stars": "Min Stars",
  Language: "Language",
  Original: "Original",
  Resample: "Resample",
  account: "Account",
  accountSwitch: "Switch Account",
  accountSwitchButton: "Choose Account",
  noSavedAccounts: "No saved accounts",
  accountSwitched: "Account switched",
});

const zhCNBase = freezeLocaleTable({
  domain: "域名",
  ehevent: "触发黎明事件",
  hvevent: "提示HV遭遇战",
  hentaiverse: "你遇到了怪物！",
  fight: "战斗",
  cancel: "取消",
  language: "语言",
  artist: "画师",
  male: "男性",
  female: "女性",
  mixed: "混合",
  other: "其它",
  parody: "原作",
  character: "角色",
  group: "团队",
  cosplayer: "Coser",
  reclass: "重新分类",
  uploader: "上传者",
  Languages: "语言",
  Artists: "画师",
  Characters: "角色",
  Groups: "团队",
  Tags: "标签",
  Parodies: "原作",
  Categories: "分类",
  Category: "分类",
  "Min Stars": "最少星星",
  Language: "语言",
  Original: "原版",
  Resample: "重采样",
  account: "账号",
  accountSwitch: "切换账号",
  accountSwitchButton: "选择账号",
  noSavedAccounts: "没有已保存的账号",
  accountSwitched: "已切换账号",
});

const zhTWBase = freezeLocaleTable({
  domain: "域名",
  ehevent: "觸發黎明事件",
  hvevent: "提示HV遭遇戰",
  hentaiverse: "你遇到了怪物！",
  fight: "戰鬥",
  cancel: "取消",
  language: "語言",
  artist: "畫師",
  male: "男性",
  female: "女性",
  mixed: "混合",
  other: "其他",
  parody: "原作",
  character: "角色",
  group: "團隊",
  cosplayer: "Coser",
  reclass: "重新分類",
  uploader: "上傳者",
  Languages: "語言",
  Artists: "畫師",
  Characters: "角色",
  Groups: "團隊",
  Tags: "標籤",
  Parodies: "原作",
  Categories: "分類",
  Category: "分類",
  "Min Stars": "最少星星",
  Language: "語言",
  Original: "原版",
  Resample: "重採樣",
  account: "帳號",
  accountSwitch: "切換帳號",
  accountSwitchButton: "選擇帳號",
  noSavedAccounts: "沒有已儲存的帳號",
  accountSwitched: "已切換帳號",
});

const enLocale = freezeLocaleTable({
  ...enBase,
  ...commonKeys,
});

const zhCNLocale = freezeLocaleTable({
  ...zhCNBase,
  ...commonKeys,
});

const zhTWLocale = freezeLocaleTable({
  ...zhTWBase,
  ...commonKeys,
});

const i18n = Object.freeze({
  // Chinese
  zh_CN: zhCNLocale,
  zh_Hans: zhCNLocale,
  // Traditional Chinese
  zh_TW: zhTWLocale,
  zh_HK: zhTWLocale,
  // English
  en_US: enLocale,
  en: enLocale,
});
