import { useState, useEffect, useCallback } from “react”;

// ─────────────────────────────────────────────
// DEVICE ID
// ─────────────────────────────────────────────
function getDeviceId() {
const KEY = “**diary_device_id**”;
try {
const v = localStorage.getItem(KEY);
if (v) return v;
const id = (typeof crypto !== “undefined” && crypto.randomUUID)
? crypto.randomUUID()
: “dev_” + Math.random().toString(36).slice(2) + Date.now().toString(36);
localStorage.setItem(KEY, id);
return id;
} catch { return “fallback”; }
}
const DEVICE_ID = getDeviceId();
const dk = k => `${DEVICE_ID}::${k}`;

// ─────────────────────────────────────────────
// THEMES
// ─────────────────────────────────────────────
const THEMES = [
{ id:“forest”, label:“フォレスト”, bg:”#1e3028”, ac:”#6dab88”, soft:”#f0f5f1”, muted:”#7a9e88”, line:”#6dab8833” },
{ id:“rose”,   label:“ローズ”,    bg:”#321e20”, ac:”#c47a7a”, soft:”#fdf4f4”, muted:”#b08080”, line:”#c47a7a33” },
{ id:“slate”,  label:“スレート”,  bg:”#18232e”, ac:”#5e94be”, soft:”#eff4f8”, muted:”#6e8fa8”, line:”#5e94be33” },
{ id:“moon”,   label:“ムーン”,    bg:”#1e1830”, ac:”#9080c0”, soft:”#f3f1fb”, muted:”#8878b0”, line:”#9080c033” },
{ id:“amber”,  label:“アンバー”,  bg:”#2c2010”, ac:”#c09040”, soft:”#faf5ec”, muted:”#a07838”, line:”#c0904033” },
];

// ─────────────────────────────────────────────
// MOODS
// ─────────────────────────────────────────────
const MOODS_MAIN = [
{e:“😊”,l:“嬉しい”},{e:“😌”,l:“穏やか”},{e:“😤”,l:“疲れた”},{e:“😢”,l:“悲しい”},{e:“😰”,l:“不安”},
{e:“😠”,l:“イライラ”},{e:“🥰”,l:“幸せ”},{e:“😑”,l:“無感情”},{e:“🤩”,l:“ワクワク”},{e:“😴”,l:“眠い”},
];
const MOODS_OTHER = [
{e:“😶”,l:“ぼんやり”},{e:“🥺”,l:“寂しい”},{e:“😇”,l:“清々しい”},{e:“🤔”,l:“考え中”},
{e:“😮”,l:“驚いた”}, {e:“🥱”,l:“退屈”},   {e:“😅”,l:“あせり”},  {e:“🤗”,l:“感謝”},
{e:“😒”,l:“もやもや”},{e:“🥳”,l:“達成感”}, {e:“😬”,l:“緊張”},   {e:“😔”,l:“落ち込み”},
{e:“🌀”,l:“混乱”},   {e:“💪”,l:“やる気”}, {e:“🫶”,l:“愛おしい”},{e:“😪”,l:“だるい”},
{e:“🤭”,l:“照れ”},   {e:“😣”,l:“くやしい”},{e:“🫠”,l:“溶けそう”},{e:“🌟”,l:“充実”},
];
const ALL_MOODS = […MOODS_MAIN, …MOODS_OTHER];

const ACHIEV = [
{id:“d1”,  n:1,   e:“✦”,   t:“はじめの一歩”,  m:“今日、あなたは自分と向き合いました。それだけで十分、素晴らしい。”},
{id:“w1”,  n:7,   e:“✦✦”,  t:“1週間達成”,     m:“7日間、自分を大切にし続けたあなたへ。この積み重ねが、確かに変化を生んでいます。”},
{id:“mo1”, n:30,  e:“✦✦✦”, t:“1ヶ月継続”,     m:“30日間、毎日自分と対話してきたあなたは、もう以前とは違う自分です。”},
{id:“yr1”, n:365, e:“★”,   t:“1年間、伝説”,    m:“365日、あなたは自分を信じ続けました。その自己肯定感は今、確かに輝いています。”},
];
const PRAISES = [
“今日も自分と向き合えた。それだけで十分。”,
“書いてくれてありがとう。”,
“この一歩が、明日の自分を作る。”,
“自分に優しくできている。”,
“気持ちを言葉にできた。素晴らしい。”,
“今日の記録が、未来の宝物になる。”,
];

const WD_MON = [“月”,“火”,“水”,“木”,“金”,“土”,“日”];
const MN = [“1月”,“2月”,“3月”,“4月”,“5月”,“6月”,“7月”,“8月”,“9月”,“10月”,“11月”,“12月”];

// ─────────────────────────────────────────────
// コメントエンジン
//  記入内容を読んで、その人の言葉を引用しながら
//  肯定的・前向き・哲学的なコメントを返す
// ─────────────────────────────────────────────
function generateComment(data) {
const todos = [data.todo0, data.todo1, data.todo2].filter(Boolean);
const mood  = data.mood ? (ALL_MOODS.find(m => m.e === data.mood)?.l || “”) : “”;
const feeling = data.feeling || “”;
const message = data.message || “”;

// ── パーツ準備 ──────────────────────────────

// できたこと → 引用フレーズ
const todoLines = todos.length > 0
? buildTodoPart(todos)
: “何かを感じ、この日記を開いたこと”;

// 気分 → 一言添える
const moodPhrase = buildMoodPhrase(mood);

// 感じたこと → 深掘り
const feelingPhrase = feeling
? buildFeelingPhrase(feeling)
: “”;

// 自分への一言 → 肯定
const messagePhrase = message
? buildMessagePhrase(message)
: “”;

// ── 組み立て ────────────────────────────────
const parts = [];

// メイン（できたこと）
parts.push(todoLines);

// 気分コメント
if (moodPhrase) parts.push(moodPhrase);

// 感じたこと or 自分への一言
if (feelingPhrase) parts.push(feelingPhrase);
else if (messagePhrase) parts.push(messagePhrase);

return parts.join(”\n\n”);
}

function buildTodoPart(todos) {
const TEMPLATES_1 = [
n => `「${n}」——それは小さく見えても、確かな行動の証です。`,
n => `「${n}」ができた。その事実は、誰にも奪えません。`,
n => `「${n}」という一歩を踏み出したあなたは、すでに動いている。`,
];
const TEMPLATES_2 = [
(a, b) => `「${a}」も「${b}」も、あなたが今日選び取った現実です。`,
(a, b) => `「${a}」と「${b}」——ふたつの積み重ねが、自分を形作っていきます。`,
];
const TEMPLATES_3 = [
(a, b, c) => `「${a}」「${b}」「${c}」——三つのことを成し遂げたあなたの今日は、確かに輝いています。`,
(a, b, c) => `「${a}」から始まり、「${b}」を経て、「${c}」まで。あなたは今日、丁寧に生きました。`,
];

if (todos.length === 1) {
const t = TEMPLATES_1[Math.floor(Math.random() * TEMPLATES_1.length)];
return t(todos[0]);
}
if (todos.length === 2) {
const t = TEMPLATES_2[Math.floor(Math.random() * TEMPLATES_2.length)];
return t(todos[0], todos[1]);
}
const t = TEMPLATES_3[Math.floor(Math.random() * TEMPLATES_3.length)];
return t(todos[0], todos[1], todos[2]);
}

function buildMoodPhrase(mood) {
if (!mood) return “”;
const map = {
“嬉しい”:  “嬉しさを感じられる自分に、気づいていますか。その感性こそが宝です。”,
“穏やか”:  “穏やかな心は、何かを無理に変えなくても今ここにある豊かさに気づく力を持っています。”,
“疲れた”:  “疲れたということは、それだけ真剣に向き合った証。今日のあなたはよく頑張りました。”,
“悲しい”:  “悲しみを感じることができるのは、それだけ深く生きている証です。”,
“不安”:    “不安は、あなたが何かを大切にしているから生まれます。その大切なものを、誇ってください。”,
“イライラ”: “イライラの裏には、きっと大切にしたい何かがあります。その感情を否定しなくていい。”,
“幸せ”:    “幸せを感じているあなたの今この瞬間は、本物です。”,
“無感情”:  “何も感じない日があってもいい。それも正直に向き合った一日です。”,
“ワクワク”: “ワクワクはエネルギーの源。その気持ちを信じて進んでいいのです。”,
“眠い”:    “眠いのは、今日を全力で生きたから。休むことも、自分を大切にする行為です。”,
“ぼんやり”: “ぼんやりする時間も、心が休息をとっているサインです。”,
“寂しい”:  “寂しさを感じられるのは、つながりを求める豊かな心があるから。”,
“清々しい”: “清々しい気持ちは、何かをやり終えた心の証。その清らかさを大切に。”,
“考え中”:  “考え続けることは、止まらないということ。それ自体が前進です。”,
“驚いた”:  “驚ける心は、世界を新鮮に受け取る感性の証です。”,
“退屈”:    “退屈は、新しい何かを求めている心の声かもしれません。”,
“あせり”:  “焦りを感じるのは、前に進もうとしているから。その熱量を信じてください。”,
“感謝”:    “感謝できる心を持っているあなたは、すでに豊かです。”,
“もやもや”: “もやもやは、まだ言葉にならない何かを感じているサイン。焦らなくていい。”,
“達成感”:  “達成感は、あなたが自分との約束を守った証です。”,
“緊張”:    “緊張できるのは、真剣に向き合っているから。その誠実さを誇ってください。”,
“落ち込み”: “落ち込んだとき、それでも日記を開いたあなたは強い。”,
“混乱”:    “混乱は、新しいものを受け入れようとしている脳の正直な反応です。”,
“やる気”:  “やる気という火を持っているあなた。その炎を大切に育ててください。”,
“愛おしい”: “何かを愛おしいと感じられるのは、心が豊かに開いている証。”,
“だるい”:  “だるさの中でも、向き合ったあなたはえらい。それだけで十分です。”,
“照れ”:    “照れるということは、自分を正直に表現している瞬間。その素直さを大切に。”,
“くやしい”: “悔しさは、もっとよくなれるという信念の裏返し。その力を信じて。”,
“溶けそう”: “溶けそうなくらい感じている。それはあなたが今この瞬間に生きている証です。”,
“充実”:    “充実した日を過ごせたあなた。その積み重ねが人生を豊かにしていきます。”,
};
return map[mood] || `「${mood}」という気持ちと正直に向き合ったことが、今日の大切な一歩です。`;
}

function buildFeelingPhrase(feeling) {
// 短い感じたことは全文引用、長い場合は最初の20文字まで
const excerpt = feeling.length <= 20 ? `「${feeling}」` : `「${feeling.slice(0, 20)}…」`;
const templates = [
s => `${s}と感じたことを言葉にできたこと——それ自体が、自己理解の深まりです。`,
s => `${s}——そう感じたあなたの心は、今日も正直に動いていました。`,
s => `${s}という感覚を持てたこと。内側の声に耳を傾けられているあなたは、自分を大切にしています。`,
];
const t = templates[Math.floor(Math.random() * templates.length)];
return t(excerpt);
}

function buildMessagePhrase(message) {
const excerpt = message.length <= 20 ? `「${message}」` : `「${message.slice(0, 20)}…」`;
const templates = [
s => `自分への言葉として${s}と記したこと。その言葉は、あなたの内なる声が紡いだ、本物のエールです。`,
s => `${s}——今日の自分へ贈ったこの言葉を、明日も思い出してください。`,
];
const t = templates[Math.floor(Math.random() * templates.length)];
return t(excerpt);
}

// 偉人・有名人の格言リスト（日付シードで毎日異なる言葉が出る）
const DAILY_WORDS = [
{ q:“千里の道も一歩から。”, a:“老子” },
{ q:“自分自身を信じてみるだけでいい。きっと生き方が見えてくる。”, a:“ゲーテ” },
{ q:“あなたが持っているものを数えなさい。持っていないものではなく。”, a:“エピクテトス” },
{ q:“私は失敗したことがない。ただ、うまくいかない方法を一万通り見つけただけだ。”, a:“トーマス・エジソン” },
{ q:“人生において最も重要なのは、失敗しないことではなく、失敗から立ち上がることだ。”, a:“ネルソン・マンデラ” },
{ q:“自分を信じること——それが成功への第一歩だ。”, a:“ウィリアム・シェイクスピア” },
{ q:“どんな困難な状況でも、態度を選ぶ自由だけは奪われない。”, a:“ヴィクトール・フランクル” },
{ q:“なりたい自分になるのに、遅すぎることはない。”, a:“C・S・ルイス” },
{ q:“人生は自転車に乗るようなもの。バランスを保つには走り続けるしかない。”, a:“アルベルト・アインシュタイン” },
{ q:“できると思えばできる、できないと思えばできない——どちらも正しい。”, a:“ヘンリー・フォード” },
{ q:“あなたが思う以上に、あなたは強く、勇敢で、賢い。”, a:“A・A・ミルン（クマのプーさん）” },
{ q:“波に乗れないなら、波を起こせばいい。”, a:“スティーブ・ジョブズ” },
{ q:“今日という日が、残りの人生の最初の日だ。”, a:“アビー・ホフマン” },
{ q:“幸福の秘訣は、好きなことをするのではなく、することを好きになることだ。”, a:“ジェームズ・バリー” },
{ q:“成功とは、情熱を失わずに失敗を重ねていく能力のことだ。”, a:“ウィンストン・チャーチル” },
{ q:“人を動かすことのできる人は、他人の気持ちになれる人だ。”, a:“デール・カーネギー” },
{ q:“夢を見ることができるなら、それを実現することもできる。”, a:“ウォルト・ディズニー” },
{ q:“あなたの時間は限られている。だから他人の人生を生きて無駄にするな。”, a:“スティーブ・ジョブズ” },
{ q:“いつだって、なんだって、あきらめたら、そこで試合終了だ。”, a:“安西光義（スラムダンク）” },
{ q:“やってみせ、言って聞かせて、させてみせ、ほめてやらねば人は動かじ。”, a:“山本五十六” },
{ q:“人は鏡。自分が笑えば、相手も笑う。”, a:“斎藤一人” },
{ q:“どんなに遠い道のりでも、自分の足で歩き続ける限り必ず到達できる。”, a:“マハトマ・ガンジー” },
{ q:“雨の日には雨の中を、風の日には風の中を行こう。”, a:“種田山頭火” },
{ q:“人間の価値は、その人が受けるものではなく、与えるものによって測られる。”, a:“アルベルト・アインシュタイン” },
{ q:“最も暗い夜も終わる。そして太陽は昇る。”, a:“ヴィクトル・ユーゴー” },
{ q:“自分の心に従うことの勇気を持て。”, a:“スティーブ・ジョブズ” },
{ q:“人生とは、自分自身を見つけることではない。人生とは、自分自身を創ることだ。”, a:“ジョージ・バーナード・ショー” },
{ q:“苦しみの中でも、花は咲く。”, a:“宮沢賢治” },
{ q:“諦めなければ、失敗ではない。”, a:“トーマス・エジソン” },
{ q:“あなたの最大の冒険は、あなたの夢に生きることだ。”, a:“オプラ・ウィンフリー” },
{ q:“転んでもただでは起きぬ。”, a:“日本のことわざ” },
{ q:“人間は考える葦である。”, a:“ブレーズ・パスカル” },
{ q:“汝自身を知れ。”, a:“ソクラテス” },
{ q:“我思う、ゆえに我あり。”, a:“ルネ・デカルト” },
{ q:“人の一生は思い込みに勝てるかどうかで決まる。”, a:“松下幸之助” },
{ q:“志を立てることが、すべての出発点だ。”, a:“吉田松陰” },
{ q:“花が咲こうと咲くまいと、生きていることが花なんだ。”, a:“相田みつを” },
{ q:“自分が変われば、世界が変わる。”, a:“マハトマ・ガンジー” },
{ q:“今日できることを、明日に延ばすな。”, a:“ベンジャミン・フランクリン” },
{ q:“太陽が輝くかぎり、希望もまた輝く。”, a:“フリードリヒ・フォン・シラー” },
{ q:“私は私であること、それだけで誰かにとっての奇跡になれる。”, a:“マヤ・アンジェロウ” },
{ q:“あなたには、あなた自身の人生を生きる義務がある。”, a:“エレノア・ルーズベルト” },
{ q:“継続は力なり。”, a:“日本のことわざ” },
{ q:“成功するためには、成功するまであきらめないことだ。”, a:“トーマス・カーライル” },
{ q:“人生の目的は、自分らしく生きることだ。”, a:“オスカー・ワイルド” },
{ q:“明日死ぬかのように生きよ。永遠に生きるかのように学べ。”, a:“マハトマ・ガンジー” },
{ q:“水は低いところへ流れる。しかしいつか海となる。”, a:“老子” },
{ q:“自分のことを好きになれないなら、何も好きになれない。”, a:“ルシール・ボール” },
];

// 日付シードで毎日異なる（かつ同じ日は同じ）格言を返す
function getDailyWord(wi, di) {
const seed = wi * 7 + di;
return DAILY_WORDS[seed % DAILY_WORDS.length];
}

// ─────────────────────────────────────────────
// DATE HELPERS（ローカル時刻）
// ─────────────────────────────────────────────
function localDateKey(d) {
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function keyToDate(s) {
const [y,m,d]=s.split(”-”).map(Number); return new Date(y,m-1,d);
}
function getMondayOf(date) {
const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
d.setDate(d.getDate()-(d.getDay()+6)%7); return d;
}
function getOrSetStart() {
const KEY=dk(“start”);
try {
const s=localStorage.getItem(KEY); if(s) return keyToDate(s);
const mon=getMondayOf(new Date()); localStorage.setItem(KEY,localDateKey(mon)); return mon;
} catch { return getMondayOf(new Date()); }
}
function realDate(start,wi,di) {
const d=new Date(start.getFullYear(),start.getMonth(),start.getDate());
d.setDate(d.getDate()+wi*7+di); return d;
}
function dateToWiDi(start,date) {
const ms=new Date(date.getFullYear(),date.getMonth(),date.getDate())-
new Date(start.getFullYear(),start.getMonth(),start.getDate());
const total=Math.round(ms/86400000);
if(total<0) return null;
return {wi:Math.floor(total/7),di:total%7};
}
function fmtDate(d) {
const WD=[“日”,“月”,“火”,“水”,“木”,“金”,“土”];
return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${WD[d.getDay()]}）`;
}
function fmtWeekRange(start,wi) {
const first=realDate(start,wi,0),last=realDate(start,wi,6);
const f=d=>`${d.getMonth()+1}/${d.getDate()}`;
return `${first.getFullYear()}年 ${f(first)}（月）〜${f(last)}（日）`;
}

// ─────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────
function useStore(raw,init) {
const key=dk(raw);
const [v,sv]=useState(()=>{
try{const s=localStorage.getItem(key);return s?JSON.parse(s):init;}catch{return init;}
});
const set=useCallback(x=>{sv(x);try{localStorage.setItem(key,JSON.stringify(x));}catch{}},[key]);
return [v,set];
}

// ─────────────────────────────────────────────
// COACH COMMENT  — 保存後に表示、ローカル生成
// ─────────────────────────────────────────────
function CoachComment({theme, comment}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
if(!comment) return (
<div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${t.line}`}}>
<p style={{fontSize:12,color:t.muted,margin:0,textAlign:“center”,letterSpacing:.5}}>
保存するとコーチからコメントが届きます
</p>
</div>
);
return (
<div style={{marginTop:20,paddingTop:18,borderTop:`1px solid ${t.line}`,
animation:“fadeIn .4s ease”}}>
<div style={{fontSize:10,letterSpacing:3,color:t.muted,fontWeight:600,
textTransform:“uppercase”,marginBottom:14}}>Today’s Coach</div>
{comment.split(”\n\n”).map((para,i)=>(
<p key={i} style={{fontSize:13.5,lineHeight:2,color:”#2a2a2a”,margin:0,
marginBottom: i < comment.split(”\n\n”).length-1 ? 12 : 0}}>
{para}
</p>
))}
</div>
);
}

// ─────────────────────────────────────────────
// DAILY WORD — 「今日のあなたへ」独立カード
//  wi・di から一意のシードで毎日異なる言葉を表示
// ─────────────────────────────────────────────
function DailyWord({theme, wi, di}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
const word=getDailyWord(wi, di); // { q, a }
return (
<div style={{
marginTop:20,
background:`linear-gradient(135deg, ${t.bg} 0%, ${t.bg}ee 100%)`,
borderRadius:12,
padding:“22px 20px”,
position:“relative”,
overflow:“hidden”,
animation:“fadeIn .5s ease”,
}}>
{/* 装飾ライン上 */}
<div style={{
position:“absolute”,top:0,left:20,right:20,height:1,
background:`linear-gradient(90deg, transparent, ${t.ac}88, transparent)`
}}/>
{/* 装飾ライン下 */}
<div style={{
position:“absolute”,bottom:0,left:20,right:20,height:1,
background:`linear-gradient(90deg, transparent, ${t.ac}88, transparent)`
}}/>
{/* ラベル */}
<div style={{
fontSize:9,letterSpacing:4,color:t.ac,fontWeight:700,
textTransform:“uppercase”,marginBottom:14,opacity:.9,
textAlign:“center”
}}>
今日のあなたへ
</div>
{/* 開きクォーテーション */}
<div style={{
fontSize:40,lineHeight:.7,color:`${t.ac}55`,
fontFamily:“Georgia,serif”,marginBottom:10,
textAlign:“left”,paddingLeft:4,
}}>
“
</div>
{/* 格言本文 */}
<p style={{
fontSize:15,lineHeight:2,color:“rgba(255,255,255,.92)”,
margin:“0 0 14px”,letterSpacing:.5,
fontWeight:500,textAlign:“center”,
}}>
{word.q}
</p>
{/* 著者名 */}
<div style={{
display:“flex”,alignItems:“center”,justifyContent:“flex-end”,gap:8,
}}>
<div style={{flex:1,height:1,background:`${t.ac}30`}}/>
<span style={{
fontSize:12,color:t.ac,letterSpacing:1,
fontStyle:“italic”,whiteSpace:“nowrap”,
}}>
— {word.a}
</span>
</div>
</div>
);
}

// ─────────────────────────────────────────────
// MOOD PICKER — 6列グリッド（メイン10 + その他ボタン）
// ─────────────────────────────────────────────
function MoodPicker({theme,value,onChange}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
const [showOther,setShowOther]=useState(false);
const isOther=value&&!MOODS_MAIN.find(m=>m.e===value);

const chip=(m)=>{
const sel=value===m.e;
return (
<button key={m.e}
onClick={()=>{ onChange(“mood”,sel?””:m.e); }}
style={{display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,
gap:3,padding:“9px 4px”,borderRadius:10,cursor:“pointer”,transition:“all .15s”,
background:sel?t.ac:“transparent”,
border:`1px solid ${sel?t.ac:t.line}`,
color:sel?”#fff”:t.bg}}>
<span style={{fontSize:21,lineHeight:1}}>{m.e}</span>
<span style={{fontSize:9,fontWeight:600,letterSpacing:.2,whiteSpace:“nowrap”,
color:sel?“rgba(255,255,255,.9)”:t.muted}}>{m.l}</span>
</button>
);
};

const otherBtn = (
<button key=”**other**”
onClick={()=>setShowOther(v=>!v)}
style={{display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,
gap:3,padding:“9px 4px”,borderRadius:10,cursor:“pointer”,transition:“all .15s”,
background:isOther?t.ac:showOther?`${t.ac}22`:“transparent”,
border:`1px solid ${isOther||showOther?t.ac:t.line}`,
color:isOther?”#fff”:t.muted}}>
<span style={{fontSize:20,lineHeight:1,fontWeight:300}}>＋</span>
<span style={{fontSize:9,fontWeight:600,letterSpacing:.2,
color:isOther?“rgba(255,255,255,.9)”:t.muted}}>
{isOther?(ALL_MOODS.find(m=>m.e===value)?.l||“その他”):“その他”}
</span>
</button>
);

return (
<div style={{marginBottom:24}}>
<div style={{fontSize:10,letterSpacing:3,color:t.muted,fontWeight:600,
textTransform:“uppercase”,marginBottom:12}}>今日の気分</div>
{/* 6列グリッド */}
<div style={{display:“grid”,gridTemplateColumns:“repeat(6,1fr)”,gap:5}}>
{MOODS_MAIN.map(m=>chip(m))}
{otherBtn}
</div>
{/* その他ドロワー */}
{showOther&&(
<div style={{marginTop:8,background:t.soft,borderRadius:10,padding:10,
border:`1px solid ${t.line}`,animation:“fadeIn .18s ease”}}>
<div style={{fontSize:9,letterSpacing:2,color:t.muted,marginBottom:8,fontWeight:600,
textTransform:“uppercase”}}>More</div>
<div style={{display:“grid”,gridTemplateColumns:“repeat(5,1fr)”,gap:4}}>
{MOODS_OTHER.map(m=>{
const sel=value===m.e;
return (
<button key={m.e}
onClick={()=>{ onChange(“mood”,sel?””:m.e); setShowOther(false); }}
style={{display:“flex”,flexDirection:“column”,alignItems:“center”,gap:2,
padding:“7px 3px”,borderRadius:8,cursor:“pointer”,transition:“all .12s”,
background:sel?t.ac:“transparent”,
border:`1px solid ${sel?t.ac:t.line}`}}>
<span style={{fontSize:18,lineHeight:1}}>{m.e}</span>
<span style={{fontSize:8,fontWeight:600,
color:sel?“rgba(255,255,255,.9)”:t.muted,
whiteSpace:“nowrap”}}>{m.l}</span>
</button>
);
})}
</div>
</div>
)}
</div>
);
}

// ─────────────────────────────────────────────
// STYLED INPUT
// ─────────────────────────────────────────────
function SInput({t,ph,val,onChange,ta=false,rows=2}) {
const s={width:“100%”,background:“transparent”,border:“none”,
borderBottom:`1px solid ${t.line}`,padding:“8px 0”,fontSize:15,
color:”#1a1a1a”,outline:“none”,resize:“none”,fontFamily:“inherit”,
boxSizing:“border-box”,lineHeight:1.8,transition:“border-color .2s”};
const h={onChange:e=>onChange(e.target.value),
onFocus:e=>e.target.style.borderBottomColor=t.ac,
onBlur: e=>e.target.style.borderBottomColor=t.line};
return ta
?<textarea rows={rows} placeholder={ph} value={val} style={s} {…h}/>
:<input type=“text” placeholder={ph} value={val} style={s} {…h}/>;
}

// ─────────────────────────────────────────────
// DAY FORM
// ─────────────────────────────────────────────
function DayForm({theme,data,onChange,onSave,savedComment,start,wi,di}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
const rd=realDate(start,wi,di);

const sec=(label,children)=>(
<div style={{marginBottom:22}}>
<div style={{fontSize:10,letterSpacing:3,color:t.muted,fontWeight:600,
marginBottom:12,textTransform:“uppercase”}}>{label}</div>
{children}
</div>
);

return (
<div>
<div style={{fontSize:12,color:t.muted,letterSpacing:.8,marginBottom:22,
textAlign:“center”,borderBottom:`1px solid ${t.line}`,paddingBottom:14}}>
{fmtDate(rd)}
</div>

```
  <MoodPicker theme={theme} value={data.mood||""} onChange={onChange}/>

  {sec("今日できたこと",
    [0,1,2].map(i=>(
      <div key={i} style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6}}>
        <span style={{fontSize:10,color:t.muted,minWidth:14,fontWeight:700}}>{i+1}</span>
        <SInput t={t} ph={`できたこと ${i+1}`} val={data[`todo${i}`]||""}
          onChange={v=>onChange(`todo${i}`,v)}/>
      </div>
    ))
  )}
  {sec("今日感じたこと",
    <SInput t={t} ph="今日どんなことを感じましたか？" val={data.feeling||""}
      onChange={v=>onChange("feeling",v)} ta rows={2}/>
  )}
  {sec("自分への一言",
    <SInput t={t} ph="今日の自分に贈る言葉…" val={data.message||""}
      onChange={v=>onChange("message",v)} ta rows={2}/>
  )}

  <div style={{marginTop:4}}>
    <button onClick={onSave}
      style={{width:"100%",background:t.ac,color:"#fff",border:"none",
        borderRadius:7,padding:"14px",fontSize:13,fontWeight:600,
        cursor:"pointer",letterSpacing:1,transition:"opacity .2s"}}
      onMouseEnter={e=>e.currentTarget.style.opacity=".8"}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      保存する
    </button>
    <p style={{textAlign:"center",fontSize:11,color:t.muted,margin:"8px 0 0",
      letterSpacing:.3,lineHeight:1.6}}>
      保存するとAIからコメントが届きます ✦
    </p>
  </div>

  <CoachComment theme={theme} comment={savedComment}/>
  <DailyWord theme={theme} wi={wi} di={di}/>
</div>
```

);
}

// ─────────────────────────────────────────────
// WEEK SUMMARY — 日曜日（di=6）のみ表示
// ─────────────────────────────────────────────
function WeekSummary({theme,data,onChange,start,wi}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
return (
<div style={{marginTop:8}}>
<div style={{display:“flex”,alignItems:“baseline”,gap:8,marginBottom:6}}>
<div style={{fontSize:10,letterSpacing:3,color:t.muted,fontWeight:600,
textTransform:“uppercase”}}>週の振り返り</div>
<div style={{fontSize:10,color:t.muted,opacity:.7}}>— 日曜日のみ</div>
</div>
<div style={{fontSize:10,color:t.muted,marginBottom:18,letterSpacing:.5}}>
{fmtWeekRange(start,wi)}
</div>
{[[“できるようになったこと”,“growth”],[“気持ちの変化”,“mindChange”]].map(([label,key])=>(
<div key={key} style={{marginBottom:20}}>
<div style={{fontSize:10,color:t.muted,letterSpacing:2,marginBottom:8,
textTransform:“uppercase”}}>{label}</div>
<textarea rows={3} value={data[key]||””} onChange={e=>onChange(key,e.target.value)}
placeholder=“振り返って気づいたこと…”
style={{width:“100%”,background:“transparent”,border:“none”,
borderBottom:`1px solid ${t.line}`,padding:“6px 0”,
fontSize:14,color:”#1a1a1a”,outline:“none”,resize:“none”,
fontFamily:“inherit”,boxSizing:“border-box”,lineHeight:1.8}}/>
</div>
))}
</div>
);
}

// ─────────────────────────────────────────────
// CALENDAR SCREEN
// ─────────────────────────────────────────────
function CalendarScreen({theme,allData,start,onBack,onOpenDay}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
const today=new Date();
const [cy,setCy]=useState(today.getFullYear());
const [cm,setCm]=useState(today.getMonth());

const dayMap={};
Object.keys(allData).forEach(k=>{
const m=k.match(/^w(\d+)_d(\d+)$/); if(!m) return;
const wi=Number(m[1]),di=Number(m[2]);
const d=realDate(start,wi,di);
const v=allData[k];
if(v&&(v.todo0||v.todo1||v.todo2||v.feeling||v.message||v.mood))
dayMap[localDateKey(d)]={mood:v.mood||””,wi,di};
});

const firstOfMonth=new Date(cy,cm,1);
const lastOfMonth=new Date(cy,cm+1,0);
const startCell=getMondayOf(firstOfMonth);
const cells=[];
const cur=new Date(startCell.getFullYear(),startCell.getMonth(),startCell.getDate());
while(cur<=lastOfMonth||cells.length%7!==0){
cells.push(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()));
cur.setDate(cur.getDate()+1);
if(cells.length>42) break;
}

const prevM=()=>{if(cm===0){setCy(y=>y-1);setCm(11);}else setCm(m=>m-1);};
const nextM=()=>{if(cm===11){setCy(y=>y+1);setCm(0);}else setCm(m=>m+1);};
const filledInMonth=cells.filter(d=>d.getMonth()===cm&&dayMap[localDateKey(d)]).length;
const daysInMonth=lastOfMonth.getDate();
const moodCount={};
Object.values(dayMap).forEach(v=>{if(v.mood) moodCount[v.mood]=(moodCount[v.mood]||0)+1;});
const topMoods=Object.entries(moodCount).sort((a,b)=>b[1]-a[1]).slice(0,5);

return (
<div style={{minHeight:“100vh”,background:t.soft,
fontFamily:”‘Noto Serif JP’,‘Hiragino Mincho ProN’,serif”,paddingBottom:60}}>
<div style={{background:”#fff”,borderBottom:`1px solid ${t.line}`,
padding:“16px 20px”,display:“flex”,alignItems:“center”,justifyContent:“space-between”}}>
<button onClick={onBack} style={{background:“none”,border:“none”,color:t.muted,
fontSize:13,cursor:“pointer”,letterSpacing:.5}}>← 表紙</button>
<span style={{fontSize:11,letterSpacing:4,color:t.bg,fontWeight:700}}>CALENDAR</span>
<button onClick={()=>onOpenDay(null)} style={{background:“none”,border:“none”,
color:t.ac,fontSize:13,cursor:“pointer”,letterSpacing:.5}}>今日へ →</button>
</div>

```
  <div style={{maxWidth:440,margin:"0 auto",padding:"24px 20px"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <button onClick={prevM} style={{background:"none",border:`1px solid ${t.line}`,
        borderRadius:6,width:34,height:34,cursor:"pointer",color:t.muted,fontSize:18,
        display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
      <div style={{fontSize:17,fontWeight:700,color:t.bg,letterSpacing:1}}>
        {cy}年 {MN[cm]}
      </div>
      <button onClick={nextM} style={{background:"none",border:`1px solid ${t.line}`,
        borderRadius:6,width:34,height:34,cursor:"pointer",color:t.muted,fontSize:18,
        display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
    </div>

    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
      <div style={{flex:1,height:2,background:t.line,borderRadius:1,overflow:"hidden"}}>
        <div style={{height:"100%",background:t.ac,borderRadius:1,
          width:`${Math.min(filledInMonth/daysInMonth*100,100)}%`,transition:"width .5s"}}/>
      </div>
      <span style={{fontSize:11,color:t.muted,whiteSpace:"nowrap"}}>
        {filledInMonth}/{daysInMonth}日
      </span>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:6}}>
      {WD_MON.map((wd,i)=>(
        <div key={wd} style={{textAlign:"center",fontSize:10,fontWeight:700,
          color:i===6?"#c07070":i===5?"#7090c0":t.muted,padding:"2px 0",letterSpacing:.5}}>
          {wd}
        </div>
      ))}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
      {cells.map((d,idx)=>{
        const isThisMonth=d.getMonth()===cm;
        const isToday=localDateKey(d)===localDateKey(today);
        const entry=dayMap[localDateKey(d)];
        const dow=(d.getDay()+6)%7;
        const isSun=dow===6, isSat=dow===5;
        const widi=dateToWiDi(start,d);
        return (
          <div key={idx} onClick={()=>widi&&onOpenDay(d)}
            style={{borderRadius:7,padding:"5px 2px",textAlign:"center",
              background:isToday?t.ac:entry?`${t.ac}18`:"transparent",
              cursor:widi?"pointer":"default",opacity:isThisMonth?1:.22,
              transition:"all .13s",minHeight:48,
              display:"flex",flexDirection:"column",alignItems:"center",
              justifyContent:"center",gap:2}}>
            <div style={{fontSize:12,fontWeight:isToday?700:400,
              color:isToday?"#fff":isSun?"#c07070":isSat?"#7090c0":t.bg}}>
              {d.getDate()}
            </div>
            <div style={{fontSize:14,lineHeight:1}}>
              {entry?.mood||(entry?<span style={{color:t.ac,fontSize:7}}>●</span>:"")}
            </div>
          </div>
        );
      })}
    </div>

    {topMoods.length>0&&(
      <div style={{marginTop:28}}>
        <div style={{fontSize:10,letterSpacing:3,color:t.muted,fontWeight:600,
          marginBottom:12,textTransform:"uppercase"}}>よく選んだ気分</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {topMoods.map(([e,cnt])=>{
            const md=ALL_MOODS.find(m=>m.e===e);
            return (
              <div key={e} style={{display:"flex",alignItems:"center",gap:6,
                background:"#fff",borderRadius:20,padding:"5px 12px",
                border:`1px solid ${t.line}`}}>
                <span style={{fontSize:16}}>{e}</span>
                <span style={{fontSize:11,color:t.muted}}>{md?.l}</span>
                <span style={{fontSize:11,color:t.ac,fontWeight:700}}>×{cnt}</span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
</div>
```

);
}

// ─────────────────────────────────────────────
// CERTIFICATE
// ─────────────────────────────────────────────
function Certificate({theme,ach,onClose}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
return (
<div style={{position:“fixed”,inset:0,background:“rgba(0,0,0,.55)”,
display:“flex”,alignItems:“center”,justifyContent:“center”,zIndex:200,padding:24}}
onClick={onClose}>
<div onClick={e=>e.stopPropagation()}
style={{background:”#fff”,borderRadius:12,padding:“44px 32px”,maxWidth:320,
width:“100%”,textAlign:“center”,boxShadow:“0 24px 64px rgba(0,0,0,.18)”}}>
<div style={{fontSize:32,marginBottom:10,color:t.ac,letterSpacing:6}}>{ach.e}</div>
<div style={{fontSize:9,letterSpacing:4,color:t.muted,marginBottom:8,
textTransform:“uppercase”}}>Achievement</div>
<div style={{fontSize:20,fontWeight:700,color:”#1a1a1a”,marginBottom:14,lineHeight:1.4}}>
{ach.t}
</div>
<div style={{fontSize:13,color:”#666”,lineHeight:1.9,marginBottom:28}}>{ach.m}</div>
<button onClick={onClose}
style={{background:t.ac,color:”#fff”,border:“none”,borderRadius:7,
padding:“12px 32px”,fontSize:13,fontWeight:600,cursor:“pointer”,letterSpacing:1}}>
ありがとう
</button>
</div>
</div>
);
}

// ─────────────────────────────────────────────
// PRAISE TOAST
// ─────────────────────────────────────────────
function PraiseToast({theme,onClose}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
const [msg]=useState(()=>PRAISES[Math.floor(Math.random()*PRAISES.length)]);
useEffect(()=>{const id=setTimeout(onClose,3000);return()=>clearTimeout(id);},[onClose]);
return (
<div style={{position:“fixed”,bottom:28,left:“50%”,transform:“translateX(-50%)”,
background:t.bg,color:”#fff”,borderRadius:7,padding:“13px 22px”,fontSize:13,
letterSpacing:.5,boxShadow:“0 8px 32px rgba(0,0,0,.22)”,zIndex:300,
whiteSpace:“nowrap”,animation:“slideUp .25s ease”}}>
{msg}
</div>
);
}

// ─────────────────────────────────────────────
// COVER PAGE — 日記帳デザイン
// ─────────────────────────────────────────────
function CoverPage({theme,onStart,onCalendar,onThemeChange,totalDays,seenCerts}) {
const t=THEMES.find(x=>x.id===theme)||THEMES[0];
const BOOK_W=200, BOOK_H=260, SPINE_W=22;

return (
<div style={{minHeight:“100vh”,background:t.bg,
display:“flex”,flexDirection:“column”,alignItems:“center”,
justifyContent:“center”,padding:“36px 24px”,
fontFamily:”‘Noto Serif JP’,‘Hiragino Mincho ProN’,serif”}}>

```
  {/* 日記帳ビジュアル */}
  <div style={{position:"relative",width:BOOK_W+SPINE_W,height:BOOK_H,
    marginBottom:36,filter:"drop-shadow(0 20px 40px rgba(0,0,0,.5))"}}>

    {/* 背表紙 */}
    <div style={{position:"absolute",left:0,top:0,width:SPINE_W,height:BOOK_H,
      background:`linear-gradient(180deg,${t.ac}cc 0%,${t.ac}88 100%)`,
      borderRadius:"4px 0 0 4px",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{writingMode:"vertical-rl",fontSize:9,letterSpacing:3,
        color:"rgba(255,255,255,.5)",fontWeight:600,textTransform:"uppercase"}}>
        diary
      </div>
    </div>

    {/* 表紙 */}
    <div style={{position:"absolute",left:SPINE_W,top:0,width:BOOK_W,height:BOOK_H,
      background:`linear-gradient(150deg,${t.bg} 0%,${t.ac}18 100%)`,
      border:`1px solid ${t.ac}44`,borderRadius:"0 6px 6px 0",
      overflow:"hidden",
      display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:"24px 20px"}}>

      {/* ページライン */}
      {[40,60,80,100,120,140,160,180,200,220].map(y=>(
        <div key={y} style={{position:"absolute",left:16,right:16,top:y,
          height:1,background:`${t.ac}14`,pointerEvents:"none"}}/>
      ))}

      {/* 上部ドット */}
      <div style={{position:"absolute",top:18,left:0,right:0,
        display:"flex",justifyContent:"center",gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:4,height:4,borderRadius:"50%",background:`${t.ac}60`}}/>
        ))}
      </div>

      {/* タイトル */}
      <div style={{textAlign:"center",zIndex:1}}>
        <div style={{fontSize:10,letterSpacing:5,color:t.ac,marginBottom:14,
          textTransform:"uppercase",fontWeight:600}}>Self Esteem</div>
        <div style={{fontSize:20,fontWeight:700,color:"rgba(255,255,255,.92)",
          lineHeight:1.4,letterSpacing:2,marginBottom:6}}>自己肯定感</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.55)",letterSpacing:3,marginBottom:20}}>
          ダイアリー
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:20}}>
          <div style={{height:1,width:28,background:`${t.ac}50`}}/>
          <div style={{fontSize:10,color:t.muted}}>✦</div>
          <div style={{height:1,width:28,background:`${t.ac}50`}}/>
        </div>
        <div style={{fontSize:11,color:t.muted,letterSpacing:.8,lineHeight:1.8}}>
          {new Date().getFullYear()}年
        </div>
      </div>

      {totalDays>0&&(
        <div style={{position:"absolute",bottom:20,left:0,right:0,textAlign:"center"}}>
          <span style={{fontSize:10,color:t.ac,letterSpacing:2}}>{totalDays} days</span>
        </div>
      )}

      {seenCerts.length>0&&(
        <div style={{position:"absolute",top:22,right:14,
          display:"flex",flexDirection:"column",gap:3}}>
          {ACHIEV.filter(a=>seenCerts.includes(a.id)).map(a=>(
            <span key={a.id} style={{fontSize:11,color:t.ac}}>{a.e}</span>
          ))}
        </div>
      )}
    </div>

    {/* 影 */}
    <div style={{position:"absolute",bottom:-8,left:SPINE_W+4,right:-4,height:12,
      background:"rgba(0,0,0,.3)",borderRadius:"0 0 6px 0",
      filter:"blur(6px)",zIndex:-1}}/>
  </div>

  {/* テーマ選択 */}
  <div style={{marginBottom:32,textAlign:"center"}}>
    <div style={{fontSize:9,letterSpacing:4,color:t.muted,marginBottom:12,
      textTransform:"uppercase"}}>Cover Color</div>
    <div style={{display:"flex",gap:10,justifyContent:"center"}}>
      {THEMES.map(th=>(
        <button key={th.id} onClick={()=>onThemeChange(th.id)} title={th.label}
          style={{width:30,height:30,borderRadius:"50%",background:th.ac,cursor:"pointer",
            transition:"all .2s",
            border:theme===th.id?"3px solid rgba(255,255,255,.9)":"3px solid transparent",
            boxShadow:theme===th.id?`0 0 0 1px ${th.ac}`:"none"}}/>
      ))}
    </div>
    <div style={{fontSize:9,color:t.muted,marginTop:8,letterSpacing:2}}>
      {THEMES.find(x=>x.id===theme)?.label}
    </div>
  </div>

  {/* ボタン */}
  <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:256}}>
    <button onClick={onStart}
      style={{background:t.ac,color:"#fff",border:"none",borderRadius:7,
        padding:"15px",fontSize:13,fontWeight:600,cursor:"pointer",
        letterSpacing:2,transition:"opacity .18s"}}
      onMouseEnter={e=>e.currentTarget.style.opacity=".82"}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      {totalDays>0?"続きを書く":"日記を始める"}
    </button>
    <button onClick={onCalendar}
      style={{background:"transparent",color:t.muted,
        border:`1px solid ${t.ac}44`,borderRadius:7,padding:"13px",
        fontSize:13,cursor:"pointer",letterSpacing:1.5}}>
      カレンダーを見る
    </button>
  </div>

  <div style={{marginTop:28,fontSize:9,color:`${t.ac}40`,letterSpacing:.5}}>
    {DEVICE_ID.slice(0,8)}
  </div>
</div>
```

);
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
const [theme,    setTheme] =useStore(“theme”,“forest”);
const [allData,  setAll]   =useStore(“data”,{});
const [seenCerts,setSeen]  =useStore(“certs”,[]);
const [weekIdx,  setWi]    =useStore(“week”,0);

const [screen,setScreen]=useState(“cover”); // 常に表紙から
const [dayIdx,setDi]=useState(null);
const [toast,setToast]=useState(false);
const [cert,setCert]=useState(null);
const [start]=useState(getOrSetStart);

// コーチコメント：App レベルで管理 (wX_dY → string)
const [comments,setComments]=useStore(“comments”,{});

const t=THEMES.find(x=>x.id===theme)||THEMES[0];
const FONT=”‘Noto Serif JP’,‘Hiragino Mincho ProN’,‘Yu Mincho’,serif”;

const totalDays=Object.keys(allData).filter(k=>{
if(!k.match(/^w\d+_d\d+$/)) return false;
const d=allData[k]; return d&&(d.todo0||d.todo1||d.todo2||d.feeling||d.message||d.mood);
}).length;

const checkAch=useCallback(n=>{
for(const a of […ACHIEV].reverse()){
if(n>=a.n&&!seenCerts.includes(a.id)){setSeen([…seenCerts,a.id]);setCert(a);return;}
}
},[seenCerts,setSeen]);

const wk=(wi,di)=>`w${wi}_d${di}`;
const sk=wi=>`w${wi}_summary`;
const gd=(wi,di)=>allData[wk(wi,di)]||{};
const gs=wi=>allData[sk(wi)]||{};
const sd=(wi,di,v)=>setAll({…allData,[wk(wi,di)]:v});
const ss=(wi,v)=>setAll({…allData,[sk(wi)]:v});
const changeDay=(key,val)=>sd(weekIdx,dayIdx,{…gd(weekIdx,dayIdx),[key]:val});
const changeSum=(key,val)=>ss(weekIdx,{…gs(weekIdx),[key]:val});

const save=()=>{
const d=gd(weekIdx,dayIdx);
if(!(d.todo0||d.todo1||d.todo2||d.feeling||d.message||d.mood)) return;
// コメント生成 & 保存
const commentText=generateComment(d);
const snapKey=wk(weekIdx,dayIdx);
setComments({…comments,[snapKey]:commentText});
setToast(true); setTimeout(()=>setToast(false),3000);
checkAch(totalDays+1);
};

const filled7=Array.from({length:7},(_,i)=>{
const d=gd(weekIdx,i); return !!(d.todo0||d.todo1||d.todo2||d.feeling||d.message||d.mood);
});
const allFilled=filled7.every(Boolean);

const openDay=dateOrNull=>{
const target=dateOrNull||new Date();
const widi=dateToWiDi(start,target); if(!widi) return;
setWi(widi.wi); setDi(widi.di); setScreen(“main”);
};

const css=`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700&display=swap'); @keyframes slideUp{from{transform:translateX(-50%) translateY(16px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}} @keyframes fadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;} textarea,input{font-family:'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif !important;} textarea::placeholder,input::placeholder{color:#c0c0c0;font-size:13px;} button{font-family:'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho',serif !important;}`;
const root={minHeight:“100vh”,background:t.soft,fontFamily:FONT,paddingBottom:60};

if(screen===“calendar”) return(
<><style>{css}</style>
<CalendarScreen theme={theme} allData={allData} start={start}
onBack={()=>setScreen(“cover”)} onOpenDay={openDay}/>
</>
);
if(screen===“cover”) return(
<div style={{fontFamily:FONT}}><style>{css}</style>
<CoverPage theme={theme} onStart={()=>setScreen(“main”)}
onCalendar={()=>setScreen(“calendar”)} onThemeChange={setTheme}
totalDays={totalDays} seenCerts={seenCerts}/>
</div>
);

// ── MAIN ──
const currentKey = dayIdx!==null ? wk(weekIdx,dayIdx) : null;
const currentComment = currentKey ? (comments[currentKey]||null) : null;
// 日曜は di=6
const isSunday = dayIdx === 6;

return(
<div style={root}><style>{css}</style>

```
  <div style={{background:"#fff",borderBottom:`1px solid ${t.line}`,
    padding:"13px 20px",display:"flex",alignItems:"center",
    justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
    <button onClick={()=>setScreen("cover")}
      style={{background:"none",border:"none",color:t.muted,fontSize:13,
        cursor:"pointer",letterSpacing:.5,fontFamily:FONT}}>← 表紙</button>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      {totalDays>0&&(
        <span style={{fontSize:10,letterSpacing:2,color:t.muted}}>{totalDays}日</span>
      )}
      <button onClick={()=>setScreen("calendar")}
        style={{background:"none",border:`1px solid ${t.line}`,borderRadius:6,
          color:t.ac,fontSize:11,padding:"4px 12px",cursor:"pointer",
          letterSpacing:.5,fontFamily:FONT}}>
        カレンダー
      </button>
    </div>
  </div>

  <div style={{maxWidth:430,margin:"0 auto",padding:"20px 18px"}}>

    {/* 週ナビ */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
      <button onClick={()=>{setWi(Math.max(0,weekIdx-1));setDi(null);}} disabled={weekIdx===0}
        style={{background:"none",border:"none",
          color:weekIdx===0?`${t.muted}30`:t.muted,
          fontSize:22,cursor:weekIdx===0?"default":"pointer",padding:"2px 6px"}}>‹</button>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:700,color:t.bg,letterSpacing:1.5}}>第{weekIdx+1}週</div>
        <div style={{fontSize:10,color:t.muted,marginTop:3,letterSpacing:.5}}>
          {fmtWeekRange(start,weekIdx)}
        </div>
      </div>
      <button onClick={()=>{setWi(weekIdx+1);setDi(null);}}
        style={{background:"none",border:"none",color:t.muted,
          fontSize:22,cursor:"pointer",padding:"2px 6px"}}>›</button>
    </div>

    {allFilled&&(
      <div style={{background:t.ac,color:"#fff",borderRadius:7,
        padding:"9px 14px",textAlign:"center",marginBottom:12,
        fontSize:12,letterSpacing:1}}>
        ✦ 今週7日間、完成
      </div>
    )}

    <div style={{height:1.5,background:t.line,borderRadius:1,marginBottom:18,overflow:"hidden"}}>
      <div style={{height:"100%",background:t.ac,borderRadius:1,
        width:`${filled7.filter(Boolean).length/7*100}%`,transition:"width .4s"}}/>
    </div>

    {/* 日付タブ */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:22}}>
      {Array.from({length:7},(_,i)=>{
        const rd=realDate(start,weekIdx,i);
        const f=filled7[i],active=dayIdx===i;
        const mood=gd(weekIdx,i).mood;
        return(
          <div key={i} onClick={()=>setDi(active?null:i)}
            style={{borderRadius:7,padding:"7px 2px",textAlign:"center",cursor:"pointer",
              background:active?t.ac:f?`${t.ac}18`:"transparent",
              border:`1px solid ${active?t.ac:f?t.ac+"44":"#e0e0e0"}`,
              transition:"all .13s"}}>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:.5,marginBottom:2,
              color:active?"rgba(255,255,255,.75)":i===6?"#c07070":i===5?"#7090c0":t.muted}}>
              {WD_MON[i]}
            </div>
            <div style={{fontSize:13,fontWeight:active?700:500,
              color:active?"#fff":f?t.bg:"#ccc"}}>
              {rd.getDate()}
            </div>
            <div style={{fontSize:13,marginTop:1,minHeight:16,lineHeight:1}}>
              {mood||(f?<span style={{color:active?"rgba(255,255,255,.6)":t.ac,fontSize:7}}>●</span>:"")}
            </div>
          </div>
        );
      })}
    </div>

    {/* 日記フォーム */}
    {dayIdx!==null&&(
      <div style={{background:"#fff",borderRadius:10,padding:"22px 18px",
        boxShadow:"0 1px 16px rgba(0,0,0,.06)",marginBottom:20,
        animation:"fadeIn .18s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,
          paddingBottom:14,borderBottom:`1px solid ${t.line}`}}>
          <span style={{background:t.ac,color:"#fff",borderRadius:5,
            padding:"2px 10px",fontSize:10,fontWeight:700,letterSpacing:1.5}}>
            DAY {dayIdx+1}
          </span>
          <span style={{fontSize:10,color:t.muted,letterSpacing:.5}}>
            第{weekIdx+1}週 / {WD_MON[dayIdx]}曜日
          </span>
        </div>
        <DayForm theme={theme} data={gd(weekIdx,dayIdx)} onChange={changeDay}
          onSave={save} savedComment={currentComment}
          start={start} wi={weekIdx} di={dayIdx}/>
      </div>
    )}

    {/* 週まとめ — 日曜日のみ表示 */}
    {isSunday&&(
      <div style={{background:"#fff",borderRadius:10,padding:"22px 18px",
        boxShadow:"0 1px 16px rgba(0,0,0,.06)",marginBottom:20,
        animation:"fadeIn .18s ease"}}>
        <WeekSummary theme={theme} data={gs(weekIdx)} onChange={changeSum}
          start={start} wi={weekIdx}/>
      </div>
    )}

    {/* テーマ変更 */}
    <div style={{marginTop:dayIdx===null?0:4,paddingTop:20,textAlign:"center"}}>
      <div style={{fontSize:9,color:t.muted,letterSpacing:2,marginBottom:10,
        textTransform:"uppercase"}}>Cover Color</div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        {THEMES.map(th=>(
          <button key={th.id} onClick={()=>setTheme(th.id)} title={th.label}
            style={{width:24,height:24,borderRadius:"50%",background:th.ac,
              cursor:"pointer",transition:"all .18s",
              border:theme===th.id?"3px solid #333":"2px solid transparent",
              boxShadow:theme===th.id?`0 0 0 1.5px ${th.ac}`:"none"}}/>
        ))}
      </div>
    </div>

    {/* バッジ */}
    {seenCerts.length>0&&(
      <div style={{marginTop:20,textAlign:"center"}}>
        <div style={{fontSize:9,color:t.muted,letterSpacing:2,marginBottom:10,
          textTransform:"uppercase"}}>Achievements</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {ACHIEV.filter(a=>seenCerts.includes(a.id)).map(a=>(
            <button key={a.id} onClick={()=>setCert(a)}
              style={{background:"none",border:`1px solid ${t.line}`,borderRadius:20,
                padding:"5px 12px",cursor:"pointer",fontSize:11,color:t.ac,letterSpacing:.5}}>
              {a.e} {a.t}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>

  {toast&&<PraiseToast theme={theme} onClose={()=>setToast(false)}/>}
  {cert&&<Certificate theme={theme} ach={cert} onClose={()=>setCert(null)}/>}
</div>
```

);
}
