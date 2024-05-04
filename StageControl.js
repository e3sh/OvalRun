function StageControl(game){

	const ROW = 60;
	const COL = 80;

	const RESO_X = 1600;
	const RESO_Y = 960;

	let rank;

	const bgImage = new OffscreenCanvas( 1600, 960 );
	const bgCtx  = bgImage.getContext("2d" ,{
			alpha:false
			,willReadFrequently:true
		}
	);

	let g = game;

	this.init = function(){

		rank = 1;

		const dev = bgCtx;
		const cpmap = mapImageCreate(dev);

		g.CHECKPOINT_MAP = cpmap;
	}

	this.change = function(stage, GObj){

		rank = stage;

		for (let i=1; i<4; i++){
			let enemy = new GameObjectEnemy(g);
			enemy.spriteItem = g.sprite.itemCreate("Enemy", true, 28, 28);
			enemy.spriteItem.pos(800 - i * 32,100);
			enemy.init(8 + i*2 + rank, (15-i)/10, 2+i);//maxspeed, accel, lane
			GObj.push(enemy);

			enemy = new GameObjectEnemy(g);
			enemy.spriteItem = g.sprite.itemCreate("Enemy", true, 28, 28);
			enemy.spriteItem.pos(800 - i * 32,260);
			enemy.init(8 + (i+3)*2 + rank, (15-(i+3))/10, 4-i);//maxspeed, accel, lane
			GObj.push(enemy);
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
			
			if (p.id == "Player"){
				let imgd = bgCtx.getImageData(p.x - w/2, p.y - h/2, w ,h);
				c = 0;
				for (let i=1; i < imgd.data.length; i+=4){
					c += (imgd.data[i] != 0)?0:1;
				}
				if (c != 0 ) p.wall = true;
			}
		}
	}
	this.draw = function(g){

		const vp = g.viewport.viewtoReal;

		let r = vp(0,0);
		g.screen[0].putImage(bgImage, r.x, r.y);
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