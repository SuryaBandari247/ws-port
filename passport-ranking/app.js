// Passport Ranking Data - Henley Passport Index 2026
// Sources: Henley & Partners, IATA (Jan 2026)
var DATA=[
{r:1,n:"Singapore",f:"\ud83c\uddf8\ud83c\uddec",s:192,re:"Asia",g:"/guides/"},
{r:2,n:"Japan",f:"\ud83c\uddef\ud83c\uddf5",s:187,re:"Asia",g:"/guides/japan-passport-photo/"},
{r:2,n:"South Korea",f:"\ud83c\uddf0\ud83c\uddf7",s:187,re:"Asia",g:"/guides/"},
{r:3,n:"Sweden",f:"\ud83c\uddf8\ud83c\uddea",s:186,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:3,n:"United Arab Emirates",f:"\ud83c\udde6\ud83c\uddea",s:186,re:"Asia",g:"/guides/"},
{r:4,n:"Belgium",f:"\ud83c\udde7\ud83c\uddea",s:185,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:4,n:"Denmark",f:"\ud83c\udde9\ud83c\uddf0",s:185,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:4,n:"Finland",f:"\ud83c\uddeb\ud83c\uddee",s:185,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:4,n:"France",f:"\ud83c\uddeb\ud83c\uddf7",s:185,re:"Europe",g:"/guides/france-passport-photo/"},
{r:4,n:"Germany",f:"\ud83c\udde9\ud83c\uddea",s:185,re:"Europe",g:"/guides/germany-passport-photo/"},
{r:4,n:"Ireland",f:"\ud83c\uddee\ud83c\uddea",s:185,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:4,n:"Italy",f:"\ud83c\uddee\ud83c\uddf9",s:185,re:"Europe",g:"/guides/fototessera-passaporto/"},
{r:4,n:"Luxembourg",f:"\ud83c\uddf1\ud83c\uddfa",s:185,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:4,n:"Netherlands",f:"\ud83c\uddf3\ud83c\uddf1",s:185,re:"Europe",g:"/guides/netherlands-passport-photo/"},
{r:4,n:"Norway",f:"\ud83c\uddf3\ud83c\uddf4",s:185,re:"Europe",g:"/guides/norway-passport-photo/"},
{r:4,n:"Spain",f:"\ud83c\uddea\ud83c\uddf8",s:185,re:"Europe",g:"/guides/foto-pasaporte-espana/"},
{r:4,n:"Switzerland",f:"\ud83c\udde8\ud83c\udded",s:185,re:"Europe",g:"/guides/switzerland-passport-photo/"},
{r:5,n:"Austria",f:"\ud83c\udde6\ud83c\uddf9",s:184,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:5,n:"Greece",f:"\ud83c\uddec\ud83c\uddf7",s:184,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:5,n:"Hungary",f:"\ud83c\udded\ud83c\uddfa",s:184,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:5,n:"Malta",f:"\ud83c\uddf2\ud83c\uddf9",s:184,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:5,n:"Portugal",f:"\ud83c\uddf5\ud83c\uddf9",s:184,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:5,n:"Slovakia",f:"\ud83c\uddf8\ud83c\uddf0",s:184,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:5,n:"Slovenia",f:"\ud83c\uddf8\ud83c\uddee",s:184,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:6,n:"Croatia",f:"\ud83c\udded\ud83c\uddf7",s:183,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:6,n:"Czechia",f:"\ud83c\udde8\ud83c\uddff",s:183,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:6,n:"Estonia",f:"\ud83c\uddea\ud83c\uddea",s:183,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:6,n:"Malaysia",f:"\ud83c\uddf2\ud83c\uddfe",s:183,re:"Asia",g:"/guides/"},
{r:6,n:"New Zealand",f:"\ud83c\uddf3\ud83c\uddff",s:183,re:"Oceania",g:"/guides/"},
{r:6,n:"Poland",f:"\ud83c\uddf5\ud83c\uddf1",s:183,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:7,n:"Australia",f:"\ud83c\udde6\ud83c\uddfa",s:182,re:"Oceania",g:"/guides/australia-passport-photo/"},
{r:7,n:"Latvia",f:"\ud83c\uddf1\ud83c\uddfb",s:182,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:7,n:"Liechtenstein",f:"\ud83c\uddf1\ud83c\uddee",s:182,re:"Europe",g:"/guides/"},
{r:7,n:"United Kingdom",f:"\ud83c\uddec\ud83c\udde7",s:182,re:"Europe",g:"/guides/uk-passport-photo/"},
{r:8,n:"Canada",f:"\ud83c\udde8\ud83c\udde6",s:181,re:"Americas",g:"/guides/canada-passport-photo/"},
{r:8,n:"Iceland",f:"\ud83c\uddee\ud83c\uddf8",s:181,re:"Europe",g:"/guides/"},
{r:8,n:"Lithuania",f:"\ud83c\uddf1\ud83c\uddf9",s:181,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:9,n:"Monaco",f:"\ud83c\uddf2\ud83c\udde8",s:180,re:"Europe",g:"/guides/"},
{r:10,n:"United States",f:"\ud83c\uddfa\ud83c\uddf8",s:179,re:"Americas",g:"/guides/us-passport-photo/"},
{r:11,n:"Romania",f:"\ud83c\uddf7\ud83c\uddf4",s:178,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:12,n:"Bulgaria",f:"\ud83c\udde7\ud83c\uddec",s:176,re:"Europe",g:"/guides/eu-passport-photo/"},
{r:13,n:"Hong Kong",f:"\ud83c\udded\ud83c\uddf0",s:173,re:"Asia",g:"/guides/"},
{r:14,n:"Chile",f:"\ud83c\udde8\ud83c\uddf1",s:172,re:"Americas",g:"/guides/"},
{r:14,n:"Cyprus",f:"\ud83c\udde8\ud83c\uddfe",s:172,re:"Europe",g:"/guides/"},
{r:15,n:"Argentina",f:"\ud83c\udde6\ud83c\uddf7",s:171,re:"Americas",g:"/guides/"},
{r:16,n:"Brazil",f:"\ud83c\udde7\ud83c\uddf7",s:170,re:"Americas",g:"/guides/"},
{r:17,n:"San Marino",f:"\ud83c\uddf8\ud83c\uddf2",s:169,re:"Europe",g:"/guides/"},
{r:18,n:"Andorra",f:"\ud83c\udde6\ud83c\udde9",s:167,re:"Europe",g:"/guides/"},
{r:18,n:"Israel",f:"\ud83c\uddee\ud83c\uddf1",s:167,re:"Asia",g:"/guides/"},
{r:19,n:"Brunei",f:"\ud83c\udde7\ud83c\uddf3",s:163,re:"Asia",g:"/guides/"},
{r:19,n:"Mexico",f:"\ud83c\uddf2\ud83c\uddfd",s:163,re:"Americas",g:"/guides/"},
{r:20,n:"Barbados",f:"\ud83c\udde7\ud83c\udde7",s:161,re:"Americas",g:"/guides/"},
{r:21,n:"Bahamas",f:"\ud83c\udde7\ud83c\uddf8",s:160,re:"Americas",g:"/guides/"},
{r:22,n:"St. Kitts and Nevis",f:"\ud83c\uddf0\ud83c\uddf3",s:157,re:"Americas",g:"/guides/"},
{r:22,n:"Uruguay",f:"\ud83c\uddfa\ud83c\uddfe",s:157,re:"Americas",g:"/guides/"},
{r:23,n:"Antigua and Barbuda",f:"\ud83c\udde6\ud83c\uddec",s:155,re:"Americas",g:"/guides/"},
{r:23,n:"Seychelles",f:"\ud83c\uddf8\ud83c\udde8",s:155,re:"Africa",g:"/guides/"},
{r:24,n:"Costa Rica",f:"\ud83c\udde8\ud83c\uddf7",s:153,re:"Americas",g:"/guides/"},
{r:24,n:"Trinidad and Tobago",f:"\ud83c\uddf9\ud83c\uddf9",s:153,re:"Americas",g:"/guides/"},
{r:25,n:"Grenada",f:"\ud83c\uddec\ud83c\udde9",s:148,re:"Americas",g:"/guides/"},
{r:25,n:"Mauritius",f:"\ud83c\uddf2\ud83c\uddfa",s:148,re:"Africa",g:"/guides/"},
{r:26,n:"St. Lucia",f:"\ud83c\uddf1\ud83c\udde8",s:146,re:"Americas",g:"/guides/"},
{r:26,n:"St. Vincent",f:"\ud83c\uddfb\ud83c\udde8",s:146,re:"Americas",g:"/guides/"},
{r:27,n:"Dominica",f:"\ud83c\udde9\ud83c\uddf2",s:145,re:"Americas",g:"/guides/"},
{r:28,n:"Panama",f:"\ud83c\uddf5\ud83c\udde6",s:143,re:"Americas",g:"/guides/"},
{r:29,n:"Macau",f:"\ud83c\uddf2\ud83c\uddf4",s:142,re:"Asia",g:"/guides/"},
{r:30,n:"Taiwan",f:"\ud83c\uddf9\ud83c\uddfc",s:135,re:"Asia",g:"/guides/"},
{r:31,n:"Vanuatu",f:"\ud83c\uddfb\ud83c\uddfa",s:132,re:"Oceania",g:"/guides/"},
{r:32,n:"Paraguay",f:"\ud83c\uddf5\ud83c\uddfe",s:130,re:"Americas",g:"/guides/"},
{r:33,n:"Guatemala",f:"\ud83c\uddec\ud83c\uddf9",s:128,re:"Americas",g:"/guides/"},
{r:33,n:"Honduras",f:"\ud83c\udded\ud83c\uddf3",s:128,re:"Americas",g:"/guides/"},
{r:34,n:"El Salvador",f:"\ud83c\uddf8\ud83c\uddfb",s:127,re:"Americas",g:"/guides/"},
{r:34,n:"Serbia",f:"\ud83c\uddf7\ud83c\uddf8",s:127,re:"Europe",g:"/guides/"},
{r:35,n:"Colombia",f:"\ud83c\udde8\ud83c\uddf4",s:126,re:"Americas",g:"/guides/"},
{r:35,n:"Peru",f:"\ud83c\uddf5\ud83c\uddea",s:126,re:"Americas",g:"/guides/"},
{r:36,n:"Tonga",f:"\ud83c\uddf9\ud83c\uddf4",s:124,re:"Oceania",g:"/guides/"},
{r:37,n:"Nicaragua",f:"\ud83c\uddf3\ud83c\uddee",s:122,re:"Americas",g:"/guides/"},
{r:38,n:"Samoa",f:"\ud83c\uddfc\ud83c\uddf8",s:120,re:"Oceania",g:"/guides/"},
{r:39,n:"Solomon Islands",f:"\ud83c\uddf8\ud83c\udde7",s:118,re:"Oceania",g:"/guides/"},
{r:40,n:"North Macedonia",f:"\ud83c\uddf2\ud83c\uddf0",s:117,re:"Europe",g:"/guides/"},
{r:41,n:"Bosnia and Herzegovina",f:"\ud83c\udde7\ud83c\udde6",s:116,re:"Europe",g:"/guides/"},
{r:42,n:"Georgia",f:"\ud83c\uddec\ud83c\uddea",s:115,re:"Europe",g:"/guides/"},
{r:42,n:"Tuvalu",f:"\ud83c\uddf9\ud83c\uddfb",s:115,re:"Oceania",g:"/guides/"},
{r:43,n:"Kiribati",f:"\ud83c\uddf0\ud83c\uddee",s:113,re:"Oceania",g:"/guides/"},
{r:43,n:"Marshall Islands",f:"\ud83c\uddf2\ud83c\udded",s:113,re:"Oceania",g:"/guides/"},
{r:44,n:"Albania",f:"\ud83c\udde6\ud83c\uddf1",s:112,re:"Europe",g:"/guides/"},
{r:44,n:"Micronesia",f:"\ud83c\uddeb\ud83c\uddf2",s:112,re:"Oceania",g:"/guides/"},
{r:45,n:"Moldova",f:"\ud83c\uddf2\ud83c\udde9",s:110,re:"Europe",g:"/guides/"},
{r:46,n:"Ukraine",f:"\ud83c\uddfa\ud83c\udde6",s:108,re:"Europe",g:"/guides/"},
{r:47,n:"Timor-Leste",f:"\ud83c\uddf9\ud83c\uddf1",s:105,re:"Asia",g:"/guides/"},
{r:48,n:"Montenegro",f:"\ud83c\uddf2\ud83c\uddea",s:103,re:"Europe",g:"/guides/"},
{r:49,n:"Palau",f:"\ud83c\uddf5\ud83c\uddfc",s:101,re:"Oceania",g:"/guides/"},
{r:50,n:"Botswana",f:"\ud83c\udde7\ud83c\uddfc",s:98,re:"Africa",g:"/guides/"},
{r:50,n:"Turkey",f:"\ud83c\uddf9\ud83c\uddf7",s:98,re:"Europe",g:"/guides/"},
{r:51,n:"South Africa",f:"\ud83c\uddff\ud83c\udde6",s:96,re:"Africa",g:"/guides/"},
{r:52,n:"Nauru",f:"\ud83c\uddf3\ud83c\uddf7",s:93,re:"Oceania",g:"/guides/"},
{r:53,n:"Oman",f:"\ud83c\uddf4\ud83c\uddf2",s:90,re:"Asia",g:"/guides/"},
{r:54,n:"Qatar",f:"\ud83c\uddf6\ud83c\udde6",s:89,re:"Asia",g:"/guides/"},
{r:55,n:"Bahrain",f:"\ud83c\udde7\ud83c\udded",s:88,re:"Asia",g:"/guides/"},
{r:55,n:"Kuwait",f:"\ud83c\uddf0\ud83c\uddfc",s:88,re:"Asia",g:"/guides/"},
{r:56,n:"Saudi Arabia",f:"\ud83c\uddf8\ud83c\udde6",s:85,re:"Asia",g:"/guides/"},
{r:57,n:"Belarus",f:"\ud83c\udde7\ud83c\uddfe",s:83,re:"Europe",g:"/guides/"},
{r:57,n:"Kenya",f:"\ud83c\uddf0\ud83c\uddea",s:83,re:"Africa",g:"/guides/"},
{r:58,n:"Thailand",f:"\ud83c\uddf9\ud83c\udded",s:78,re:"Asia",g:"/guides/"},
{r:59,n:"China",f:"\ud83c\udde8\ud83c\uddf3",s:81,re:"Asia",g:"/guides/china-passport-photo/"},
{r:60,n:"Kazakhstan",f:"\ud83c\uddf0\ud83c\uddff",s:77,re:"Asia",g:"/guides/"},
{r:61,n:"Russia",f:"\ud83c\uddf7\ud83c\uddfa",s:76,re:"Europe",g:"/guides/"},
{r:62,n:"Indonesia",f:"\ud83c\uddee\ud83c\udde9",s:72,re:"Asia",g:"/guides/"},
{r:63,n:"Bolivia",f:"\ud83c\udde7\ud83c\uddf4",s:70,re:"Americas",g:"/guides/"},
{r:64,n:"Maldives",f:"\ud83c\uddf2\ud83c\uddfb",s:68,re:"Asia",g:"/guides/"},
{r:65,n:"Cuba",f:"\ud83c\udde8\ud83c\uddfa",s:67,re:"Americas",g:"/guides/"},
{r:66,n:"Ghana",f:"\ud83c\uddec\ud83c\udded",s:66,re:"Africa",g:"/guides/"},
{r:67,n:"Morocco",f:"\ud83c\uddf2\ud83c\udde6",s:65,re:"Africa",g:"/guides/"},
{r:68,n:"Philippines",f:"\ud83c\uddf5\ud83c\udded",s:65,re:"Asia",g:"/guides/"},
{r:69,n:"Tunisia",f:"\ud83c\uddf9\ud83c\uddf3",s:63,re:"Africa",g:"/guides/"},
{r:70,n:"Vietnam",f:"\ud83c\uddfb\ud83c\uddf3",s:60,re:"Asia",g:"/guides/"},
{r:71,n:"Egypt",f:"\ud83c\uddea\ud83c\uddec",s:58,re:"Africa",g:"/guides/"},
{r:72,n:"Jordan",f:"\ud83c\uddef\ud83c\uddf4",s:57,re:"Asia",g:"/guides/"},
{r:73,n:"Algeria",f:"\ud83c\udde9\ud83c\uddff",s:56,re:"Africa",g:"/guides/"},
{r:75,n:"India",f:"\ud83c\uddee\ud83c\uddf3",s:56,re:"Asia",g:"/guides/india-passport-photo/"},
{r:76,n:"Tajikistan",f:"\ud83c\uddf9\ud83c\uddef",s:54,re:"Asia",g:"/guides/"},
{r:77,n:"Senegal",f:"\ud83c\uddf8\ud83c\uddf3",s:53,re:"Africa",g:"/guides/"},
{r:78,n:"Nigeria",f:"\ud83c\uddf3\ud83c\uddec",s:47,re:"Africa",g:"/guides/"},
{r:79,n:"Ethiopia",f:"\ud83c\uddea\ud83c\uddf9",s:46,re:"Africa",g:"/guides/"},
{r:80,n:"Sri Lanka",f:"\ud83c\uddf1\ud83c\uddf0",s:44,re:"Asia",g:"/guides/"},
{r:81,n:"Myanmar",f:"\ud83c\uddf2\ud83c\uddf2",s:43,re:"Asia",g:"/guides/"},
{r:82,n:"Congo (DRC)",f:"\ud83c\udde8\ud83c\udde9",s:42,re:"Africa",g:"/guides/"},
{r:83,n:"Sudan",f:"\ud83c\uddf8\ud83c\udde9",s:41,re:"Africa",g:"/guides/"},
{r:84,n:"Libya",f:"\ud83c\uddf1\ud83c\uddfe",s:40,re:"Africa",g:"/guides/"},
{r:85,n:"Lebanon",f:"\ud83c\uddf1\ud83c\udde7",s:39,re:"Asia",g:"/guides/"},
{r:92,n:"Eritrea",f:"\ud83c\uddea\ud83c\uddf7",s:38,re:"Africa",g:"/guides/"},
{r:93,n:"Bangladesh",f:"\ud83c\udde7\ud83c\udde9",s:37,re:"Asia",g:"/guides/"},
{r:94,n:"North Korea",f:"\ud83c\uddf0\ud83c\uddf5",s:36,re:"Asia",g:"/guides/"},
{r:95,n:"Nepal",f:"\ud83c\uddf3\ud83c\uddf5",s:35,re:"Asia",g:"/guides/"},
{r:96,n:"Somalia",f:"\ud83c\uddf8\ud83c\uddf4",s:33,re:"Africa",g:"/guides/"},
{r:97,n:"Pakistan",f:"\ud83c\uddf5\ud83c\uddf0",s:32,re:"Asia",g:"/guides/"},
{r:98,n:"Yemen",f:"\ud83c\uddfe\ud83c\uddea",s:31,re:"Asia",g:"/guides/"},
{r:99,n:"Iraq",f:"\ud83c\uddee\ud83c\uddf6",s:29,re:"Asia",g:"/guides/"},
{r:100,n:"Syria",f:"\ud83c\uddf8\ud83c\uddfe",s:26,re:"Asia",g:"/guides/"},
{r:101,n:"Afghanistan",f:"\ud83c\udde6\ud83c\uddeb",s:24,re:"Asia",g:"/guides/"}
];

// Tier helper
function getTier(s){
  if(s>=180) return {c:"t1",l:"Excellent"};
  if(s>=150) return {c:"t2",l:"Strong"};
  if(s>=100) return {c:"t3",l:"Moderate"};
  if(s>=50) return {c:"t4",l:"Limited"};
  return {c:"t5",l:"Very Low"};
}
function getBarColor(s){
  if(s>=180) return "#22c55e";
  if(s>=150) return "#3b82f6";
  if(s>=100) return "#eab308";
  if(s>=50) return "#f97316";
  return "#ef4444";
}

// State
var currentFilter="all";
var currentSort="rank";
var sortDir=1;
var compareMode=false;
var compareList=[];
var MAX=227;

// Animated counters
function animateCounters(){
  document.querySelectorAll(".pr-stat-num[data-target]").forEach(function(el){
    var target=parseInt(el.dataset.target);
    var dur=1200;
    var start=performance.now();
    function tick(now){
      var p=Math.min((now-start)/dur,1);
      var ease=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*ease);
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// Render table
function render(){
  var q=document.getElementById("searchInput").value.toLowerCase().trim();
  var body=document.getElementById("rankingBody");
  var noRes=document.getElementById("noResults");
  var filtered=DATA.filter(function(d){
    if(q && d.n.toLowerCase().indexOf(q)===-1) return false;
    if(currentFilter==="all") return true;
    if(currentFilter==="top10") return d.r<=10;
    if(currentFilter==="europe") return d.re==="Europe";
    if(currentFilter==="asia") return d.re==="Asia";
    if(currentFilter==="americas") return d.re==="Americas";
    if(currentFilter==="africa") return d.re==="Africa";
    if(currentFilter==="oceania") return d.re==="Oceania";
    return true;
  });
  // Sort
  filtered.sort(function(a,b){
    var v=0;
    if(currentSort==="rank") v=a.r-b.r;
    else if(currentSort==="name") v=a.n.localeCompare(b.n);
    else if(currentSort==="score") v=b.s-a.s;
    else if(currentSort==="tier") v=b.s-a.s;
    return v*sortDir;
  });
  var html="";
  filtered.forEach(function(d,i){
    var t=getTier(d.s);
    var pct=Math.round((d.s/MAX)*100);
    var bc=getBarColor(d.s);
    var rc="pr-rank";
    if(d.r<=3) rc+=" top3 r"+d.r;
    var sel=compareList.indexOf(d.n)!==-1?" compare-selected":"";
    var photoLink=d.g!=="/guides/"?'<a href="'+d.g+'" class="pr-photo-link" onclick="event.stopPropagation()">📸 Photo Guide</a>':"";
    html+='<tr data-idx="'+i+'" data-name="'+d.n+'" class="'+sel+'" style="animation-delay:'+(i*0.02)+'s">';
    html+='<td class="'+rc+'">'+d.r+'</td>';
    html+='<td><div class="pr-country"><span class="pr-flag">'+d.f+'</span><div><div class="pr-country-name">'+d.n+'</div><div class="pr-country-region">'+d.re+'</div></div></div></td>';
    html+='<td class="pr-score-cell"><div class="pr-score-bar-wrap"><div class="pr-score-bar-bg"><div class="pr-score-bar" style="width:'+pct+'%;background:'+bc+'"></div></div><span class="pr-score-num" style="color:'+bc+'">'+d.s+'</span></div></td>';
    html+='<td><span class="pr-tier '+t.c+'">'+t.l+'</span></td>';
    html+='<td>'+photoLink+'</td>';
    html+='</tr>';
  });
  body.innerHTML=html;
  noRes.style.display=filtered.length===0?"block":"none";
  // Row click
  body.querySelectorAll("tr").forEach(function(tr){
    tr.addEventListener("click",function(){
      var name=tr.dataset.name;
      if(compareMode){
        toggleCompare(name);
      } else {
        openDetail(name);
      }
    });
  });
}

// Detail panel
function openDetail(name){
  var d=DATA.find(function(x){return x.n===name;});
  if(!d) return;
  var t=getTier(d.s);
  var pct=Math.round((d.s/MAX)*100);
  var bc=getBarColor(d.s);
  var visaRequired=MAX-d.s;
  var rank=d.r;
  var guideLink=d.g!=="/guides/"?'<a href="'+d.g+'" class="pr-detail-cta">📸 Get '+d.n+' Passport Photo</a>':'<a href="/passport-photo-maker/" class="pr-detail-cta">📸 Create Passport Photo</a>';

  var html='<div class="pr-detail-hero">';
  html+='<div class="flag">'+d.f+'</div>';
  html+='<div class="name">'+d.n+'</div>';
  html+='<div class="rank-badge" style="background:'+bc+'20;color:'+bc+'">Rank #'+rank+' · '+t.l+'</div>';
  html+='</div>';
  html+='<div class="pr-detail-stats">';
  html+='<div class="pr-detail-stat"><div class="num" style="color:'+bc+'">'+d.s+'</div><div class="label">Visa-Free</div></div>';
  html+='<div class="pr-detail-stat"><div class="num">'+visaRequired+'</div><div class="label">Visa Required</div></div>';
  html+='<div class="pr-detail-stat"><div class="num">#'+rank+'</div><div class="label">Global Rank</div></div>';
  html+='</div>';
  html+='<div class="pr-detail-section">';
  html+='<h4>Global Mobility Score</h4>';
  html+='<div class="pr-detail-meter"><div class="fill" style="width:0%;background:'+bc+'"></div></div>';
  html+='<div class="pr-detail-meter-labels"><span>0</span><span>'+MAX+' destinations</span></div>';
  html+='</div>';
  html+='<div class="pr-detail-section">';
  html+='<h4>Quick Facts</h4>';
  html+='<div style="display:flex;flex-direction:column;gap:10px;">';
  html+='<div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#64748b;">Region</span><span style="color:#e2e8f0;font-weight:600;">'+d.re+'</span></div>';
  html+='<div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#64748b;">Visa-Free Access</span><span style="color:'+bc+';font-weight:700;">'+d.s+' / '+MAX+'</span></div>';
  html+='<div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#64748b;">Mobility Percentile</span><span style="color:#e2e8f0;font-weight:600;">'+pct+'%</span></div>';
  html+='<div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#64748b;">Gap from #1</span><span style="color:#e2e8f0;font-weight:600;">'+(192-d.s)+' destinations</span></div>';
  html+='</div>';
  html+='</div>';
  html+=guideLink;

  document.getElementById("detailContent").innerHTML=html;
  document.getElementById("detailOverlay").classList.add("visible");
  document.getElementById("detailPanel").classList.add("visible");
  document.body.style.overflow="hidden";

  // Animate meter after panel opens
  setTimeout(function(){
    var fill=document.querySelector(".pr-detail-meter .fill");
    if(fill) fill.style.width=pct+"%";
  },100);
}

function closeDetail(){
  document.getElementById("detailOverlay").classList.remove("visible");
  document.getElementById("detailPanel").classList.remove("visible");
  document.body.style.overflow="";
}

// Compare
function toggleCompare(name){
  var idx=compareList.indexOf(name);
  if(idx!==-1){
    compareList.splice(idx,1);
  } else {
    if(compareList.length>=2) compareList.shift();
    compareList.push(name);
  }
  render();
  updateCompare();
}

function updateCompare(){
  var panel=document.getElementById("comparePanel");
  var body=document.getElementById("compareBody");
  if(compareList.length===0){
    panel.classList.remove("visible");
    body.innerHTML='<p style="color:#64748b;grid-column:1/-1;text-align:center;font-size:14px;">Click two countries in the table to compare them</p>';
    return;
  }
  panel.classList.add("visible");
  if(compareList.length===1){
    var c=DATA.find(function(x){return x.n===compareList[0];});
    body.innerHTML='<div style="grid-column:1/-1;text-align:center;"><span style="font-size:48px;">'+c.f+'</span><div style="font-size:18px;font-weight:700;color:#fff;margin-top:8px;">'+c.n+'</div><div style="font-size:14px;color:#64748b;margin-top:4px;">Select one more country to compare</div></div>';
    return;
  }
  var a=DATA.find(function(x){return x.n===compareList[0];});
  var b=DATA.find(function(x){return x.n===compareList[1];});
  var aPct=Math.round((a.s/MAX)*100);
  var bPct=Math.round((b.s/MAX)*100);
  var aColor=getBarColor(a.s);
  var bColor=getBarColor(b.s);
  var diff=Math.abs(a.s-b.s);
  var winner=a.s>=b.s?a.n:b.n;

  var html='<div class="pr-compare-country">';
  html+='<div class="flag">'+a.f+'</div>';
  html+='<div class="name">'+a.n+'</div>';
  html+='<div class="score" style="color:'+aColor+'">'+a.s+'</div>';
  html+='<div style="font-size:12px;color:#64748b;">Rank #'+a.r+'</div>';
  html+='</div>';
  html+='<div class="pr-compare-vs">VS</div>';
  html+='<div class="pr-compare-country">';
  html+='<div class="flag">'+b.f+'</div>';
  html+='<div class="name">'+b.n+'</div>';
  html+='<div class="score" style="color:'+bColor+'">'+b.s+'</div>';
  html+='<div style="font-size:12px;color:#64748b;">Rank #'+b.r+'</div>';
  html+='</div>';
  html+='<div style="grid-column:1/-1;text-align:center;margin-top:12px;">';
  html+='<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:8px;">';
  html+='<div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;"><div style="height:100%;width:'+aPct+'%;background:'+aColor+';border-radius:3px;transition:width .6s;"></div></div>';
  html+='<div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;"><div style="height:100%;width:'+bPct+'%;background:'+bColor+';border-radius:3px;transition:width .6s;"></div></div>';
  html+='</div>';
  html+='<div style="font-size:13px;color:#94a3b8;">'+winner+' has access to <span style="color:#fff;font-weight:700;">'+diff+'</span> more destinations</div>';
  html+='</div>';
  body.innerHTML=html;
}

// Event listeners
document.addEventListener("DOMContentLoaded",function(){
  // Search
  document.getElementById("searchInput").addEventListener("input",render);

  // Filter buttons
  document.querySelectorAll(".pr-filter-btn").forEach(function(btn){
    btn.addEventListener("click",function(){
      document.querySelectorAll(".pr-filter-btn").forEach(function(b){b.classList.remove("active");});
      btn.classList.add("active");
      currentFilter=btn.dataset.filter;
      render();
    });
  });

  // Sort headers
  document.querySelectorAll(".pr-table thead th[data-sort]").forEach(function(th){
    th.addEventListener("click",function(){
      var s=th.dataset.sort;
      if(currentSort===s){
        sortDir*=-1;
      } else {
        currentSort=s;
        sortDir=1;
      }
      // Update UI
      document.querySelectorAll(".pr-table thead th").forEach(function(h){
        h.classList.remove("sorted");
        var arrow=h.querySelector(".sort-arrow");
        if(arrow) arrow.textContent="↕";
      });
      th.classList.add("sorted");
      var arrow=th.querySelector(".sort-arrow");
      if(arrow) arrow.textContent=sortDir===1?"↑":"↓";
      render();
    });
  });

  // Compare toggle
  document.getElementById("compareToggle").addEventListener("click",function(){
    compareMode=!compareMode;
    this.classList.toggle("active",compareMode);
    this.textContent=compareMode?"✕ Exit Compare":"⚖️ Compare";
    if(!compareMode){
      compareList=[];
      updateCompare();
      render();
    }
  });

  // Detail close
  document.getElementById("detailClose").addEventListener("click",closeDetail);
  document.getElementById("detailOverlay").addEventListener("click",closeDetail);

  // Compare close
  document.getElementById("compareClose").addEventListener("click",function(){
    compareList=[];
    compareMode=false;
    document.getElementById("compareToggle").classList.remove("active");
    document.getElementById("compareToggle").textContent="⚖️ Compare";
    updateCompare();
    render();
  });

  // Escape key
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"){
      closeDetail();
      if(compareMode){
        compareList=[];
        compareMode=false;
        document.getElementById("compareToggle").classList.remove("active");
        document.getElementById("compareToggle").textContent="⚖️ Compare";
        updateCompare();
        render();
      }
    }
  });

  // Scroll to top
  var scrollBtn=document.getElementById("scrollTop");
  window.addEventListener("scroll",function(){
    if(window.scrollY>600){
      scrollBtn.classList.add("visible");
    } else {
      scrollBtn.classList.remove("visible");
    }
  });
  scrollBtn.addEventListener("click",function(){
    window.scrollTo({top:0,behavior:"smooth"});
  });

  // Init
  animateCounters();
  render();
});
