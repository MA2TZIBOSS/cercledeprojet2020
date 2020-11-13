var div = document.createElement('div');  
    div.className = 'fb-customerchat';  
    div.setAttribute('page_id', '101958648400191');  
    div.setAttribute('ref', '');  
document.body.appendChild(div);  
window.fbMessengerPlugins = window.fbMessengerPlugins || {    
    init: function () {
        FB.init({        
            appId            : '1678638095724206',        
            autoLogAppEvents : true,        
            xfbml            : true,        
            version          : 'v8.0'      
        });    
    }, 
callable: []  };  
window.fbAsyncInit = window.fbAsyncInit || function () {    
    window.fbMessengerPlugins.callable.forEach(function (item) { 
        item(); 
    });    
    window.fbMessengerPlugins.init();  
};  
setTimeout(function () {    
    (function (d, s, id) {      
        var js, fjs = d.getElementsByTagName(s)[0];      
        if (d.getElementById(id)) { return; }      
        js = d.createElement(s);      
        js.id = id;      
        js.src = "//connect.facebook.net/en_US/sdk/xfbml.customerchat.js";      
        fjs.parentNode.insertBefore(js, fjs);    
    }(document, 'script', 'facebook-jssdk'));  
}, 0);



var nyan = document.getElementById('nyan');
var nyanBtn = document.getElementById('nyan-btn');

function playPause(song){
    if (song.paused && song.currentTime >= 0 && !song.ended) {
        song.play();
    } else {
        song.pause();
    }
}

function reset(btn, song){
    if(btn.classList.contains('playing')){
        btn.classList.toggle('playing');
    }
    song.pause();
    song.currentTime = 0;
}

function progress(btn, song){
    setTimeout(function(){
        var end = song.duration;
        var current = song.currentTime;
        var percent = current/(end/100);
        //check if song is at the end
        if(current===end){
            reset(btn, song);
        }
        //set inset box shadow
        //btn.style.boxShadow = "inset " + btn.offsetWidth * (percent/100) + "px 0px 0px 0px rgba(0,0,0,0.125)"
        //call function again
        progress(btn, song);
    }, 1000);
}

nyanBtn.addEventListener('click', function(){
    nyanBtn.classList.toggle('playing');
    playPause(nyan);
    progress(nyanBtn, nyan);
});