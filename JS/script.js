//sukuriamas kintamasis spalva ir nustatoma spalva
var spalva = '#0095DD';
//funkcija keicianti spalva paspaudus ant mygtuko
function ColorChanger() {
    spalva = 'red';
}
//funkcija keicianti spalva paspaudus ant mygtuko
function ColorChange() {
    spalva = 'green';
}
//sukuriamas kintamasis shape, kuriam priskiriama forma rutulio
var shape = 'circle';
//funckija kuri pakeicia forma i staciakampi paspaudus ant mygtuko
function ShapeChange() {
    shape = 'rect';

}

//context yra reikalingas tam , kad ant kazko galima butu piesti
//paimama su id drobe ant kurios bus piesiami elementai-sukuriama drobe
var canvas = document.getElementById("myCanvas");
//ctx kintamojo sukūrimas 2D atvaizdavimo kontekstui išsaugoti - faktinis įrankis, kuriuo galime paveikti ant drobės.
var ctx = canvas.getContext("2d");
// kamuolio diametras-spindulys  
var ballRadius = 15;
//dynamic drobes plotis padalintas is 2, gaunama puse plocio drobes, reikalinga kad centruotu rutuliuka ir surast centra drobes
var x = canvas.width / 2;
//dynamic canvas height 
var y = canvas.height - 30;
//pridedama vertę x ir y kad būtų rodomas kamuolys judantis ir nustatoma random
var dx = Math.random() * 2;
var dy = -(Math.random() * 2);
//irklo aukstis, reikalingas irklas, kad pasiekti kamuolį
var paddleHeight = 20;
//tada nustatomas plotis irklo
var paddleWidth = 85;
var paddleX = (canvas.width - paddleWidth) / 2; // kad gauti pozicija x reikia drobes ploti atimti is irklo plocio ir padalint is 2
//du kintamieji, skirti saugoti informaciją apie tai, ar paspaudžiamas kairysis ar dešinysis valdymo mygtukas klaviaturoje, nustatoma false, nes dar nespaudziamas
var rightPressed = false;
var leftPressed = false;
//eiluciu kiekis plytu
var brickRowCount = 5;
//stulpeliu kiekis  plytu
var brickColumnCount = 3;
//plytu plotis tarp kitu plytu
var brickWidth = 75;
//plytu aukstis tarp kitu plytu
var brickHeight = 20;
//plytu tarpas vienas nuo kito 
var brickPadding = 10;
//tarpas nuo virsaus elementu, kad jie nepaliestų vienas kito ir viršutinio bei kairiojo poslinkio, kad jie nebutu ant krašto drobės
var brickOffsetTop = 30;
//plytu pastumimas i kaire
var brickOffsetLeft = 30;
// priskiriamas kintamasis taskai, skaiciuojama bus nuo nulio
var score = 0;
// suteikiamos gyvybes zaidime
var lives = 3;

//plytos yra virsuje, nes esantis kodas kils per eilutes ir stulpelius ir sukurs naujas plytas, plytų objektai vėliau naudojami susidūrimo nustatymo tikslais.
//plytos laikomos dvimateje matricoje, stulpeliai- c kur yra plytos, r -eilutes turi objekta kuriame yra x ir y padetis, dazys kiekviena plyta ekrane
// kad atsikratyti plytu kuriuos jau prileteme, reikia prideti papildomą parametrą, nurodant ar norime dažyti kiekvieną plytą ekrane, ar ne
// tai yra: reikia prideti status kiekvienam plytu objektui, kad jie dingtu kaip susiduria
var bricks = [];
for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) { //inicijuojame plytas ir pridedame status prie kiekvienos plytos objekto
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}
// du klausytojai keydown ir keyup kad galėtume valdyti irklo judėjimą, kai paspaudžiami mygtukai klaviaturoje
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
//judinant pele, juda irklas
document.addEventListener("mousemove", mouseMoveHandler, false);

//keydown -kai paspaudi klavisa
// funkcija kai mygtukai paspaudžiami, keyDownHandler()funkcija bus vykdoma. Tas pats ir antrame modelyje. 
//Abi funkcijos atlieka įvykį kaip parametrą, kurį nurodo e kintamasis.
function keyDownHandler(e) { // tai yra gebėjimas judėti irklu į kairę ir dešinę
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true; // jeigu paspaudziamas desinis klavisas tada true ir juda i desine irklas tas pats ir su kaire
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}
//keyup - tai kada atleidi klavisa
//Kai atleidžiamas klavisas, kintamasis nustatomas atgal false.
function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// funkcijoje kurioje judinama pele, pirmiausia nustatoma relativeX vertę, kuri yra lygi horizontaliajai pelės pozicijai( e.clientX), 
//atėmus atstumą tarp kairiojo drobės krašto ir kairiojo  srities krašto ( canvas.offsetLeft) - 
//tai lygi atstumui tarp drobės ir kairiojo krašto ir pelės žymeklio. Jei santykinė X rodyklės padėtis yra didesnė už nulį ir mažesnė už drobės plotį,
//rodyklė yra drobės ribose, o paddleXpadėtis, nustatoma iki relativeXvertės, atėmus pusę briaunos pločio. , kad judėjimas iš tikrųjų būtų santykinis su irklo viduriu.
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// susidūrimo aptikimo funkciją, kuri apjungia visas plytas ir palygina kiekvieną plytų padėtį su rutulio koordinatėmis
// nustatomas b kintamasis- objekto saugojimas kiekviename susidūrimo aptikimo cikle,
// kai atstumas tarp rutulio centro ir sienos krašto yra lygiai toks pat kaip rutulio spindulys, jis pakeis judėjimo kryptį.
function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) { // patikrinama, ar kamuolys susiduria su siena, ir tada atitinkamai pakeiciama judėjimo kryptis
        for (var r = 0; r < brickRowCount; r++) {
            var b = bricks[c][r];
            if (b.status == 1) {
                // Rutulio x padėtis yra didesnė už x plytų padėtį, rutulio x padėtis yra mažesnė nei x plytų padėtis ir jos plotis,
                //  rutulio y padėtis yra didesnė už plytų y padėtį,rutulio y padėtis yra didesnė už plytų y padėtį,
                // rutulio y padėtis yra mažesnė nei y plytų padėtis ir jo aukštis.
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    // jei plyta yra aktyvi (jos būsena-status 1), patikrinama ar įvyksta susidūrimas, jei ivyksta, nustatoma plytos status- 0 kad nebūtų dažoma ekrane. 
                    dy = -dy;
                    b.status = 0;
                    score++; // kiekvieną kartą susidurus kamuoliui su plyta būtų pridedamas taskas
                    if (score == brickRowCount * brickColumnCount) { // jei surinkti visi turimi taškai-sunaikinti visos plytos, tada pasirodo pranesimas, kad laimejai
                        alert("YOU WIN, CONGRATS!");
                        document.location.reload(); //tada perkraunamas puslapis
                    }
                }
            }
        }
    }
}

//funkcija piesianti rutuliuka
function drawBall() {
    ctx.beginPath(); //pradeda kelia
    if (shape == 'circle') { //jeigu vartotojas nieko nepasirenka tada bus rutulys
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    } else { //kitu atveju bus staciakampis, jeigu pasirenka vartotojas
        ctx.rect(x, y, 30, 30);
    }
    ctx.fillStyle = spalva;
    ctx.fill(); //nuspalvina
    ctx.closePath(); //baigia kelia
}
//funkcija kuri piesa irkla
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight); // irklo apatines parametrai, x, y, aukstis, plotis
    ctx.fillStyle = "#0095DD"; //duoda spalva irklui
    ctx.fill();
    ctx.closePath();
}

//funkcija, kad galėtu perjungti visas masyvo plytas ir atkreipti jas į ekraną
function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            // Patikrinimas kiekvienos plytos status verte prieš piešdami,jei status yra 1, tada nubrėžiama, bet jei 0, tada jis nukentėjo nuo kamuolio ir jo nesimatys ekrane.
            if (bricks[c][r].status == 1) {
                //nustato kiekvienos plytos padėtį x ir y ir piesia plytas ant drobės,kiekviena brickX pozicija parengta kaip brickWidth+ brickPadding, 
                //padauginta iš stulpelio numerio c, plius brickOffsetLeft, logika yra identiška, išskyrus tai, kad ji naudoja reikšmes eilutės numeris, r, brickHeight,
                // ir brickOffsetTop, dabar kiekviena plyta įdėta į teisingą vietą eilutėje ir stulpelyje.
                var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft; // priskiriamos brickX ir brickY reikšmės, kaip koordinatės, o ne (0,0), nustatyta kiekvienos plytos vieta x ir y padėtis
                var brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}
//funkcija piesianti taskus
function drawScore() {
    ctx.font = "16px Arial"; // srifto apibrezimas tekstas ir dydis
    ctx.fillStyle = "#0095DD"; //„FillStyle“ nuosavybė saugo spalvą ir naudojama uzpildyti spalva
    ctx.fillText("Score: " + score, 8, 20); // nustatydami šrifto spalvą, patalpinam teksta kuris butu ant drobes, 1 parametras yra tekstas, paskui score 
    //tai yra auksciau pateiktas kodas, rodo dabartini tasku skaiciu ir 2 paskutiniai parametrai rodo koordinates, kuriuose tekstas bus dedamas ant drobes

}
//funkcija kuri piesia-parodo kiek turiu gyvybiu
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}
//funkcija piesimas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // metodas kuris kas 10 milisekundžių išvalo drobe 
    // turi keturis parametrus: stačiakampio viršutinio kairiojo kampo x ir y koordinates ir apatinio dešiniojo kampo kampo x ir y koordinates, kamuolys nueina tada be takelio
    drawBricks(); //nupiesia elementus
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection(); //aktyvinti susidūrimo nustatymą
    // Kai atstumas tarp rutulio centro ir sienos krašto yra lygiai toks pat kaip rutulio spindulys, jis pakeis judėjimo kryptį išskyrus spindulį 
    //nuo vieno krašto pločio ir pridedant jį prie kito rutulys atsimuša nuo sienų.
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    // Yra keturios sienos,kad būtų atšoktas kamuolys,kiekviename rėme reikia patikrinti, ar kamuolys liečia viršutinį drobės kraštą,jei taip, pakeiciamas rutulio judėjimas, 
    //kad jis pradėtų judėti priešinga kryptimi ir liktų matomose ribose. 
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--; //su kiekvienu susidurimu atimama gyvybe
            if (!lives) { //jeigu neliko gyvybiu tada issaukiamas pranesimas kad pralaimejai
                alert("GAME OVER");
                //kai kamuolys patenka į apatinį ekrano kraštą, iš lives kintamojo atimame vieną gyvenimą
                //jei nėra likę gyvybių, žaidimas pralaimetas, jei liko gyvybių, tada rutulio ir pado padėtis iš naujo nustatoma kartu su rutulio judėjimu
                document.location.reload(); //is naujo perkrauna puslapi
            } else {
                x = canvas.width / 2; //jeigu nepralaimi piesia toliau ir toliau vyksta skaiciavimai 
                y = canvas.height - 30;
                dx = 3;
                dy = -3;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    //funkcijos viduje patikrinama, ar kairėje arba dešinėje žymeklio klavišai yra paspaudžiami, kai kiekvienas kadras yra atvaizduojamas
    //paspaudus kairįjį žymeklį, irklas perkelia 7 taškus į kairę, o jei paspaudžiamas teisingas žymeklis, irklas perkelia 7 taškus į dešinę
    // paddleXPozicija naudojama perkelti tarp 0 kairėje pusėje drobės ir canvas.width-paddleWidth dešinėje pusėje
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    // atnaujinama x ir y su kiekvienu zaidimo atnaujinimu ir su kintančiu dx ir dy ,todėl kamuolys bus nudažytas naujoje pozicijoje kiekviename atnaujinime
    x += dx;
    y += dy;
    //pasako narsyklei kad piestu
    requestAnimationFrame(draw);
}
//nupiesia viska
draw();