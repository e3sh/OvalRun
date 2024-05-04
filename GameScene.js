//----------------------------------------------------------------------
//Scene
//----------------------------------------------------------------------
// GameMain
function SceneGame(){

	const RESO_X = 1600;
	const RESO_Y = 960;

	let GObj;
	let spriteTable;
	let result;
	let delay;
	let trig_wait;
	let stagetime;
	let myship;

	let blkcnt;

	let ene;
	let watchdog;

	let stageCtrl;

	let note;

	let laplist;

	const submapImage = new OffscreenCanvas( 1600, 960 );
	const submapctx = submapImage.getContext("2d");

	function step_running_check(){
		let stepc;
		let store;

		this.run = function(){
			stepc++;
		}
		this.set = function(){
			store = 0; 
			stepc = 0;
		}
		this.check = function(){
			return (stepc != store);
		}
	}

	this.state = function() {

		return {
			ene: ene
			,result: result
			,time: stagetime
			,stage: result.stage
			,score: result.score
			,delay: delay
			,block: blkcnt
			,collision: 0
			,sprite: spriteTable.length
			,clear: result.clrf
			,gameover: result.govf
			,dead: result.dedf
			,status: myship.status()
			,laplist: laplist
		};
	}

	this.init = function(g){
		watchdog = new step_running_check();

		GObj = [];

		stageCtrl = new StageControl(g);
		stageCtrl.init();

		spriteTable = g.sprite.itemList();

		// pSG setup
		note = [];
		//@0 square wave/lfo off
		g.beep.oscSetup(1);
		g.beep.lfoReset();
		note[0] = g.beep.createNote(1);

		//@1 sin wave/lfo 10hz, sine, depth50/ move 
		g.beep.oscSetup(0);//square wave/lfo off
		g.beep.lfoSetup(10,0,50);
		note[1] = g.beep.createNote(1);

		//@2 square wave/lfo 24, triangle, depth20 /crash
		g.beep.oscSetup(1);//square wave/lfo off
		g.beep.lfoSetup(24,3,20);
		note[2] = g.beep.createNote(1);

		//beep note running start
		for (let n of note) n.on(0);
		/*
		score =["C6","C5"];
		s = g.beep.makeScore(score, 50, 0);
		note.play(s, g.time());
		*/
		this.reset(g);
	}

	this.reset = function(g){
		stageCtrl.init();

		GObj = [];
		g.sprite.itemFlash();

		myship = new GameObjectPlayer(g);//GameObject();
		myship.spriteItem = g.sprite.itemCreate("Player", true, 28, 28);
		myship.spriteItem.pos(640,180);
		myship.init(g);
		myship.setNote(note[1]);
		
		//score =["G4","E4","E4","F5","D4","D4"];
		//s = g.beep.makeScore(score, 250, 1);
		//note[1].play(s, g.time());

		//note[1].changeFreq(440);
        //note[1].changeVol(1);

		GObj.push(myship);
		stageCtrl.change(1, GObj);

		for (let i in this.spriteTable){
			spriteTable[i].visible = false;
		}

		ene = {now:3,max:3,before: this.now};
		result = {score:0, time:g.time(), stage:1, clrf:false, govf:false, dedf:false };

		delay = 0;
		trig_wait = 0;

		//回転有効
		g.screen[0].buffer._2DEF(true);
		g.screen[0].buffer.turn(0);
	}
	//=====
	// Step
	this.step = function(g, input, param){
		stagetime = Math.trunc((g.time() - result.time)/100);
		//ここでviewportの基準座標を変える事でスクロールを実現している。↓
		//g.viewport.setPos(Math.trunc(320-myship.spriteItem.x), Math.trunc(240-myship.spriteItem.y));
		g.viewport.setPos(Math.trunc(320-myship.x), Math.trunc(240-myship.y));

		//g.screen[0].buffer.turn(myship.r);

		laplist = [];
		for (let o of GObj){
			o.step(g, input, result);

			if (o.spriteItem.living){
				if (Boolean(o.LAP)){
					let n = o.LAP();
					laplist.push(n);
				}				
			}
		}

		if (delay < g.time()) {

			delay = g.time()+500;
			//spriteTable = flashsp(spriteTable);

			ene.before = ene.now;
			//result.clrf = false; 

			g.sprite.itemIndexRefresh();

			let ec = 0;
			let spt = g.sprite.itemList();
			for (let o of spt) if (o.id == "Enemy") ec++;

			let cf = false;
			for(let n of laplist) if (n.count > 4) cf = true;
			if (cf){
				if (laplist[0].count > 4) {
					ec = 0; //Clear
				}else{
					ene.now = 0;// GameOver
				}
			}  

			if (!myship.spriteItem.living){//dead
				if (!result.dedf){
					ene.now--;
					result.dedf = true;
					delay = g.time()+1500; //recovery wait delay
				}else{
					if (ene.now >0){
						myship.spriteItem = g.sprite.itemCreate("Player", true, 24, 24);
						myship.spriteItem.pos(640,180);

						myship.x = 640; myship.y = 180;
						myship.vx = 0;
						myship.vy = 0;
						myship.old_x = 640;
						myship.old_y = 180;
						myship.r = 0;

						let score = ["G4","C5","E4","C4","A3"];
						let s = g.beep.makeScore(score, 100, 1);
						note[0].play(s, g.time());
					}
					result.dedf = false;

					let spt = g.sprite.itemList();
					for (let o of spt){
						if (o.id.substring(0,8) == "Enemy") o.dispose();
					}
					stageCtrl.change(result.stage, GObj);

				}
			}

			if (result.score > (ene.max-2)*5000){//extend
				//extend message
				const msg = g.sprite.itemCreate("BULLET_P", false, 1, 1);
				msg.priority = 5;
				msg.normalDrawEnable = false;
				msg.customDraw = function(g, screen){
					let r = g.viewport.viewtoReal(this.x-28, this.y);
					let x = Math.trunc(r.x);
					let y = Math.trunc(r.y);
					screen.fill(x,y,48,8,"Black");
					g.font["std"].putchr("Extend.", x, y); 
				};
				msg.pos(myship.x, myship.y);
				msg.move(0, 1, 45);

				ene.now++; 
				ene.max++;

				let score = ["G5","C6","E6","C6","D6","G6"];
				let s = g.beep.makeScore(score, 100, 1);
				note[0].play(s, g.time());
			}

			if (ec == 0){ //(blkcnt <=0){ //Stage Clear;
				if (result.clrf){

					//TimeBonus
					//let b = (10000-(g.time()-result.time));
					//result.score += (b < 0)?100: b+100;//SCORE
					result.time = g.time();
					result.stage ++;

					//GObj = [];
					//GObj.push(myship);
					let nextGo = [];
					//nextGo.push(myship); 
					for (let i in GObj){
						if (GObj[i].spriteItem.living){
							if (GObj[i].spriteItem.id == "Enemy"){
								GObj[i].ResetLAP();
							}
							nextGo.push(GObj[i]);
						}
					}
					GObj = nextGo;
					/*
					myship.spriteItem.pos(640,180);

					myship.x = 640; myship.y = 180;
					myship.vx = 0;
					myship.vy = 0;
					myship.old_x = 640;
					myship.old_y = 180;
					myship.r = 0;
					*/
					myship.ResetLAP();

					stageCtrl.change(result.stage, GObj);

					//自爆破片の残骸が消えたまま残る問題の解消
					let spt = g.sprite.itemList();
					for (let o of spt){
						if (o.id.substring(0,8) == "BULLET_P") o.dispose();
						if (o.id.substring(0,8) == "BULLET_E") o.dispose();	
					}
					//ene.now = (ene.now +30>ene.max)?ene.max:ene.now +30;//ENERGY
				}else{
					result.clrf = true; 
					delay = g.time()+3000;//MESSAGE WAIT

					let score =["G4","C5","E5","G5","G5"];
					let s = g.beep.makeScore(score, 100, 1);
					note[0].play(s, g.time());
				}
			}else{
				result.clrf = false; 
			}

			if (ene.now <=0){ //Game Over;
			//if (!myship.spriteItem.living){
				//myship.spriteItem.dispose();

				delay = g.time()+3000;//MESSAGE WAIT
				ene.now = 0;
				result.govf = true; 

				let score =["F4","E4","D4","C4","B3","B#3","C4"];
				let s = g.beep.makeScore(score, 150, 1);
				note[0].play(s, g.time());

				//g.screen[0].buffer.turn(0);
			}
		}



		submapctx.clearRect(0,0,submapImage.width, submapImage.height);
		drawsubmapBG(submapctx);

		g.sprite.CollisionCheck(); 
		spriteTable = g.sprite.itemList();

		for (let i in spriteTable){
			//step any gobject
			//当たり判定処理
			//SpriteListからチェックする対象を引いて
			//当たり判定のチェック結果処理を行う
			//行う対象は玉以外のPlayer/Enemy/Friend/Armor（当たり判定に回転入れないと本当はダメだが手抜きする）

			let sp = spriteTable[i];
			if (!sp.living) continue;
			if (!sp.collisionEnable) continue;
			if (!sp.visible) continue;

			if (sp.id == "Player"){

				//for (let i=0; i<=0; i++){
				//let c = g.sprite.check(i);//対象のSpriteに衝突しているSpriteNoを返す
				let c = sp.hit;//戻りは衝突オブジェクトのリスト
				for (let lp in c) {
					let spitem = c[lp];//SpNo指定の場合は、SpriteItem
					if (!spitem.visible) continue;

					if (spitem.id == "Enemy"){
						//spitem.vx = spitem.x - myship.x//vx*-1;//.05;
						//spitem.vy = spitem.y - myship.y//spitem.vy*-1;//.05;
	//					console.log("h" + spitem.id);
						sp.dispose();
						spitem.dispose();
						
						score =["E4","D4","C4","B3"];
						s = g.beep.makeScore(score, 50, 1);
						note[2].play(s, g.time());

					}
				
					if (sp.id == "Player" && spitem.id == "POWERUP"){
						if (spitem.mode > 0){
							if (!Boolean(sp.mode)){
								sp.mode = Math.pow(2,(spitem.mode-1));
							}else{
								if (isNaN(sp.mode)){
									sp.mode += Math.pow(2,(spitem.mode-1));
								}else{
									sp.mode = Math.pow(2,(spitem.mode-1));
								}
							}
						}
						result.score += ((spitem.mode ==0)?300:0);
						spitem.dispose();

						score =["C6","C5"];
						s = g.beep.makeScore(score, 50, 1);
						note[0].play(s, g.time());
					}
				}

				submapctx.beginPath();
				submapctx.fillStyle = "yellow";
				let ms = (Math.trunc(g.time()/250)%2 ==0)?2:1;
				submapctx.fillRect(Math.trunc(sp.x/10)-ms,Math.trunc(sp.y/10)-ms,ms+3,ms+3);
			}
			if (sp.id == "Enemy"){
				let c = sp.hit;
				for (let lp in c) {
					let spitem = c[lp];//SpNo指定の場合は、SpriteItem
					if (!spitem.visible) continue;

					if (spitem.id.substring(0,8) == "BULLET_P"){//Player"){
						//spitem.vx = spitem.x - myship.x//vx*-1;//.05;
						//spitem.vy = spitem.y - myship.y//spitem.vy*-1;//.05;
	//					console.log("h" + spitem.id);
						let powup = new GameObj_GradeUpItem();
						powup.spriteItem = g.sprite.itemCreate("POWERUP", false, 28, 16);
						powup.spriteItem.pos(sp.x,sp.y,0, 0.5);
						powup.init(g);
				
						GObj.push(powup);
						sp.dispose();
						spitem.dispose();
						result.score +=10;

						score =["A3","A2"];
						s = g.beep.makeScore(score, 50, 1);
						note[2].play(s, g.time());

						break;//複数弾同時弾着でパワーアップが複数出てしまうので１回出たらLOOPをBreak;
					}
				}
				submapctx.beginPath();
				submapctx.fillStyle = "red";
				submapctx.fillRect(Math.trunc(sp.x/10)-1,Math.trunc(sp.y/10)-1,3,3);
			}
		}
		//spriteTable = 
		flashsp(g.sprite.itemList());
		function flashsp(s){
			//let ar = new Array(0);
			for (let i in s){
				let p = s[i];
				if ((p.x < 0)||(p.x > RESO_X)||(p.y < 0)||(p.y>RESO_Y)) {//p.visible = false;

					
					if ((p.x < 0)||(p.x > RESO_X)) p.dispose();//p.vx *=-1;//.05;
					if ((p.y < 0)||(p.y > RESO_Y)) p.dispose();//p.vy *=-1.05;
					
					/*
					if (p.x < 0) p.x = RESO_X;
					if (p.x > RESO_X) p.x = 0;
					if (p.y < 0) p.y = RESO_Y;
					if (p.y > RESO_Y) p.y = 0;
					*/
				}
				//if (p.visible) ar.push(s[i]);
			}
			//return ar;
		}
		//spriteTable = g.sprite.itemList();
		//---------------------breakcheck(block sprite hit check

		stageCtrl.step(g, input, result);

		watchdog.run();
	}

	//==========
	//Draw 
	this.draw = function(g){

		let wdt = watchdog.check();

		stageCtrl.draw(g);

		const vp = g.viewport.viewtoReal;
		//　FIRE DRAW 
		if (true){
			let p = g.sprite.itemList();
			for (let i in p){
				if (p[i].id.substring(0,6) == "BULLET"){

					let r = vp(p[i].x, p[i].y);
					let x = r.x;
					let y = r.y;
					if (r.in){
						g.screen[0].fill(
							x - p[i].collision.w/2
							, y - p[i].collision.h/2 
							, p[i].collision.w
							, p[i].collision.h
							,"BROWN"
						);
					}
				}
			}
		}

		//stageCtrl.draw(g);

		if (!result.govf){

			for (let o of GObj){
				o.draw(g);
			}
		}

		g.screen[1].putImage(submapImage, 640-160, 480-150);
		/*		
		//　DEBUG DRAW 
		if (true){
		let p = g.sprite.itemList();
		for (let i in p){
				if (false){
					g.screen[0].fill(
						p[i].x - p[i].collision.w/2
						, p[i].y - p[i].collision.h/2 
						, p[i].collision.w
						, p[i].collision.h
						,"green"
					);
				}
				g.font["std"].putchr(p[i].id,p[i].x, p[i].y);
				let st = ((p[i].living)?"L":"-") 
				if (p[i].visible) st += " A:" + p[i].alive;

				g.font["std"].putchr(st,p[i].x, p[i].y+8);
			}
		}
		*/
		watchdog.set();
	}

	function drawsubmapBG(dev){

		dev.beginPath();
		dev.globalAlpha = 1.0;
		dev.strokeStyle = "gray";
		dev.lineWidth = 12;
		dev.arc(160-48, 48, 30, 0.5 * Math.PI, 1.5 * Math.PI, true);
		dev.arc(48, 48, 30, 1.5 * Math.PI, 0.5 * Math.PI, true);
		dev.moveTo(160-48,78);
		dev.lineTo(48,78);
	
		dev.stroke();
	
	}
}