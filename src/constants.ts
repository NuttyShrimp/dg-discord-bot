export const URL_SERVER = "http://play.degrensrp.be:30120";
export const FETCH_OPS = {
  cache: "no-cache",
  method: "GET",
  headers: {
    "User-Agent": `De-Grens bot, Node ${process.version} (${process.platform}${process.arch})`
  }
};

// dg server
export const logChannels = {
  roleChanges: "1029370423965667409"
};

export const roleIds = {
  staff: "747854877094576129",
  dev: "706903572058603541",
 founder: "706894236276097085",
  hoofdIntaker: "976540824663916544",
  intaker: "832985559986602036",
  intakerTrainee: "999236214244769802",
  burger: "748523650461859993",
};

// DEV
// export const logChannels = {
//   roleChanges: '931226803832516699'
// }

// export const roleIds = {
//   staff: '747854877094576129',
//   dev: '1029358673358761994',
//   founder: "706894236276097085",
//   hoofdIntaker: "976540824663916544",
//   intaker: '755025611617206273',
//   intakerTrainee: "999236214244769802",
//   burger: "755025616310501426",
// }

export const patreonRoleIds = {
  general: '711196903429374003',
  5: '762947901974380554',
  10: '762947978830151710',
  20: '762948041438396416',
  50: '762948093754343445',
};

export const BETA_TEST = {
  channel: "1041120481459306527",
  // DEV
  // channel: '1041333756860039199',
  participants: [
    '414297109391605760', // Rossevoenk#9681
    '622906113557266452', // RatedGAF#5710
    '469238687033589770', // gurt#1400
    '422462465566310410', // Zeno#8069
    '465346789990727681', // beflarez#1507
    '116607978529882112', // Fliz#1111
    '549255063672061954', // Kazlir#1458
    '191980350262476800', // AlonelyPlace-Svekke#0965
    '336637653497937932', // MrFrizz#3453
    '414794851549446144', // Pilioke#8258
    '707735238805160016', // Elevate#4931
    '459396744187215885', // Dekens#7151
    '232531994913931264', // Olivier#5400
    '243741406764466178', // RemkoTheBeast#0666
    '199554970364805120', // Eddyxxx#4909
    '97352407171731456', // Eldrax#5143
    '160732419023044608', // Lacrere#5463
    '422754033883938817', // den_ooms#2866
    '763450274815541309', // Mettes#8607
    '730865332301856789', // Sneaky.Cobra_BE#0553
    '723229375734218763', // Mitchell#2280
    '250407380427341834', // Sigurd#0001
    '258297161740058624', // 1St8ment#1283
  ],
  trelloListId: "6370b3e92102ea01b768ccf4"
};