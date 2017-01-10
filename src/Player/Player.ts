var PLAYER_VELOCITY = 0.2;
var ANIMATION_FRAMESPEED = 24;//动画播放帧速
enum DIRECTION {
    NORTH,
    SOUTH,
    WEST,
    EAST
}

class Player extends egret.DisplayObjectContainer {
    missionList: Mission[] = [];
    level = 1;
    hp = 200;
    appearance: egret.Bitmap;
    curAnimation: Animation;
    orientation: DIRECTION;
    animationList;
    curState: PLAYER.PlayerState;
    velocity: number;
    searchAgent: AStarSearch;
    observerList: Observer[];


    acceptMission(missionID: string) {
        var mission = MissionService.getInstance().getMissionById(missionID);
        if (MissionService.getInstance().acceptMission(missionID))
            this.missionList.push(mission);
    }

    finishMission(missionID: string) {
        MissionService.getInstance().submitMission(missionID);
    }

    public constructor() {
        super();
        this.velocity = PLAYER_VELOCITY;//pixel per frame
        this.curState = new PLAYER.IdleState(this);
        this.orientation = DIRECTION.EAST;
        this.appearance = new egret.Bitmap(RES.getRes("actor1_05_png"));
        this.animationList = {
            "idle_west": ["actor1_06_png"],
            "idle_east": ["Actor1_09_png"],
            "idle_north": ["Actor1_12_png"],
            "idle_south": ["Actor1_02_png"],
            "walk_west": ["actor1_05_png", "actor1_06_png", "Actor1_07_png", "actor1_06_png"],
            "walk_east": ["Actor1_08_png", "Actor1_09_png", "Actor1_10_png", "Actor1_09_png"],
            "walk_north": ["Actor1_11_png", "Actor1_12_png", "Actor1_13_png", "Actor1_12_png"],
            "walk_south": ["Actor1_01_png", "Actor1_02_png", "Actor1_03_png", "Actor1_02_png"]
        };
        this.observerList = new Array<Observer>();
        this.addChild(this.appearance);
    }

    notify() {
        if (this.observerList.length)
            for (let i in this.observerList) {
                this.observerList[i].onChange(this);
            }
    }

    addObserver(observer: Observer) {
        this.observerList.push(observer);
        this.notify();
    }

    public Move(stateMachine: GameStateMachine, target: Vector2) {
        //获取vec2_p48格式的当前点、目标点
        var position_48 = new Vector2_p48(0, 0);
        position_48.x = this.x;
        position_48.y = this.y;
        var target_48 = new Vector2_p48(0, 0);
        target_48.x = target.x;
        target_48.y = target.y;
        //寻路
        this.searchAgent._objGrid.setStartNode(position_48.indexX, position_48.indexY);//更新agent start, end node
        this.searchAgent._objGrid.setEndNode(target_48.indexX, target_48.indexY);
        this.searchAgent.search();//寻路,建立路径
        stateMachine.switchState(this.curState, new PLAYER.WalkState(this));
    }

    updateOrientation(target: Vector2) {
        if (target.x - this.x > 0) {
            this.orientation = DIRECTION.EAST;
            this.curAnimation = new Animation(this
                .animationList["idle_east"],
                this.appearance, ANIMATION_FRAMESPEED);
        }
        else if (target.x - this.x < 0) {
            this.orientation = DIRECTION.WEST;
            this.curAnimation = new Animation(this
                .animationList["idle_west"],
                this.appearance, ANIMATION_FRAMESPEED);
        }
        if (target.y - this.y > 0) {
            this.orientation = DIRECTION.SOUTH;
            this.curAnimation = new Animation(this
                .animationList["idle_south"],
                this.appearance, ANIMATION_FRAMESPEED);
        }
        else if (target.y - this.y < 0) {
            this.orientation = DIRECTION.NORTH;
            this.curAnimation = new Animation(this
                .animationList["idle_north"],
                this.appearance, ANIMATION_FRAMESPEED);
        }
    }

    updateWalkAnimationClip() {
        switch (this.orientation) {
            case DIRECTION.NORTH:
                this.curAnimation = new Animation(this
                    .animationList["walk_north"],
                    this.appearance, ANIMATION_FRAMESPEED);
                break;
            case DIRECTION.EAST:
                this.curAnimation = new Animation(this
                    .animationList["walk_east"],
                    this.appearance, ANIMATION_FRAMESPEED);
                break;
            case DIRECTION.SOUTH:
                this.curAnimation = new Animation(this
                    .animationList["walk_south"],
                    this.appearance, ANIMATION_FRAMESPEED);
                break;
            case DIRECTION.WEST:
                this.curAnimation = new Animation(this
                    .animationList["walk_west"],
                    this.appearance, ANIMATION_FRAMESPEED);
                break;
        }
    }
}