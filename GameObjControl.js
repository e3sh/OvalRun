function GameObj_GradeUpItem(){

    const RESO_X = 1600;
	const RESO_Y = 960;

    this.triggerDelay = 0;

    this.mode = 0;
    this.blink = true;
    this.barth = true;

    this.spriteItem;
    let reexf;

    this.init = function(g){

        this.triggerDelay = g.time()+250;

        this.mode = 0;
        this.barth = true;

        this.spriteItem.mode = this.mode;
        //this.spriteItem.drawDesignData = drawDesignData;
        this.spriteItem.blink = true;
  
        reexf = false;

        this.spriteItem.normalDrawEnable = true;
        //this.spriteItem.customDraw = customDraw;

        this.spriteItem.moveFunc = function(delta){
            let tajs = (delta/(1000/60));
            this.alive--; this.x += this.vx * tajs; this.y += this.vy * tajs;
        }
    }

    function vecToR(wx, wy){
        //console.log(wx + "," + wy);
        let r = (wx == 0)?
        ((wy >= 0)?180: 0):
        ((Math.atan(wy / wx) * (180.0 / Math.PI)) + ((wx >= 0)? 90:270))
        
        return (270+r)%360;
    }

    function Search(g, wx, wy){
        const l = g.sprite.itemList();
        let c = -1;
        for (let i in l){
            if (l[i].id  == "Player"){
                c = i;
            }
        }
        let rc = -1;
        if (c != -1){
            rc = vecToR(
                wx - l[c].x,
                wy - l[c].y
            );
       }
       return rc;
    }

    this.step = function(g, input, result) {
        this.spriteItem.collisionEnable = !this.barth;
        //console.log("pw-run" + this.triggerDelay );
        /*
        if (result.clrf && (result.time + 750 > g.time())){
            let r = Search(g, this.spriteItem.x, this.spriteItem.y);
            this.spriteItem.move((r+260)%360,4,1);
        }
        */
        if (this.spriteItem.living){
			if (this.triggerDelay < g.time()){
				this.triggerDelay = g.time()+250;

                this.mode = (this.spriteItem.mode != this.mode)?this.spriteItem.mode:this.mode;
                this.spriteItem.priority = this.mode;

                this.blink = (this.blink)?false:true;
                this.spriteItem.blink = this.blink;

                this.barth = false;
            }
            reexf = false;//爆発済みf
        }else{
            if (!reexf){
                reexf = true;
            }
        }

        if (reexf) return;

        //if (!lock) this.turlet.check(this.r);
        const x = this.spriteItem.x;
        const y = this.spriteItem.y;
        const r = this.spriteItem.r;
        
        if (x < 32)	this.spriteItem.x = 32;
        if (x > RESO_X-32)	this.spriteItem.x = RESO_X-32;
        if (y < 32)	this.spriteItem.y = 32;
        if (y > RESO_Y-32)	this.spriteItem.y = RESO_Y-32;
        
    }

    this.draw = function(g){

        if (this.spriteItem.living){
            this.spriteItem.view();

            //debug Draw
           /*
            const x = this.spriteItem.x;
            const y = this.spriteItem.y;
            let st = this.spriteItem.debug();
            for (let i in st){g.kanji.print(st[i],0,i*8);}
           */
        }
    }

    const drawDesignData = {
        str: [
            ["得点","正面","側面","子機","弾種"]
            ,[" 300","FWD","SIDE"," OPT","CHNG"]
        ]
        ,color: [
            ["black","peru","navy","teal","indigo"]
            ,["rgb(64,64,64)","orange","blue","green","blueviolet"]
        ]
    }

    function customDraw(g, screen){

        const st  = this.drawDesignData.str;
        const col = this.drawDesignData.color;

        let n = (this.blink)?0:1;

        let r = g.viewport.viewtoReal(
            Math.trunc(this.x - this.collision.w/2)
            ,Math.trunc(this.y - this.collision.h/2)
        )
        if (r.in){
            const x = r.x;
            const y = r.y;
            const w = this.collision.w;
            const h = this.collision.h;
            screen.fill(x, y, w, h, "white");
            screen.fill(x+1, y+1, w-2, h-2, col[n][ this.mode ]);
            g.kanji.print(st[n][this.mode], x+2, y+4);
        }
    }
} 