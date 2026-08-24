<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<meta name="theme-color" content="#080d1a">
<meta name="description" content="یار افغانستان - دستیار دیجیتال مردم افغانستان">
<title>یار افغانستان</title>

<style>
*{box-sizing:border-box;margin:0;padding:0}

:root{
 --bg:#080d1a;
 --card:#11192c;
 --card2:#121a2d;
 --line:#29334c;
 --muted:#8993aa;
 --blue:#5969ff;
 --green:#00bfa6;
}

body{
 font-family:Tahoma,Arial,sans-serif;
 background:var(--bg);
 color:#fff;
 min-height:100vh;
}

button,input,textarea,select{
 font-family:inherit;
}

button{
 cursor:pointer;
}

.app{
 max-width:600px;
 min-height:100vh;
 margin:auto;
 padding:16px;
 background:
 radial-gradient(circle at top right,rgba(75,95,255,.2),transparent 35%),
 radial-gradient(circle at bottom left,rgba(0,200,170,.1),transparent 35%),
 var(--bg);
}

.header{
 display:flex;
 align-items:center;
 justify-content:space-between;
 gap:10px;
 margin-bottom:16px;
}

.brand{
 display:flex;
 align-items:center;
 gap:10px;
}

.logo{
 width:48px;
 height:48px;
 border-radius:16px;
 display:flex;
 align-items:center;
 justify-content:center;
 font-size:25px;
 background:linear-gradient(135deg,#5969ff,#00c9a7);
 box-shadow:0 8px 30px rgba(80,100,255,.25);
}

.header h1{
 font-size:20px;
}

.header p{
 font-size:10px;
 color:#8d97ad;
 margin-top:4px;
}

.language-select,
.language{
 height:42px;
 padding:0 10px;
 border:1px solid var(--line);
 border-radius:13px;
 background:var(--card2);
 color:#fff;
 outline:none;
 font-size:11px;
}

.page{
 display:none;
}

.page.active{
 display:block;
}

.hero{
 padding:22px 18px;
 border:1px solid #273149;
 border-radius:24px;
 background:linear-gradient(135deg,#151e38,#10182b);
 margin-bottom:17px;
}

.hero-badge{
 display:inline-block;
 background:#202c50;
 color:#aab7ff;
 padding:7px 10px;
 border-radius:10px;
 font-size:10px;
 margin-bottom:12px;
}

.hero h2{
 font-size:22px;
 margin-bottom:8px;
}

.hero p{
 color:#9ba5b9;
 line-height:2;
 font-size:13px;
}

.section-title{
 margin:20px 0 13px;
}

.section-title h2{
 font-size:19px;
}

.section-title p{
 color:#7f899f;
 font-size:11px;
 margin-top:5px;
}

.features{
 display:grid;
 grid-template-columns:1fr 1fr;
 gap:10px;
}

.feature{
 border:1px solid #273149;
 background:var(--card);
 border-radius:20px;
 padding:16px 13px;
 color:#fff;
 text-align:right;
 min-height:115px;
 transition:.2s;
}

.feature:active{
 transform:scale(.97);
}

.feature-icon{
 font-size:27px;
 margin-bottom:9px;
}

.feature h3{
 font-size:14px;
 margin-bottom:6px;
}

.feature p{
 font-size:10px;
 color:#7f899f;
 line-height:1.8;
}

.pro-card{
 grid-column:1/3;
 background:linear-gradient(135deg,#30215a,#171c42);
 border-color:#6550b9;
}

.ad-card{
 grid-column:1/3;
 background:linear-gradient(135deg,#153b3b,#11192c);
 border-color:#2f7770;
}

.back{
 border:1px solid var(--line);
 background:var(--card2);
 color:#d2d8e5;
 border-radius:13px;
 padding:9px 13px;
 margin-bottom:15px;
}

.chat{
 height:calc(100vh - 220px);
 min-height:400px;
 overflow-y:auto;
 padding:5px 2px 15px;
}

.welcome{
 text-align:center;
 padding:60px 15px 30px;
}

.welcome .big{
 font-size:48px;
 margin-bottom:14px;
}

.welcome h2{
 font-size:21px;
 margin-bottom:8px;
}

.welcome p{
 color:var(--muted);
 font-size:13px;
 line-height:2;
}

.message{
 display:flex;
 margin:10px 0;
}

.message.user{
 justify-content:flex-start;
}

.message.ai{
 justify-content:flex-end;
}

.bubble{
 max-width:84%;
 padding:12px 15px;
 border-radius:18px;
 line-height:1.9;
 font-size:14px;
 white-space:pre-wrap;
 word-break:break-word;
}

.user .bubble{
 background:#202b49;
 border-bottom-right-radius:5px;
}

.ai .bubble{
 background:linear-gradient(135deg,#4658d9,#33429f);
 border-bottom-left-radius:5px;
}

.input-area{
 display:flex;
 gap:8px;
 padding-top:8px;
}

.input-area input{
 flex:1;
 height:52px;
 border:1px solid var(--line);
 border-radius:17px;
 outline:none;
 background:var(--card2);
 color:#fff;
 padding:0 15px;
}

.send{
 width:52px;
 border:0;
 border-radius:17px;
 color:#fff;
 background:linear-gradient(135deg,#5969ff,#7b55ff);
 font-size:20px;
}

.send:disabled{
 opacity:.5;
 cursor:not-allowed;
}

.language-row{
 display:grid;
 grid-template-columns:1fr 48px 1fr;
 gap:8px;
 align-items:center;
 margin-bottom:13px;
}

.language,
.swap{
 height:50px;
 border:1px solid var(--line);
 border-radius:15px;
 background:var(--card2);
 color:#fff;
}

.swap{
 font-size:20px;
}

.translator-box{
 background:var(--card2);
 border:1px solid var(--line);
 border-radius:20px;
 padding:14px;
}

.translator-box textarea{
 width:100%;
 min-height:160px;
 background:transparent;
 border:0;
 outline:0;
 resize:vertical;
 color:#fff;
 font-size:15px;
 line-height:2;
}

.translate{
 width:100%;
 height:52px;
 margin:12px 0;
 border:0;
 border-radius:16px;
 color:#fff;
 background:linear-gradient(135deg,#5969ff,#00bfa6);
 font-size:15px;
}

.result{
 background:#11182a;
 border:1px solid var(--line);
 border-radius:20px;
 padding:17px;
 min-height:130px;
 line-height:2;
 white-space:pre-wrap;
 word-break:break-word;
}

.result-title{
 color:#7f899f;
 font-size:11px;
 margin-bottom:7px;
}

.tool-card{
 background:var(--card);
 border:1px solid #273149;
 border-radius:21px;
 padding:18px;
 margin-bottom:12px;
}

.tool-icon{
 font-size:38px;
 margin-bottom:12px;
}

.tool-card h2{
 font-size:19px;
 margin-bottom:8px;
}

.tool-card p{
 color:#8b95aa;
 font-size:12px;
 line-height:2;
}

.tool-input{
 width:100%;
 margin-top:13px;
 min-height:130px;
 padding:13px;
 border:1px solid var(--line);
 border-radius:15px;
 background:#0d1425;
 color:#fff;
 outline:none;
 resize:vertical;
 line-height:1.8;
}

.tool-button{
 width:100%;
 height:50px;
 border:0;
 border-radius:15px;
 background:linear-gradient(135deg,#5969ff,#00bfa6);
 color:#fff;
 margin-top:10px;
 font-size:14px;
}

.tool-button:disabled,
.translate:disabled,
.pro-button:disabled{
 opacity:.5;
 cursor:not-allowed;
}

.output{
 margin-top:12px;
 padding:14px;
 background:#0d1425;
 border:1px solid var(--line);
 border-radius:15px;
 color:#dce2ef;
 line-height:2;
 white-space:pre-wrap;
 word-break:break-word;
 min-height:60px;
}

.pro-header{
 text-align:center;
 padding:20px 10px 15px;
}

.pro-header .icon{
 font-size:52px;
 margin-bottom:10px;
}

.pro-header h2{
 font-size:25px;
 margin-bottom:7px;
}

.pro-header p{
 color:#939db2;
 font-size:12px;
}

.pro-list{
 margin-top:15px;
}

.pro-item{
 display:flex;
 align-items:center;
 gap:12px;
 padding:13px;
 margin-bottom:8px;
 background:var(--card2);
 border:1px solid var(--line);
 border-radius:15px;
}

.pro-item-icon{
 font-size:23px;
}

.pro-item div{
 font-size:13px;
}

.pro-item small{
 display:block;
 color:#7f899f;
 font-size:10px;
 margin-top:4px;
}

.pro-button{
 width:100%;
 height:53px;
 border:0;
 border-radius:16px;
 background:linear-gradient(135deg,#a56cff,#5969ff);
 color:#fff;
 font-size:15px;
 margin-top:12px;
}

.ad-preview{
 padding:17px;
 border:1px solid #315e59;
 border-radius:18px;
 background:#0d2222;
 margin-top:13px;
}

.ad-preview h3{
 font-size:17px;
 margin-bottom:8px;
}

.ad-preview p{
 font-size:11px;
 color:#9eacb0;
 line-height:2;
}

.ad-button{
 width:100%;
 height:51px;
 border:0;
 border-radius:15px;
 background:linear-gradient(135deg,#00bfa6,#2775c9);
 color:#fff;
 font-size:14px;
 margin-top:12px;
}

.business{
 display:grid;
 gap:9px;
 margin-top:13px;
}

.business-item{
 padding:15px;
 background:var(--card2);
 border:1px solid var(--line);
 border-radius:16px;
}

.business-item strong{
 font-size:13px;
}

.business-item p{
 color:#818ba0;
 font-size:10px;
 margin-top:5px;
}

.file-button{
 display:block;
 text-align:center;
 padding:15px;
 margin-top:13px;
 border-radius:15px;
 background:#202b49;
 color:#fff;
 cursor:pointer;
}

input[type=file]{
 display:none;
}

.status{
 font-size:10px;
 color:#7f899f;
 text-align:center;
 margin-top:8px;
 min-height:16px;
}

.loading{
 display:inline-flex;
 align-items:center;
 gap:6px;
}

.loading::after{
 content:"";
 width:7px;
 height:7px;
 border-radius:50%;
 background:#fff;
 animation:pulse 1s infinite;
}

@keyframes pulse{
 0%,100%{opacity:.3}
 50%{opacity:1}
}

.toast{
 position:fixed;
 left:50%;
 bottom:20px;
 transform:translateX(-50%);
 background:#202b49;
 border:1px solid #3b4968;
 color:#fff;
 padding:11px 15px;
 border-radius:13px;
 font-size:12px;
 display:none;
 z-index:99;
 max-width:90%;
 text-align:center;
}

.api-status{
 margin-top:8px;
 text-align:center;
 font-size:10px;
 color:#748099;
}

@media(max-width:380px){
 .app{padding:14px}
 .features{gap:8px}
 .feature{padding:14px 10px}
 .header h1{font-size:18px}
 .language-select{width:92px}
}
</style>
</head>

<body>

<div class="app">

<header class="header">
<div class="brand">
<div class="logo">✨</div>
<div>
<h1 id="appTitle">یار افغانستان</h1>
<p id="appSubtitle">دستیار دیجیتال مردم افغانستان 🇦🇫</p>
</div>
</div>

<select id="appLanguage" class="language-select" onchange="changeAppLanguage()">
<option value="dari">🇦🇫 دری</option>
<option value="pashto">🇦🇫 پښتو</option>
<option value="english">🇬🇧 English</option>
</select>
</header>


<!-- HOME -->

<section class="page active" id="home">

<div class="hero">
<span class="hero-badge" id="heroBadge">🚀 آماده برای شما</span>
<h2 id="heroTitle">سلام! من یار هستم 🤖</h2>
<p id="heroText">
یک دستیار دیجیتال برای مردم افغانستان.
ترجمه، چت، درس، نوشتن، آگهی و امکانات بیشتر.
</p>
</div>

<div class="section-title">
<h2 id="featuresTitle">قابلیت‌های یار</h2>
<p id="featuresSubtitle">روی هر قابلیت بزن</p>
</div>

<div class="features">

<button class="feature" onclick="openPage('chatPage')">
<div class="feature-icon">🤖</div>
<h3 data-i18n="chat">چت با یار</h3>
<p data-i18n="chatDesc">گفتگو و پاسخ به سوالات</p>
</button>

<button class="feature" onclick="openPage('translatorPage')">
<div class="feature-icon">🌐</div>
<h3 data-i18n="translator">مترجم</h3>
<p data-i18n="translatorDesc">دری، پشتو و انگلیسی</p>
</button>

<button class="feature" onclick="openPage('voicePage')">
<div class="feature-icon">🎙️</div>
<h3 data-i18n="voice">صدا به متن</h3>
<p data-i18n="voiceDesc">صحبت کن و متن بگیر</p>
</button>

<button class="feature" onclick="openPage('photoPage')">
<div class="feature-icon">📷</div>
<h3 data-i18n="photo">خواندن عکس</h3>
<p data-i18n="photoDesc">آماده برای OCR</p>
</button>

<button class="feature" onclick="openPage('studyPage')">
<div class="feature-icon">📚</div>
<h3 data-i18n="study">کمک درسی</h3>
<p data-i18n="studyDesc">کمک در حل سوالات</p>
</button>

<button class="feature" onclick="openPage('writePage')">
<div class="feature-icon">✍️</div>
<h3 data-i18n="writing">نوشتن متن</h3>
<p data-i18n="writingDesc">پیام و متن حرفه‌ای</p>
</button>

<button class="feature" onclick="openPage('adPage')">
<div class="feature-icon">🛒</div>
<h3 data-i18n="makeAd">ساخت آگهی</h3>
<p data-i18n="makeAdDesc">آگهی فروش حرفه‌ای</p>
</button>

<button class="feature pro-card" onclick="openPage('proPage')">
<div class="feature-icon">⭐</div>
<h3 data-i18n="pro">یار Pro</h3>
<p data-i18n="proDesc">امکانات پیشرفته به‌زودی</p>
</button>

<button class="feature ad-card" onclick="openPage('specialAdPage')">
<div class="feature-icon">📢</div>
<h3 data-i18n="specialAd">آگهی ویژه</h3>
<p data-i18n="specialAdDesc">برای کسب‌وکارها و فروشندگان</p>
</button>

</div>

</section>


<!-- CHAT -->

<section class="page" id="chatPage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="chat" id="chat">

<div class="welcome" id="welcome">
<div class="big">🤖</div>
<h2 id="chatWelcome">سلام! من یار هستم 👋</h2>
<p id="chatWelcomeText">
سوالت را بنویس و با من گفتگو کن.
</p>
</div>

</div>

<div class="input-area">

<input
id="input"
type="text"
autocomplete="off"
placeholder="پیامت را بنویس..."
>

<button
id="sendButton"
class="send"
onclick="sendMessage()"
>
➤
</button>

</div>

<div class="api-status" id="apiStatus">
● API آماده
</div>

</section>


<!-- TRANSLATOR -->

<section class="page" id="translatorPage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="section-title">
<h2 data-i18n="translatorTitle">🌐 مترجم یار</h2>
<p data-i18n="translatorSub">دری ↔ پشتو ↔ انگلیسی</p>
</div>

<div class="language-row">

<select id="fromLanguage" class="language">
<option value="dari">🇦🇫 دری</option>
<option value="pashto">🇦🇫 پښتو</option>
<option value="english">🇬🇧 English</option>
</select>

<button class="swap" onclick="swapLanguages()">⇄</button>

<select id="toLanguage" class="language">
<option value="pashto">🇦🇫 پښتو</option>
<option value="dari">🇦🇫 دری</option>
<option value="english">🇬🇧 English</option>
</select>

</div>

<div class="translator-box">
<textarea
id="translationInput"
placeholder="متن را وارد کن..."
></textarea>
</div>

<button
class="translate"
id="translateButton"
onclick="translateText()"
data-i18n="translateButton"
>
🔄 ترجمه کن
</button>

<div class="result">

<div class="result-title" data-i18n="translationResult">
نتیجه ترجمه
</div>

<div id="translationResult">
ترجمه اینجا نمایش داده می‌شود...
</div>

</div>

<div class="status" id="translationStatus"></div>

</section>


<!-- VOICE -->

<section class="page" id="voicePage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="tool-card">

<div class="tool-icon">🎙️</div>

<h2 data-i18n="voiceTitle">
تبدیل صدا به متن
</h2>

<p data-i18n="voiceDescFull">
روی دکمه بزن و صحبت کن.
</p>

<button
class="tool-button"
onclick="startVoice()"
data-i18n="startVoice"
>
🎙️ شروع صحبت
</button>

<div class="output" id="voiceOutput">
متن صحبت اینجا نمایش داده می‌شود...
</div>

</div>

</section>


<!-- PHOTO -->

<section class="page" id="photoPage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="tool-card">

<div class="tool-icon">📷</div>

<h2 data-i18n="photoTitle">
خواندن متن از عکس
</h2>

<p data-i18n="photoDescFull">
عکس را انتخاب کن تا آماده‌سازی آن انجام شود.
</p>

<label class="file-button" data-i18n="choosePhoto">
📷 انتخاب عکس

<input
type="file"
accept="image/*"
onchange="photoSelected(event)"
>

</label>

<div class="output" id="photoOutput">
هنوز عکسی انتخاب نشده است.
</div>

</div>

</section>


<!-- STUDY -->

<section class="page" id="studyPage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="tool-card">

<div class="tool-icon">📚</div>

<h2 data-i18n="studyTitle">
کمک درسی
</h2>

<p data-i18n="studyDescFull">
سوال خود را بنویس.
</p>

<textarea
class="tool-input"
id="studyInput"
placeholder="مثلاً: 25 × 4 چند می‌شود؟"
></textarea>

<button
class="tool-button"
id="studyButton"
onclick="solveStudy()"
data-i18n="solve"
>
🧠 حل سوال
</button>

<div class="output" id="studyOutput">
پاسخ اینجا نمایش داده می‌شود.
</div>

</div>

</section>


<!-- WRITING -->

<section class="page" id="writePage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="tool-card">

<div class="tool-icon">✍️</div>

<h2 data-i18n="writingTitle">
کمک در نوشتن
</h2>

<p data-i18n="writingDescFull">
موضوع متن را بنویس.
</p>

<textarea
class="tool-input"
id="writeInput"
placeholder="مثلاً: برای استاد دانشگاه یک پیام محترمانه می‌خواهم."
></textarea>

<button
class="tool-button"
id="writeButton"
onclick="makeText()"
data-i18n="makeText"
>
✍️ ساخت متن
</button>

<div class="output" id="writeOutput">
متن آماده اینجا نمایش داده می‌شود.
</div>

</div>

</section>


<!-- AD -->

<section class="page" id="adPage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="tool-card">

<div class="tool-icon">🛒</div>

<h2 data-i18n="adTitle">
ساخت آگهی فروش
</h2>

<p data-i18n="adDesc">
اطلاعات محصول را وارد کن.
</p>

<textarea
class="tool-input"
id="adInput"
placeholder="مثلاً: Samsung Galaxy A23، قیمت 8000 افغانی..."
></textarea>

<button
class="tool-button"
id="adButton"
onclick="makeAd()"
data-i18n="makeAdButton"
>
🛒 ساخت آگهی
</button>

<div class="output" id="adOutput">
آگهی آماده اینجا نمایش داده می‌شود.
</div>

</div>

</section>


<!-- PRO -->

<section class="page" id="proPage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="tool-card">

<div class="pro-header">

<div class="icon">⭐</div>

<h2 data-i18n="proTitle">
یار Pro
</h2>

<p data-i18n="proSubtitle">
قابلیت‌های ویژه به‌زودی 🚀
</p>

</div>

<div class="pro-list">

<div class="pro-item">
<div class="pro-item-icon">🚫</div>
<div data-i18n="proNoAds">
بدون تبلیغات
<small>به‌زودی</small>
</div>
</div>

<div class="pro-item">
<div class="pro-item-icon">🧠</div>
<div data-i18n="proAI">
هوش مصنوعی پیشرفته‌تر
<small>برای سوالات پیچیده</small>
</div>
</div>

<div class="pro-item">
<div class="pro-item-icon">🌐</div>
<div data-i18n="proTranslate">
ترجمه بیشتر
<small>متن‌های طولانی‌تر</small>
</div>
</div>

<div class="pro-item">
<div class="pro-item-icon">📷</div>
<div data-i18n="proOCR">
OCR پیشرفته
<small>خواندن متن از عکس</small>
</div>
</div>

</div>

<button
class="pro-button"
onclick="tryPro()"
data-i18n="tryPro"
>
🔔 به‌زودی فعال می‌شود
</button>

</div>

</section>


<!-- SPECIAL ADS -->

<section class="page" id="specialAdPage">

<button class="back" onclick="openPage('home')" data-i18n="back">
← برگشت
</button>

<div class="tool-card">

<div class="tool-icon">📢</div>

<h2 data-i18n="specialAdTitle">
آگهی ویژه
</h2>

<p data-i18n="specialAdText">
برای فروشگاه‌ها، خدمات و کسب‌وکارهای افغانستان.
</p>

<div class="ad-preview">

<h3>
🏪
<span data-i18n="sampleBusiness">
فروشگاه نمونه
</span>
</h3>

<p data-i18n="sampleBusinessText">
این قسمت محل نمایش آگهی‌های ویژه کسب‌وکارها خواهد بود.
</p>

</div>

<button
class="ad-button"
onclick="showAdInfo()"
data-i18n="registerAd"
>
📢 ثبت آگهی ویژه
</button>

<div class="output" id="adInfo">
برای ثبت آگهی اطلاعات خود را آماده کنید.
</div>

<div class="section-title">

<h2 data-i18n="businesses">
کسب‌وکارها
</h2>

<p data-i18n="businessesSub">
دسته‌بندی‌های نمونه
</p>

</div>

<div class="business">

<div class="business-item">
<strong>📱 <span data-i18n="mobileBusiness">موبایل و لوازم</span></strong>
<p data-i18n="mobileBusinessDesc">
فروش موبایل، تعمیرات و لوازم جانبی
</p>
</div>

<div class="business-item">
<strong>🍽️ <span data-i18n="foodBusiness">رستوران و غذا</span></strong>
<p data-i18n="foodBusinessDesc">
رستوران‌ها و خدمات غذایی
</p>
</div>

<div class="business-item">
<strong>🚗 <span data-i18n="transportBusiness">حمل‌ونقل</span></strong>
<p data-i18n="transportBusinessDesc">
تاکسی و خدمات حمل‌ونقل
</p>
</div>

<div class="business-item">
<strong>🏠 <span data-i18n="homeBusiness">خانه و املاک</span></strong>
<p data-i18n="homeBusinessDesc">
خرید، فروش و کرایه
</p>
</div>

</div>

</div>

</section>

</div>

<div id="toast" class="toast"></div>


<script>

/* =====================================================
   YAR AFGHANISTAN 2.0
   Frontend → /api/chat → Cloudflare → OpenRouter
===================================================== */

const API_URL = "/api/chat";

let chatHistory = [];

const translationsUI = {

dari:{
title:"یار افغانستان",
subtitle:"دستیار دیجیتال مردم افغانستان 🇦🇫",
badge:"🚀 آماده برای شما",
heroTitle:"سلام! من یار هستم 🤖",
heroText:"یک دستیار دیجیتال برای مردم افغانستان. ترجمه، چت، درس، نوشتن، آگهی و امکانات بیشتر.",
featuresTitle:"قابلیت‌های یار",
featuresSubtitle:"روی هر قابلیت بزن",
chat:"چت با یار",
chatDesc:"گفتگو و پاسخ به سوالات",
translator:"مترجم",
translatorDesc:"دری، پشتو و انگلیسی",
voice:"صدا به متن",
voiceDesc:"صحبت کن و متن بگیر",
photo:"خواندن عکس",
photoDesc:"آماده برای OCR",
study:"کمک درسی",
studyDesc:"کمک در حل سوالات",
writing:"نوشتن متن",
writingDesc:"پیام و متن حرفه‌ای",
makeAd:"ساخت آگهی",
makeAdDesc:"آگهی فروش حرفه‌ای",
pro:"یار Pro",
proDesc:"امکانات پیشرفته به‌زودی",
specialAd:"آگهی ویژه",
specialAdDesc:"برای کسب‌وکارها و فروشندگان",
back:"← برگشت",
chatWelcome:"سلام! من یار هستم 👋",
chatWelcomeText:"سوالت را بنویس و با من گفتگو کن.",
translatorTitle:"🌐 مترجم یار",
translatorSub:"دری ↔ پشتو ↔ انگلیسی",
translateButton:"🔄 ترجمه کن",
translationResult:"نتیجه ترجمه",
voiceTitle:"تبدیل صدا به متن",
voiceDescFull:"روی دکمه بزن و صحبت کن.",
startVoice:"🎙️ شروع صحبت",
photoTitle:"خواندن متن از عکس",
photoDescFull:"عکس را انتخاب کن.",
choosePhoto:"📷 انتخاب عکس",
studyTitle:"کمک درسی",
studyDescFull:"سوال خود را بنویس.",
solve:"🧠 حل سوال",
writingTitle:"کمک در نوشتن",
writingDescFull:"موضوع متن را بنویس.",
makeText:"✍️ ساخت متن",
adTitle:"ساخت آگهی فروش",
adDesc:"اطلاعات محصول را وارد کن.",
makeAdButton:"🛒 ساخت آگهی",
proTitle:"یار Pro",
proSubtitle:"قابلیت‌های ویژه به‌زودی 🚀",
proNoAds:"بدون تبلیغات<small>به‌زودی</small>",
proAI:"هوش مصنوعی پیشرفته‌تر<small>برای سوالات پیچیده</small>",
proTranslate:"ترجمه بیشتر<small>متن‌های طولانی‌تر</small>",
proOCR:"OCR پیشرفته<small>خواندن متن از عکس</small>",
tryPro:"🔔 به‌زودی فعال می‌شود",
specialAdTitle:"آگهی ویژه",
specialAdText:"برای فروشگاه‌ها، خدمات و کسب‌وکارهای افغانستان.",
sampleBusiness:"فروشگاه نمونه",
sampleBusinessText:"این قسمت محل نمایش آگهی‌های ویژه کسب‌وکارها خواهد بود.",
registerAd:"📢 ثبت آگهی ویژه",
businesses:"کسب‌وکارها",
businessesSub:"دسته‌بندی‌های نمونه",
mobileBusiness:"موبایل و لوازم",
mobileBusinessDesc:"فروش موبایل، تعمیرات و لوازم جانبی",
foodBusiness:"رستوران و غذا",
foodBusinessDesc:"رستوران‌ها و خدمات غذایی",
transportBusiness:"حمل‌ونقل",
transportBusinessDesc:"تاکسی و خدمات حمل‌ونقل",
homeBusiness:"خانه و املاک",
homeBusinessDesc:"خرید، فروش و کرایه"
},

pashto:{
title:"افغانستان یار",
subtitle:"د افغانستان د خلکو ډیجیټل مرستیال 🇦🇫",
badge:"🚀 ستاسو لپاره چمتو",
heroTitle:"سلام! زه یار یم 🤖",
heroText:"د افغانستان د خلکو لپاره ډیجیټل مرستیال. ژباړه، چټ، زده کړه، لیکل، اعلانونه او نورې اسانتیاوې.",
featuresTitle:"د یار اسانتیاوې",
featuresSubtitle:"پر هرې اسانتیا کلیک وکړئ",
chat:"له یار سره چټ",
chatDesc:"خبرې او د پوښتنو ځوابونه",
translator:"ژباړونکی",
translatorDesc:"دري، پښتو او انګلیسي",
voice:"غږ په متن",
voiceDesc:"خبرې وکړئ او متن ترلاسه کړئ",
photo:"د عکس لوستل",
photoDesc:"د OCR لپاره چمتو",
study:"زده کړه",
studyDesc:"د پوښتنو په حل کې مرسته",
writing:"متن لیکل",
writingDesc:"مسلکي پیغامونه او متنونه",
makeAd:"اعلان جوړول",
makeAdDesc:"مسلکي د خرڅلاو اعلان",
pro:"یار Pro",
proDesc:"پرمختللي امکانات ډېر ژر",
specialAd:"ځانګړی اعلان",
specialAdDesc:"د سوداګرو او کاروبارونو لپاره",
back:"← شاته",
chatWelcome:"سلام! زه یار یم 👋",
chatWelcomeText:"خپله پوښتنه ولیکئ او له ما سره خبرې وکړئ.",
translatorTitle:"🌐 د یار ژباړونکی",
translatorSub:"دري ↔ پښتو ↔ انګلیسي",
translateButton:"🔄 ژباړه",
translationResult:"د ژباړې پایله",
voiceTitle:"غږ په متن بدلول",
voiceDescFull:"تڼۍ کېکاږئ او خبرې وکړئ.",
startVoice:"🎙️ خبرې پیل کړئ",
photoTitle:"له عکس څخه متن لوستل",
photoDescFull:"عکس انتخاب کړئ.",
choosePhoto:"📷 عکس انتخاب کړئ",
studyTitle:"د زده کړې مرسته",
studyDescFull:"خپله پوښتنه ولیکئ.",
solve:"🧠 پوښتنه حل کړئ",
writingTitle:"د لیکلو مرسته",
writingDescFull:"د متن موضوع ولیکئ.",
makeText:"✍️ متن جوړ کړئ",
adTitle:"د خرڅلاو اعلان",
adDesc:"د محصول معلومات ولیکئ.",
makeAdButton:"🛒 اعلان جوړ کړئ",
proTitle:"یار Pro",
proSubtitle:"ځانګړي امکانات ډېر ژر 🚀",
proNoAds:"بې اعلانونو<small>ډېر ژر</small>",
proAI:"پرمختللی مصنوعي ځیرکتیا<small>د پیچلو پوښتنو لپاره</small>",
proTranslate:"زیاته ژباړه<small>اوږده متنونه</small>",
proOCR:"پرمختللی OCR<small>له عکس څخه متن</small>",
tryPro:"🔔 ډېر ژر فعالېږي",
specialAdTitle:"ځانګړی اعلان",
specialAdText:"د افغانستان د دوکانونو، خدماتو او کاروبارونو لپاره.",
sampleBusiness:"د نمونې دوکان",
sampleBusinessText:"دا برخه به د کاروبارونو ځانګړي اعلانونه وښيي.",
registerAd:"📢 ځانګړی اعلان ثبت کړئ",
businesses:"کاروبارونه",
businessesSub:"د نمونې کټګورۍ",
mobileBusiness:"موبایل او لوازم",
mobileBusinessDesc:"موبایل، ترمیم او جانبي لوازم",
foodBusiness:"رستورانت او خواړه",
foodBusinessDesc:"رستورانتونه او د خوړو خدمات",
transportBusiness:"ترانسپورت",
transportBusinessDesc:"ټکسي او ترانسپورتي خدمات",
homeBusiness:"کور او املاک",
homeBusinessDesc:"پېر، پلور او کرایه"
},

english:{
title:"Afghanistan Yar",
subtitle:"Digital assistant for the people of Afghanistan 🇦🇫",
badge:"🚀 Ready for You",
heroTitle:"Hello! I am Yar 🤖",
heroText:"A digital assistant for Afghanistan. Translation, chat, study, writing, ads and more.",
featuresTitle:"Yar Features",
featuresSubtitle:"Tap any feature",
chat:"Chat with Yar",
chatDesc:"Conversation and answers",
translator:"Translator",
translatorDesc:"Dari, Pashto and English",
voice:"Speech to Text",
voiceDesc:"Speak and get text",
photo:"Read Photo",
photoDesc:"Ready for OCR",
study:"Study Help",
studyDesc:"Help solving questions",
writing:"Writing",
writingDesc:"Professional messages and text",
makeAd:"Create Ad",
makeAdDesc:"Professional sales ad",
pro:"Yar Pro",
proDesc:"Advanced features coming soon",
specialAd:"Featured Ads",
specialAdDesc:"For businesses and sellers",
back:"← Back",
chatWelcome:"Hello! I am Yar 👋",
chatWelcomeText:"Write your question and chat with me.",
translatorTitle:"🌐 Yar Translator",
translatorSub:"Dari ↔ Pashto ↔ English",
translateButton:"🔄 Translate",
translationResult:"Translation result",
voiceTitle:"Speech to Text",
voiceDescFull:"Tap the button and speak.",
startVoice:"🎙️ Start Speaking",
photoTitle:"Read Text From Photo",
photoDescFull:"Choose a photo.",
choosePhoto:"📷 Choose Photo",
studyTitle:"Study Help",
studyDescFull:"Write your question.",
solve:"🧠 Solve",
writingTitle:"Writing Help",
writingDescFull:"Write the topic of your text.",
makeText:"✍️ Create Text",
adTitle:"Create Sales Ad",
adDesc:"Enter product information.",
makeAdButton:"🛒 Create Ad",
proTitle:"Yar Pro",
proSubtitle:"Special features coming soon 🚀",
proNoAds:"No Ads<small>Coming soon</small>",
proAI:"Advanced AI<small>For complex questions</small>",
proTranslate:"More Translation<small>Longer texts</small>",
proOCR:"Advanced OCR<small>Read text from photos</small>",
tryPro:"🔔 Coming Soon",
specialAdTitle:"Featured Ad",
specialAdText:"For shops, services and businesses in Afghanistan.",
sampleBusiness:"Sample Business",
sampleBusinessText:"This area will display featured business ads.",
registerAd:"📢 Register Featured Ad",
businesses:"Businesses",
businessesSub:"Sample categories",
mobileBusiness:"Mobile & Accessories",
mobileBusinessDesc:"Phones, repairs and accessories",
foodBusiness:"Restaurants & Food",
foodBusinessDesc:"Restaurants and food services",
transportBusiness:"Transport",
transportBusinessDesc:"Taxi and transportation services",
homeBusiness:"Homes & Real Estate",
homeBusinessDesc:"Buy, sell and rent"
}

};


/* =====================================================
   LANGUAGE
===================================================== */

function changeAppLanguage(){

 const lang=document.getElementById("appLanguage").value;

 const t=translationsUI[lang];

 document.documentElement.lang=lang==="english"?"en":"fa";
 document.documentElement.dir=lang==="english"?"ltr":"rtl";

 document.getElementById("appTitle").textContent=t.title;
 document.getElementById("appSubtitle").textContent=t.subtitle;
 document.getElementById("heroBadge").textContent=t.badge;
 document.getElementById("heroTitle").textContent=t.heroTitle;
 document.getElementById("heroText").textContent=t.heroText;
 document.getElementById("featuresTitle").textContent=t.featuresTitle;
 document.getElementById("featuresSubtitle").textContent=t.featuresSubtitle;
 document.getElementById("chatWelcome").textContent=t.chatWelcome;
 document.getElementById("chatWelcomeText").textContent=t.chatWelcomeText;

 document.querySelectorAll("[data-i18n]").forEach(el=>{
   const key=el.getAttribute("data-i18n");
   if(t[key]!==undefined){
     el.innerHTML=t[key];
   }
 });

 localStorage.setItem("yarLanguage",lang);
}


/* =====================================================
   PAGE
===================================================== */

function openPage(id){

 document.querySelectorAll(".page")
 .forEach(p=>p.classList.remove("active"));

 const page=document.getElementById(id);

 if(page){
   page.classList.add("active");
 }

 window.scrollTo(0,0);
}


/* =====================================================
   CHAT
===================================================== */

const chat=document.getElementById("chat");
const input=document.getElementById("input");
const sendButton=document.getElementById("sendButton");

input.addEventListener("keydown",function(e){

 if(e.key==="Enter" && !e.shiftKey){

   e.preventDefault();

   sendMessage();

 }

});


function addMessage(text,type){

 const welcome=document.getElementById("welcome");

 if(welcome){
   welcome.remove();
 }

 const message=document.createElement("div");

 message.className="message "+type;

 const bubble=document.createElement("div");

 bubble.className="bubble";

 bubble.textContent=text;

 message.appendChild(bubble);

 chat.appendChild(message);

 chat.scrollTop=chat.scrollHeight;
}


function addLoading(){

 const message=document.createElement("div");

 message.className="message ai";
 message.id="aiLoading";

 const bubble=document.createElement("div");

 bubble.className="bubble loading";

 bubble.textContent="در حال فکر کردن";

 message.appendChild(bubble);

 chat.appendChild(message);

 chat.scrollTop=chat.scrollHeight;
}


function removeLoading(){

 const loading=document.getElementById("aiLoading");

 if(loading){
   loading.remove();
 }

}


function getCurrentLanguageName(){

 const lang=document.getElementById("appLanguage").value;

 if(lang==="pashto") return "Pashto";

 if(lang==="english") return "English";

 return "Dari";
}


/*
   مهم:
   این تابع دقیقاً به functions/api/chat.js وصل می‌شود.
*/

async function callAI(message,extraPrompt=""){

 const language=getCurrentLanguageName();

 const finalMessage=
 `${extraPrompt ? extraPrompt+"\n\n" : ""}
User language: ${language}

User request:
${message}`;

 const messages=[
   ...chatHistory,
   {
     role:"user",
     content:finalMessage
   }
 ];

 const response=await fetch(API_URL,{

   method:"POST",

   headers:{
     "Content-Type":"application/json"
   },

   body:JSON.stringify({

     message:message,

     messages:messages

   })

 });

 let data=null;

 try{
   data=await response.json();
 }catch(e){
   throw new Error("پاسخ نامعتبر از سرور دریافت شد.");
 }

 if(!response.ok || !data || data.success!==true){

   const errorMessage=
     data?.error ||
     data?.provider_error ||
     `خطای API (${response.status})`;

   throw new Error(errorMessage);
 }

 if(!data.reply){

   throw new Error("پاسخ هوش مصنوعی خالی است.");
 }

 chatHistory.push({
   role:"user",
   content:message
 });

 chatHistory.push({
   role:"assistant",
   content:data.reply
 });

 if(chatHistory.length>12){

   chatHistory=chatHistory.slice(-12);

 }

 return data.reply;
}


async function sendMessage(){

 const text=input.value.trim();

 if(!text || sendButton.disabled){
   return;
 }

 addMessage(text,"user");

 input.value="";

 sendButton.disabled=true;

 addLoading();

 setApiStatus("در حال اتصال به هوش مصنوعی...");

 try{

   const answer=await callAI(text);

   removeLoading();

   addMessage(answer,"ai");

   setApiStatus("● اتصال به هوش مصنوعی برقرار است");

 }catch(error){

   removeLoading();

   console.error("Yar Chat Error:",error);

   addMessage(
     "❌ ارتباط با هوش مصنوعی برقرار نشد.\n\n"+error.message,
     "ai"
   );

   setApiStatus("● خطا در اتصال به API");

 }

 sendButton.disabled=false;

 input.focus();
}


/* =====================================================
   API STATUS
===================================================== */

function setApiStatus(text){

 const el=document.getElementById("apiStatus");

 if(el){
   el.textContent=text;
 }
}


/* =====================================================
   TRANSLATOR
===================================================== */

async function translateText(){

 const inputText=document
   .getElementById("translationInput")
   .value
   .trim();

 const from=document
   .getElementById("fromLanguage")
   .value;

 const to=document
   .getElementById("toLanguage")
   .value;

 const result=document
   .getElementById("translationResult");

 const status=document
   .getElementById("translationStatus");

 const button=document
   .getElementById("translateButton");

 if(!inputText){

   result.textContent=
     document.getElementById("appLanguage").value==="english"
     ? "Please enter text."
     : "لطفاً متن را وارد کن.";

   return;
 }

 if(from===to){

   result.textContent=inputText;

   return;
 }

 button.disabled=true;

 result.textContent="";

 status.textContent="در حال ترجمه...";

 try{

   const fromName=
     from==="dari" ? "Dari" :
     from==="pashto" ? "Pashto" :
     "English";

   const toName=
     to==="dari" ? "Dari" :
     to==="pashto" ? "Pashto" :
     "English";

   const prompt=
`Translate the following text from ${fromName} to ${toName}.

Rules:
- Return ONLY the translation.
- Do not explain.
- Preserve the original meaning.
- Use natural Afghan Dari or Pashto when those languages are requested.

Text:
${inputText}`;

   const answer=await callAI(
     inputText,
     prompt
   );

   result.textContent=answer;

   status.textContent="✓ ترجمه با هوش مصنوعی انجام شد";

 }catch(error){

   console.error(error);

   result.textContent=
     "❌ "+error.message;

   status.textContent="خطا در ترجمه";

 }finally{

   button.disabled=false;

 }

}


function swapLanguages(){

 const from=document.getElementById("fromLanguage");
 const to=document.getElementById("toLanguage");

 const temp=from.value;

 from.value=to.value;
 to.value=temp;

 const text=
   document.getElementById("translationInput")
   .value.trim();

 if(text){
   translateText();
 }

}


/* =====================================================
   STUDY
===================================================== */

async function solveStudy(){

 const inputEl=document.getElementById("studyInput");

 const output=document.getElementById("studyOutput");

 const button=document.getElementById("studyButton");

 const text=inputEl.value.trim();

 if(!text){

   output.textContent="لطفاً سوال را بنویس.";

   return;
 }

 button.disabled=true;

 output.textContent="🧠 در حال حل سوال...";

 try{

   const lang=
     document.getElementById("appLanguage").value;

   const language=
     lang==="english" ? "English" :
     lang==="pashto" ? "Pashto" :
     "Dari";

   const prompt=
`You are the study assistant of Yar Afghanistan.

Answer the student's question in ${language}.

Explain the solution clearly and simply.
If it is a math problem, show the calculation.
Do not invent information.

Student question:
${text}`;

   const answer=await callAI(text,prompt);

   output.textContent=answer;

 }catch(error){

   output.textContent="❌ "+error.message;

 }finally{

   button.disabled=false;

 }

}


/* =====================================================
   WRITING
===================================================== */

async function makeText(){

 const inputEl=document.getElementById("writeInput");

 const output=document.getElementById("writeOutput");

 const button=document.getElementById("writeButton");

 const text=inputEl.value.trim();

 if(!text){

   output.textContent="موضوع متن را بنویس.";

   return;
 }

 button.disabled=true;

 output.textContent="✍️ در حال نوشتن...";

 try{

   const lang=
     document.getElementById("appLanguage").value;

   const language=
     lang==="english" ? "English" :
     lang==="pashto" ? "Pashto" :
     "Dari";

   const prompt=
`You are the writing assistant of Yar Afghanistan.

Create a polished, natural and useful text in ${language}.

The user wants:
${text}

Return only the finished text.
Do not add explanations before or after it.`;

   const answer=await callAI(text,prompt);

   output.textContent=answer;

 }catch(error){

   output.textContent="❌ "+error.message;

 }finally{

   button.disabled=false;

 }

}


/* =====================================================
   SALES AD
===================================================== */

async function makeAd(){

 const inputEl=document.getElementById("adInput");

 const output=document.getElementById("adOutput");

 const button=document.getElementById("adButton");

 const text=inputEl.value.trim();

 if(!text){

   output.textContent="اطلاعات محصول را وارد کن.";

   return;
 }

 button.disabled=true;

 output.textContent="🛒 در حال ساخت آگهی...";

 try{

   const lang=
     document.getElementById("appLanguage").value;

   const language=
     lang==="english" ? "English" :
     lang==="pashto" ? "Pashto" :
     "Dari";

   const prompt=
`You are the sales advertisement assistant of Yar Afghanistan.

Create an attractive but honest sales advertisement in ${language}.

Product information:
${text}

Include:
- Product title
- Short attractive description
- Important features if provided
- Price if provided
- Contact information only if provided
- A clear call to action

Do not invent price, phone number, address or product specifications.

Return only the finished advertisement.`;

   const answer=await callAI(text,prompt);

   output.textContent=answer;

 }catch(error){

   output.textContent="❌ "+error.message;

 }finally{

   button.disabled=false;

 }

}


/* =====================================================
   VOICE
===================================================== */

function startVoice(){

 const output=document.getElementById("voiceOutput");

 const Recognition=
   window.SpeechRecognition ||
   window.webkitSpeechRecognition;

 if(!Recognition){

   output.textContent=
     "مرورگر گوشی از تشخیص صدا پشتیبانی نمی‌کند.";

   return;
 }

 const recognition=new Recognition();

 const lang=
   document.getElementById("appLanguage").value;

 recognition.lang=
   lang==="english"
   ? "en-US"
   : lang==="pashto"
   ? "ps-AF"
   : "fa-AF";

 recognition.interimResults=false;
 recognition.maxAlternatives=1;

 output.textContent="🎙️ در حال گوش دادن...";

 try{

   recognition.start();

 }catch(error){

   output.textContent=
     "تشخیص صدا در حال حاضر فعال نشد.";

 }

 recognition.onresult=function(event){

   output.textContent=
     event.results[0][0].transcript;

 };

 recognition.onerror=function(){

   output.textContent=
     "تشخیص صدا با مشکل مواجه شد.";

 };

}


/* =====================================================
   PHOTO
===================================================== */

function photoSelected(event){

 const file=event.target.files[0];

 const output=document.getElementById("photoOutput");

 if(!file){
   return;
 }

 const size=(file.size/1024).toFixed(1);

 output.textContent=
 `📷 عکس انتخاب شد:

${file.name}

حجم: ${size} KB

عکس آماده است.
قابلیت OCR کامل در مرحله بعدی اضافه می‌شود.`;

}


/* =====================================================
   PRO / ADS
===================================================== */

function tryPro(){

 showToast(
   "⭐ قابلیت‌های Pro به‌زودی فعال می‌شوند."
 );

}


function showAdInfo(){

 showToast(
   "📢 بخش ثبت آگهی ویژه در حال آماده‌سازی است."
 );

}


function showToast(text){

 const el=document.getElementById("toast");

 el.textContent=text;

 el.style.display="block";

 clearTimeout(window._toast);

 window._toast=
   setTimeout(()=>{
     el.style.display="none";
   },3000);

}


/* =====================================================
   LOAD LANGUAGE
===================================================== */

const savedLanguage=
 localStorage.getItem("yarLanguage");

if(
 savedLanguage &&
 translationsUI[savedLanguage]
){

 document.getElementById("appLanguage").value=
   savedLanguage;

}

changeAppLanguage();


/* =====================================================
   BASIC API HEALTH CHECK
===================================================== */

async function checkAPI(){

 try{

   const response=
     await fetch(API_URL,{
       method:"GET",
       cache:"no-store"
     });

   if(response.ok){

     setApiStatus(
       "● API آنلاین است"
     );

   }else{

     setApiStatus(
       "● API در دسترس نیست"
     );

   }

 }catch(error){

   setApiStatus(
     "● اتصال به API برقرار نیست"
   );

 }

}

checkAPI();

</script>

</body>
</html>
