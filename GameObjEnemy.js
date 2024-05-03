function GameObjectEnemy(game){

    const RESO_X = 1600 ;
	const RESO_Y = 960;

    const g = game;

    this.r = 0;
    this.vr = 0;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;

    this.old_X = 0;
    this.old_y = 0;

    this.triggerDelay = 0;
	this.op = { ptr: 0, x: Array(40), y: Array(40), r: Array(40)};
    this.turlet = new turlet_vec_check(g);
 
    let status = {speed:0, charge:0, power:0, maxspeed:0, accel:1 };

    this.status = function(){ return status;}

    this.spriteItem;

    let reexf;
    let blmode = false;

    let guidemode;
    let lapcnt;

    let lane;
    let wallcnt;

    this.LAP = function(){
        return {count:lapcnt, par: guidemode/20 };
    }
    this.ResetLAP = function(){
        lane = 3;
        lapcnt = 0;
    }

    function turlet_vec_check(){
        const cpmap = g.CHECKPOINT_MAP;
        let gm = mapGuideMarkerCreate(g);
		let turlet = 0;
        let hitcheck = [];

        this.vecToR = function(wx, wy){
			let r = (wx == 0)?
			((wy >= 0)?180: 0):
			((Math.atan(wy / wx) * (180.0 / Math.PI)) + ((wx >= 0)? 90:270))
			
			return (270+r)%360;
		}

        this.check = function(r){
            turlet = (turlet+360)%360;

            if ((r>270) && (turlet<90)){
                r=r-360; 
            }
            if ((turlet>270) && (r<90)){
                r=r+360; 
            }

            let wr = Math.trunc(180 + r - turlet)%360;
            //if (wr<0) {turlet = r; wr = 180;}// alert("!" + wr);  //wr = Math.trunc(180 + r - turlet)%360;

            if (wr >= 180) turlet++;
			if (wr <= 180) turlet--;
			if (wr >= 210) turlet+=2;
			if (wr <= 150) turlet-=2;
			if (wr >= 270) turlet+=3;
			if (wr <=  90) turlet-=3;
		}

        this.move = function(vr){
            turlet = (turlet + vr)%360;
        }

        this.vector = function(){
            return turlet;//turVector[turlet];
        }

        this.gcheck = function(g, wx, wy){
            this.check(Search(g, wx, wy));
            //Search一番近いガイドマーカー向かって向きを変える。
        }

        this.gdist = function(num, wx, wy){
            let f = false;
            hitcheck = [];
            for (let c in cpmap){
                let wgm = cpmap[c][num];
                if (distance({x:wx, y:wy},{x:wgm[0],y:wgm[1]}) <10){
                    hitcheck.push(true);
                    f = true;
                }else{
                    hitcheck.push(false);
                }
            }
            //return (f)?10:100;
            return distance({x:wx, y:wy},{x:gm[num][0],y:gm[num][1]});
            //目的のターゲットマーカー距離<60で通過確認
        }

        this.guideset = function(num, wx, wy){
            return ((this.vecToR(wx-gm[num][0], wy-gm[num][1])+180)%360);
            //目的のガイドマーカーNoの向きを返す
        }

        this.laneselect = function(num){
            if (num < 0) num = 0;
            if (num >= cpmap.length) num = cpmap.length - 1; 
            gm = cpmap[num];
            return num;
        }

        this.bordercheck = function(num){
            let f = false;
            if (hitcheck[0] || hitcheck[cpmap.length -1]){
                f = true;
                for (let i=1; i<cpmap.length -1; i++){
                    if (hitcheck[i]) f=false;
                }
            }
            return f;
            //return (num < 2 || num >= cpmap.length -1)?true:false;            
        }

        function Search(g, wx, wy){
            const l = gm;
            let d = 9999;
            let c = -1;
            for (let i in l){
                let wd = distance({x:wx, y:wy},{x:l[0],y:l[1]});// console.log(wd); 
                if (wd <= d) {
                    c = i;
                    d = wd;
                }
            }
            let rc = -1;
            if (c != -1){
                rc = vecToR(
                    wx - l[c].x,
                    wy - l[c].y
                );
           }
           return (rc+180)%360;
        }

        function distance(s, t){
            return Math.sqrt((Math.abs(t.x - s.x) * Math.abs(t.x - s.x)) + (Math.abs(t.y - s.y) * Math.abs(t.y - s.y)));
        }

        function mapGuideMarkerCreate(g){

            return g.CHECKPOINT_MAP[3];
            /*
            const w = 1600;
            const h = 960
            const r = 300 + shift;
    
            const m = [
                [w/2,h/2-r]//0 800,120
            ];
    
            for (let i =-90; i<=90; i+=45){
                let x = (w-h/2) + Math.cos((Math.PI/180)*i)*r;
                let y = h/2 + Math.sin((Math.PI/180)*i)*r;
                m.push([x,y]);
            }
            m.push([w/2, h/2+r]);
    
            for (let i = 90; i<=270; i+=45){
                let x = h/2 + Math.cos((Math.PI/180)*i)*r;
                let y = h/2 + Math.sin((Math.PI/180)*i)*r;
                m.push([x,y]);
            }
            m.push([w/2-140,h/2-r]);

            return m;
            */
        }
        

    }

    this.init = function(maxspeed, accel, startlane){

        this.r = 0;
        this.vr = 0;
        this.x =  this.spriteItem.x;
        this.y =  this.spriteItem.y;
        this.old_x = this.x;
        this.old_y = this.y;
        this.triggerDelay = 0;

        status.maxspeed = maxspeed;
        status.accel = accel;

        this.spriteItem.mode = 0;
        this.spriteItem.linkedOption = false;

        reexf = false;
        blmode = false;
        
        guidemode = 0;
        lane = startlane;
        lapcnt = 0;
    }
  
    this.step = function(g, input, result){
        this.spriteItem.collisionEnable = true;//(result.clrf)?false:true;

        let x = 0;//input.x;
        let y = -1;
        let trigger = input.trigger;
        let lock = (input.left || input.right)?true:false;

        if (trigger) {
            if (this.triggerDelay < g.time()){
                this.triggerDelay = g.time()+250;
            }
            x = Math.trunc(Math.random()*3)-1;
            y = Math.trunc(Math.random()*3)-1;
        }

        if ( y < 0) {status.speed += 0.1 * status.accel} else {status.speed-=0.01}; 
        if ( y > 0) status.speed -= 0.1;

        if (status.speed>status.maxspeed) status.speed = status.maxspeed; 
        if (status.speed< 0){ status.speed = 3;  this.spriteItem.collisionEnable = false;}
        //if (y > 0) status.speed -= 0;

        let speed = 0 + status.speed;// - (this.spriteItem.slow)?1:0;

        lane = this.turlet.laneselect(lane+x);
        if (this.turlet.bordercheck(lane)) status.speed = 0;
        /*
        let vr = (x != 0)? x*(30/(status.speed+1)):0;//this.turlet.guideset(guidemode, this.x, this.y)-this.r;
        vr = (vr>3)? 3 :vr;

        this.r = Math.trunc(360 + this.r + vr)%360;
        */
        this.r = this.turlet.guideset(guidemode, this.x, this.y) ;

        let vx = speed * (Math.cos((Math.PI/180)*(this.turlet.vector())));// * -y;
        let vy = speed * (Math.sin((Math.PI/180)*(this.turlet.vector())));// * -y;

        let wallf = false;
        let wpl = Boolean(this.spriteItem.wall)?((this.spriteItem.wall)?true:false):false;
        
        let pup = false;
        
        if (this.spriteItem.living){
            //自機が生きている状態
            reexf = false;//爆発済みf
        }else{
            if (!reexf){
                 explose(g,
                    this.x, this.y);
                reexf = true;
                blmode = false;

                status.speed = 0;

                this.old_x = this.x;
                this.old_y = this.y;
            }
        }
        
        wallf = (wpl)?true:false;
        if (wallf){ 
            //this.x = this.old_x;
            //this.y = this.old_y;
            this.spriteItem.wall = false;
            status.speed -= 0.2;

            wallcnt++;
            if (wallcnt > 100){
                //this.spriteItem.collisionEnable = false;
                //this.spriteItem.dispose();
            }
            //this.r = this.turlet.guideset(guidemode, this.x, this.y);
        }else{
            wallcnt=0;
        }
        //this.turlet.guideset(guidemode, this.x, this.y);
        if (reexf) return;

        //if (!lock)
         this.turlet.check(this.r);
        //if ((vx!=0 || vy!=0)){//||result.clrf) {

        vx = ((this.old_x - this.x) + vx)/2;
        vy = ((this.old_y - this.y) + vy)/2;

        this.old_x = Math.trunc(this.x);
        this.old_y = Math.trunc(this.y);

        let tajs = (g.deltaTime()/(1000/60));//speed DeltaTime ajust 60f base
        this.x = this.x + (vx * tajs);
        this.y = this.y + (vy * tajs);

        
        if (this.x < 32)	this.x = 32;
        if (this.x > RESO_X-32)	this.x = RESO_X-32;
        if (this.y < 32)	this.y = 32;
        if (this.y > RESO_Y-32)	this.y = RESO_Y-32;
        
        /*
        if (this.x < 0)	this.x = RESO_X;
        if (this.x > RESO_X)	this.x = 0;
        if (this.y < 0)	this.y = RESO_Y;
        if (this.y > RESO_Y)	this.y = 0;
        */
        //if (!result.clrf) this.r = this.turlet.vecToR(vx,vy);

        if (this.turlet.gdist(guidemode, this.x, this.y) < 60){
            status.speed -= 0.5;
            guidemode++;
            guidemode = guidemode%21;// [!!WARNING!!]this MAGICNO is CHECKPOINT_MAP SIZE g.CHECKPOINT.length
            if (guidemode == 0){lapcnt++}
        }
    }
    
    this.draw = function(g){

        let tx = Math.trunc(this.x);
        let ty = Math.trunc(this.y);

        this.spriteItem.pos(tx, ty, (this.turlet.vector()+90)% 360, 1);
        this.spriteItem.view();

        //if (this.spriteItem.living)g.font["std"].putchr(this.spriteItem.index + " LAP:" + lapcnt,0,150+this.spriteItem.index*8);


    }

    function explose(g, x, y, sr=0, w=360){

        for (let r=sr; r<w; r+=(360/12)){
            sp = g.sprite.itemCreate("BULLET_E", true, 8, 8);
            sp.pos(x, y, r);
            sp.move(r, 2, 30);// number, r, speed, lifetime//
        }
    }
}
