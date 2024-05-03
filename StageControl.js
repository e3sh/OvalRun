function StageControl(game){

	const ROW = 60;
	const COL = 80;

	const RESO_X = 1600;
	const RESO_Y = 960;

	let block;
	let blkcnt;
	let rank;

	const bgImage = new OffscreenCanvas( 1600, 960 );
	const bgCtx  = bgImage.getContext("2d");

	let g = game;

	this.init = function(){

		rank = 1;
		block = resetblock({on:false, break:false, hit:false, hp:5});

		const dev = bgCtx;

		const cpmap = mapImageCreate(dev);

		console.log(cpmap.length);

		g.CHECKPOINT_MAP = cpmap;
	}

	this.change = function(stage, GObj){

		rank = stage;

		for (let i=1; i<7; i++){
			let enemy = new GameObjectEnemy(g);
			enemy.spriteItem = g.sprite.itemCreate("Enemy", true, 28, 28);
			enemy.spriteItem.pos(800 - i * 32,100);
			enemy.init(8 + i*2 + rank, (15-i)/10, i);//maxspeed, accel, lane
			GObj.push(enemy);
		}

		/*
		if (rank >= 3){
			rn = Math.trunc(Math.random()*300);
			enemy = new GameObj_FlyCanon();
			enemy.spriteItem = g.sprite.itemCreate("Enemy", true, 28, 28);
			enemy.spriteItem.pos(320,30);
			enemy.spriteItem.move(180, 2, 1000);
			enemy.init(g,1000/d+rn,5*t);
			GObj.push(enemy);
		}
		if (rank >= 5){
			rn = Math.trunc(Math.random()*300);
			enemy = new GameObj_FlyCanon();
			enemy.spriteItem = g.sprite.itemCreate("Enemy", true, 28, 28);
			enemy.spriteItem.pos(320-t*160,30);
			enemy.init(g,1000/d+rn,(10/d)*-t);
			GObj.push(enemy);
		}
		if (rank >= 7){
			rn = Math.trunc(Math.random()*300);
			enemy = new GameObj_FlyCanon();
			enemy.spriteItem = g.sprite.itemCreate("Enemy", true, 28, 28);
			enemy.spriteItem.pos(320-t*280,30);
			enemy.spriteItem.move(180, 2, 1000);
			enemy.init(g,1000/d+rn,(10/d)*-t);
			GObj.push(enemy);

			rn = Math.trunc(Math.random()*300);
			enemy = new GameObj_FlyCanon();
			enemy.spriteItem = g.sprite.itemCreate("Enemy", true, 28, 28);
			enemy.spriteItem.pos(320+t*280,30);
			enemy.spriteItem.move(180, 2, 1000);
			enemy.init(g,1000/d+rn,(10/d)*t);
			GObj.push(enemy);
		}
		*/
	}

	function resetblock(sw){

		let blk = new Array(ROW);
		for (let j=0; j<ROW; j++){
			blk[j] = new Array(COL);
			for (let i=0; i<COL; i++){
				blk[j][i] = {}//new sw;
				blk[j][i].on = sw.on;
				blk[j][i].break = sw.break;
				blk[j][i].hit = sw.hit;
				blk[j][i].hp = sw.hp;
			}
		}
		return blk;
	}

	function setblock(x, y, w, h, sw){

		//let blk = new Array(ROW);
		for (let j=y; j<y+h; j++){
			//blk[j] = new Array(COL);
			for (let i=x; i<x+w; i++){
				//blk[j][i] = {}//new sw;
				block[j][i].on = sw.on;
				block[j][i].break = sw.break;
				block[j][i].hit = sw.hit;
				block[j][i].hp = sw.hp;
			}
		}
	}

	function mapping(mds){
		const W = Math.trunc(COL/6);
		const H = Math.trunc(ROW/5);

		let n = parseInt(mds, 16); 
		for (let j=0; j<5; j++){
			for (let i=0; i<6; i++){
				if ((n&1)!=0) {
					setblock(i*W, j*H, W, H,{on:true, break:false, hit:false, hp:1});
				}
				n = n>>1;
				//console.log(n);
			}
		}
	}

	this.step = function(g, input, result){

		let spriteTable = g.sprite.itemList();

		//---------------------breakcheck(block sprite hit check
		for (let i in spriteTable){
			let p = spriteTable[i];

			let sp = spriteTable[i];
			if (!sp.living) continue;
			if (!sp.collisionEnable) continue;
			if (!sp.visible) continue;

			let w = p.collision.w;
			let h = p.collision.h;
			for (let cx = Math.trunc((p.x-(w/2))/8); cx <= Math.trunc((p.x+(w/2))/8); cx++){
				for (let cy = Math.trunc((p.y-(h/2))/8); cy <= Math.trunc((p.y+(h/2))/8); cy++){
					//console.log("loop" + cx + "," + cy);
					mapCheck(p, cx,cy);
				}
			}
			
			if (p.id == "Player"){
				let imgd = bgCtx.getImageData(p.x - w/2, p.y - h/2, w ,h);
				c = 0;
				for (let i=1; i < imgd.data.length; i+=4){
					c += (imgd.data[i] != 0)?0:1;
				}
				if (c != 0 ) p.wall = true;

				//console.log(c);
			}
			
		}

		//---
		function mapCheck(p, cx, cy){
			return;
			if (cy>=0 && cy < block.length){
				if (cx>=0 && cx < block[cy].length){
					if (block[cy][cx].on){
						if (p.id.substring(0,8) == "BULLET_P"){
							block[cy][cx].hp--;
							if (block[cy][cx].hp < 0){
								block[cy][cx].on = false;
								block[cy][cx].break = true;
								block[cy][cx].hit = false;//true;
							}
							if (p.id != "BULLET_P2") p.dispose();
							result.score ++;
						}
						/*
						if (p.id == "BULLET_P2"){
							block[cy][cx].hp--;
							if (block[cy][cx].hp < 0){
								block[cy][cx].on = false;
								block[cy][cx].break = true;
								block[cy][cx].hit = false;//true;
							}
							//p.dispose();
							result.score ++;
						}
						*/
						if (p.id == "BULLET_E"){
							block[cy][cx].hp--;
							if (block[cy][cx].hp < 0){
								block[cy][cx].on = false;
								block[cy][cx].break = true;
								block[cy][cx].hit = false;//true;
							}
							p.dispose();
						}
						if (p.id == "Player"){
							p.wall = true;
							block[cy][cx].on = false;
							block[cy][cx].break = true;
							block[cy][cx].hit = true;
						}
						//console.log("cx,cy" + cx + "," + cy);
						if (p.id == "ARMOR_P"){
							p.wall = true;
						}
						if (p.id == "Enemy"){
							p.wall = true;
						}
					}
					if (block[cy][cx].hit){
						if (p.id == "Player"){
							p.slow = true;
						}
						if (p.id == "Enemy"){
							p.slow = true;
						}
					}
				}
			}
		}
	}

	this.mapDamage = function(sp){
		return;
		let p = sp;
		let w = p.collision.w;
		let h = p.collision.h;
		for (let cx = Math.trunc((p.x-(w/2))/8); cx <= Math.trunc((p.x+(w/2))/8); cx++){
			for (let cy = Math.trunc((p.y-(h/2))/8); cy <= Math.trunc((p.y+(h/2))/8); cy++){
				//console.log("loop" + cx + "," + cy);
				if ((cx>=0 && cx<COL) && (cy>=0 && cy<ROW)){
					block[cy][cx].hit = true;
				}
			}
		}
	}

	this.draw = function(g){

		const vp = g.viewport.viewtoReal;
		
		let l = (Math.trunc(g.time()/250)%2);

		let r = vp(0,0);
		//g.screen[0].fill(r.x, r.y, RESO_X, RESO_Y, "darkslategray");
		g.screen[0].putImage(bgImage, r.x, r.y);

		blkcnt = 0;
		for (let j=0; j<ROW; j++){
			for (let i=0; i<COL; i++){
				if (block[j][i].on){
					let r = vp(i*8,j*8);
					let x = r.x;
					let y = r.y;
					if (r.in){
						if (block[j][i].hp != 0){
							g.screen[0].fill(x,y,8,8,"lightgray");//"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",128)");
							g.screen[0].fill(x,y,7,7,"gray");//"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",128)");
						}else{
							g.screen[0].fill(x+1,y+1,5,5,"gray");//,"rgb(" + (i*8)%256 + "," + (j*8)%256 + ",255)");
						}
						blkcnt++;
				}
				}

				if (block[j][i].hit){
					let r = vp(i*8,j*8);
					let x = r.x;
					let y = r.y;
					if (l==0){
						g.screen[0].fill(x+4,y+4,2,1,"red");//"rgb(" + (i*8)%64+128 + "," + (j*8)%64+128 + ",127)");
					}else{
						g.screen[0].fill(x+4,y+4,1,1,"red");//"rgb(" + (i*8)%64+128 + "," + (j*8)%64+128 + ",127)");
					}
					//g.screen[0].fill(i*32+14,j*32+2,4,2,"rgb(" + (i*8)%64+128 + "," + (j*8)%64+128 + ",127)");
				}
				
			}
		}
	}
   
}

function mapImageCreate(dev){

	dev.fillStyle = "blue";
	dev.fillRect(0, 0, 1600, 960);
	for (let i=0; i<1600; i+=100){
		dev.beginPath();
		dev.strokeStyle = "black";
		dev.lineWidth = 1;
		dev.moveTo(i,0);
		dev.lineTo(i,960);
		dev.stroke();
	}

	dev.beginPath();
	dev.globalAlpha = 1.0;
	dev.strokeStyle = "black";
	dev.lineWidth = 124;
	dev.arc(1600-480, 480, 300, 0.5 * Math.PI, 1.5 * Math.PI, true);
	dev.arc(480, 480, 300, 1.5 * Math.PI, 0.5 * Math.PI, true);
	dev.moveTo(1600-480,780);
	dev.lineTo(480,780);
	dev.stroke();

	dev.beginPath();
	dev.globalAlpha = 1.0;
	dev.strokeStyle = "white";
	dev.lineWidth = 120;
	dev.arc(1600-480, 480, 300, 0.5 * Math.PI, 1.5 * Math.PI, true);
	dev.arc(480, 480, 300, 1.5 * Math.PI, 0.5 * Math.PI, true);
	dev.moveTo(1600-480,780);
	dev.lineTo(480,780);

	dev.stroke();

	/*
	dev.beginPath();
	dev.strokeStyle = "gray";
	dev.lineWidth = 1;
	dev.arc(1600-480, 480, 300, 0.5 * Math.PI, 1.5 * Math.PI, true);
	dev.arc(480, 480, 300, 1.5 * Math.PI, 0.5 * Math.PI, true);
	dev.moveTo(1600-480,780);
	dev.lineTo(480,780);
	//dev.ellipse(640, 480, 500, 300, 0, 2 * Math.PI, false);
	//dev.fill();
	dev.stroke();
	*/

	const cpmap = [];

	for (let j=-3; j<4; j++){
		const m = mapGuideMarkerCreate(j*20);

		cpmap.push(m);

		for (let i in m){

			if (i == 0 || i == m.length-1){
				dev.beginPath();
				dev.fillStyle = "lightgray";
				dev.globalAlpha = 1.0;
				dev.arc( m[i][0], m[i][1], 10, 0, Math.PI*2, true);
				dev.fill();
			
				dev.font = "12px serif";
				dev.fillStyle = "Gray";
				dev.globalAlpha = 1.0;
				let n = j+3;
				dev.fillText("" + n,  m[i][0]-4, m[i][1]+4);
			}
		}

		dev.beginPath();
		dev.strokeStyle = "gray";
		dev.lineWidth = 1;
		dev.arc(1600-480, 480, 300+j*20, 0.5 * Math.PI, 1.5 * Math.PI, true);
		dev.arc(480		, 480, 300+j*20, 1.5 * Math.PI, 0.5 * Math.PI, true);
		dev.moveTo(1600-480	,780+j*20);
		dev.lineTo(480		,780+j*20);
		//dev.ellipse(640, 480, 500, 300, 0, 2 * Math.PI, false);
		//dev.fill();
		dev.stroke();
	}

	return cpmap;
}

function mapGuideMarkerCreate(shift){

		const w = 1600;
		const h = 960
		const r = 300 + shift;

		const m = [
			[w/2,h/2-r]//0 800,120
		];

		for (let i =-90; i<=90; i+=22.5){
			let x = (w-h/2) + Math.cos((Math.PI/180)*i)*r;
			let y = h/2 + Math.sin((Math.PI/180)*i)*r;
			m.push([x,y]);
		}
		m.push([w/2, h/2+r]);

		for (let i = 90; i<=270; i+=22.5){
			let x = h/2 + Math.cos((Math.PI/180)*i)*r;
			let y = h/2 + Math.sin((Math.PI/180)*i)*r;
			m.push([x,y]);
		}
		m.push([w/2-140,h/2-r]);

		return m;
}