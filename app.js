    window.onload = function () {
        
    // head
    var robothead = new Image() ;
    var robotheadnum=Math.floor (Math.random()*10)+1; // update to number of variations 
    var robotheadname="head" + robotheadnum +".png";
    robothead.src="./parts/head/" + robotheadname;

    // var robothead = new Image() ;
    // robothead.src="./parts/head8.png"; //base head
    
    // Head selection
    var head1 = document.getElementsByClassName("head-artwork");
    for (var i = 0; i < head1.length; i++) {
        head1[i].onclick = changeImgSrc;
    }
    function changeImgSrc() {
        robothead.src=this.src
    }

    // body
    var robotbody = new Image() ;
    var robotbodynum=Math.floor (Math.random()*12)+1; // update to number of variations 
    var robotbodyname="body" + robotbodynum +".png";
    robotbody.src="./parts/body/" + robotbodyname;

        // Legs
    var robotlegs = new Image() ;
    var robotlegsnum=Math.floor (Math.random()*12)+1; // update to number of variations 
    var robotlegsname="legs" + robotlegsnum +".png";
    robotlegs.src="./parts/leg/" + robotlegsname;
        
    // Wait until body part is loaded and then call the function that displays all the images

    // Head loaded
    robothead.onload=function()
    {
        buildrobot();
    }

    // body loaded
    robotbody.onload=function()
    {
        buildrobot();
    }

    // legs loaded
        robotlegs.onload=function()
    {
        buildrobot();
    }
    
    function buildrobot() {
        // Draw the canvas
        var canvas=document.getElementById('canvas');
        var ctx = canvas.getContext ('2d');
        canvas.width=1000;
        canvas.height=1000;

        // ADD RANDOM BACKGROUND COLOUR
        var r=Math.floor(Math.random()*(255-100+1)+100);
        var g=Math.floor(Math.random()*(255-100+1)+100);
        var b=Math.floor(Math.random()*(255-100+1)+100);
        var bgcol = "#" + r.toString(16) + g.toString(16) + b.toString(16);
        ctx.fillStyle = bgcol;
        ctx.fillRect(0,0,canvas.width,canvas.height);

        
        // think of order at this part, this is the list of all parts and where they should go (centered and height)              
        // Draw Legs (first)
        ctx.drawImage (robotlegs, ( (1000-robotlegs.width)/2), 0) ;
        // Draw Body (second)
        ctx.drawImage (robotbody, ( (1000-robotbody.width)/2), 0) ;
        // Draw Head (third)
        ctx.drawImage (robothead, ( (1000-robothead.width)/2), 0) ;
    }
}

// download canvas element as image
var download_image = function(){
    var link = document.createElement('a');
    link.download = 'loogmoji3d.png';
    link.href = document.getElementById('canvas').toDataURL()
    link.click();
}