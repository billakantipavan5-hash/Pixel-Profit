// =============================
// USER ID SYSTEM
// =============================

let userId = localStorage.getItem("userId");

if(!userId){

userId = "USER-" + Math.floor(Math.random()*1000000);

localStorage.setItem("userId",userId);

}

document.querySelectorAll("#userId").forEach(el=>el.innerText=userId);


// =============================
// POINTS SYSTEM
// =============================

let points = localStorage.getItem("points") || 0;

document.querySelectorAll("#points").forEach(el=>el.innerText=points);




let smartlink = "https://www.effectivegatecpm.com/hz8dfnf6?key=6142c652c882f8f5706a632f5ddc427f";


// =============================
// WATCH AD SYSTEM
// =============================

let watchBtn = document.getElementById("watchAd");

watchBtn?.addEventListener("click",function(){

watchBtn.disabled=true;

// OPEN SMARTLINK
window.open(smartlink,"_blank");

let time = 30;

let timerBox = document.getElementById("timer");

timerBox.innerText = "Ad running... wait " + time + " seconds";

let interval = setInterval(()=>{

time--;

timerBox.innerText = "Ad running... wait " + time + " seconds";

if(time<=0){

clearInterval(interval);

points = parseInt(points)+10;

localStorage.setItem("points",points);

document.querySelectorAll("#points").forEach(el=>el.innerText=points);

updateProgress();

confetti();

timerBox.innerText="Reward added +10";

watchBtn.disabled=false;

}

},1000);

});


// =============================
// DAILY BONUS SYSTEM
// =============================

document.getElementById("dailyBonus")?.addEventListener("click",function(){

// OPEN SMARTLINK
window.open(smartlink,"_blank");

let today = new Date().toDateString();

let last = localStorage.getItem("bonusDate");

if(last === today){

alert("Bonus already claimed today");

return;

}

points = parseInt(points)+20;

localStorage.setItem("points",points);

localStorage.setItem("bonusDate",today);

document.querySelectorAll("#points").forEach(el=>el.innerText=points);

updateProgress();

confetti();

});


// =============================
// EXIT INTENT SMARTLINK
// =============================

document.addEventListener("mouseleave",function(e){

if(e.clientY < 10){

window.open(smartlink,"_blank");

}

});


// =============================
// PROGRESS BAR
// =============================

function updateProgress(){

let progress = Math.min(points/1000*100,100);

let bar = document.getElementById("progressBar");

if(bar){

bar.style.width = progress + "%";

}

}

updateProgress();


// =============================
// WHATSAPP WITHDRAW
// =============================

function withdraw(){

let msg = `Hello,

Withdrawal Request

User ID : ${userId}

Points : ${points}

Enter Bank Account  No:

IFSC CODE:

Please process my withdrawal request.`;

window.open("https://wa.me/91XXXXXXXXXX?text="+encodeURIComponent(msg));

}


// =============================
// CONFETTI
// =============================

function confetti(){

let c = document.createElement("div");

c.innerHTML="🎉";

c.style.position="fixed";

c.style.top="50%";

c.style.left="50%";

c.style.fontSize="50px";

document.body.appendChild(c);

setTimeout(()=>c.remove(),1000);

}

let wheel = document.getElementById("wheel")
let coinsDisplay = document.getElementById("coins")

// rewards
let rewards = [10,20,30,50,70,100]

// load coins from localStorage
let coins = localStorage.getItem("coins")

if(coins == null){
coins = 0
}else{
coins = parseInt(coins)
}

coinsDisplay.innerText = "Coins: " + coins

let spinning = false

function spin(){

if(spinning) return

spinning = true

let rand = Math.floor(Math.random()*6)

let reward = rewards[rand]

// rotate wheel
let degree = 3600 + (rand * 60)

wheel.style.transform = "rotate(" + degree + "deg)"

setTimeout(()=>{

coins += reward

coinsDisplay.innerText = "Coins: " + coins

localStorage.setItem("coins", coins)

alert("You won " + reward + " coins!")

spinning = false

},4000)

}