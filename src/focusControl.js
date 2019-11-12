/**
 * Created by chenxingxu on 2016/10/21.
 * 焦点框控制器
 *  focusControl.mainInit({
 *  data : [ 模块数组
 *      {
 *      name 模块名称
 *      num 模块内的焦点数
 *      rule 模块内焦点的移动规则
 *      focusStyle 焦点样式 参数:frame(代表有闪烁的焦点框)或其他（没有闪烁的焦点框）
 *      topModule 上方模块名称
 *      rightModule 右方模块名称
 *      bottomModule 下方模块名称
 *      leftModule 左方模块名称
 *      doFocus 获取焦点执行的函数
 *      doBlur 失去焦点执行的函数
 *      doClick 点击当前模块焦点执行的函数（如果未设置，点击会打开此焦点的链接）
 *      }
 *  ]
 *  lastPage 按返回键返回页面地址
 *  firstFocus 页面初始焦点
 *  method 焦点控制方式 参数:onkeydown或onkeypress或""(不设置控制方式)
 *  });
 *  @returns mainInit 初始整个控制器的方法
 *  @returns getFocus 让某个焦点获得焦点
 *  @returns loseFocus 失去焦点
 *  @returns removeModule 删除模块
 *  @returns addModule 添加模块
 *  @returns moveFocus 按键控制函数
 */
focusControl = (function() {
    var fcs = null,          //class为fcs的dom节点
        focusBox = null,     //生成的焦点框节点
        lastPage = null,     //上一页的地址
        whichFcs = 0,        //fcs的计数值
        currentModule = null,//当前模块
        currentFocus = null, //当前焦点
        lastModule = null,   //上一个模块
        lastFocus = null,    //上一个焦点
        T = null;            //焦点框的定时器

    String.prototype.myRemoveStr = function(val){
        //var reg = new RegExp("\\s+" + val + "|" + val + "\\s+");
        var arr = this.split(" ");
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) arr.splice(i, 1);
        }
        return arr.join(" ");
    };
    String.prototype.myAddStr = function(val){
        if(this.indexOf(val) !== -1) return this;
        return  this + " " + val;
    };

    var GetCurrentFocus = function (currentStr, changeStyle){//根据传入的字符串和改变规则改变当前的焦点模块和焦点框
        if(currentStr.indexOf(",") === -1){
            if(focusControl[currentStr] === undefined) return;//如果找不到当前模块，就返回
            currentModule = focusControl[currentStr];
            var colNum = parseInt(currentModule.rule.split(" ")[1]);//获取当前模块的列数
            var rolNum = Math.ceil(currentModule.focus.length / colNum);//获取当前模块的行数
            var currentRol = Math.floor(currentFocus.ID / colNum) + 1; //当前焦点在模块中的行数
            var currentCol = currentFocus.ID % colNum + 1;//当前焦点在模块中的列数
            var colNum_l = parseInt(lastModule.rule.split(" ")[1]);//获取上个模块的列数
            var rolNum_l = Math.ceil(lastModule.focus.length / colNum_l);//获取上个模块的行数
            var lastRol = Math.floor(lastFocus.ID / colNum_l) + 1; //上个焦点在模块中的行数
            var lastCol = lastFocus.ID % colNum_l + 1;//上个焦点在模块中的列数
            switch (changeStyle) {
                case "top":
                    if (lastModule.rule.indexOf("right") != -1) {
                        if (currentModule.rule.indexOf("right") != -1) {
                            currentFocus = lastCol >= colNum ? currentModule.focus[currentModule.focus.length - 1] : currentModule.focus[colNum * (rolNum - 1) + lastCol - 1]
                        } else {
                            currentFocus = currentModule.focus[currentModule.focus.length - 1]
                        }
                    } else {
                        if (currentModule.rule.indexOf("right") != -1) {
                            currentFocus = currentModule.focus[colNum * (rolNum - 1)]
                        } else {
                            currentFocus = currentModule.focus[currentModule.focus.length - 1]
                        }
                    }
                    break;
                case "right":
                    currentFocus = lastRol >= rolNum ? currentModule.focus[colNum * (rolNum - 1)] : currentModule.focus[colNum * (lastRol - 1)];
                    break;
                case "bottom":
                    if (lastModule.rule.indexOf("right") != -1) {
                        if (currentModule.rule.indexOf("right") != -1) {
                            currentFocus = lastCol >= colNum ? currentModule.focus[colNum - 1] : currentModule.focus[lastCol - 1]
                        } else {
                            currentFocus = currentModule.focus[currentModule.focus.length - 1]
                        }
                    } else {
                        if (currentModule.rule.indexOf("right") != -1) {
                            currentFocus = currentModule.focus[0]
                        } else {
                            currentFocus = currentModule.focus[0]
                        }
                    }
                    break;
                case "left":
                    currentFocus = lastRol >= rolNum ? currentModule.focus[colNum * rolNum - 1] : currentModule.focus[colNum * lastRol - 1]
                    break;
            }
        }else{
            var m = currentStr.split(",");
            if(focusControl[m[0]] === undefined) return;
            currentModule = focusControl[m[0]];
            if(currentModule.focus[m[1]] === undefined) return;
            currentFocus = currentModule.focus[m[1]];
        }
    };
    var focusObj = function (num, whichFcs) {
        var startFcs = whichFcs + num;
        console.log("第" + num + "个焦点框对应的fcs为" + startFcs);
        this.alive = true;
        this.ID = num;
        this.fcs = fcs[startFcs];
        this.className = fcs[startFcs].className;
        this.x = fcs[startFcs].getBoundingClientRect().left;
        this.y = fcs[startFcs].getBoundingClientRect().top;
        this.w = fcs[startFcs].offsetWidth;
        this.h = fcs[startFcs].offsetHeight;
        this.link = fcs[startFcs].title ? fcs[startFcs].title : null;
        this.doClick = null;
        this.doBlur = null;
    };
    var moduleObj = function (data, whichFcs) {
        this.name = data.name;
        this.rule = data.rule;
        this.focusStyle = data.focusStyle;
        this.focus = [];
        this.leftModule = data.leftModule || null;
        this.topModule = data.topModule || null;
        this.rightModule = data.rightModule || null;
        this.bottomModule = data.bottomModule || null;
        this.doFocus = data.doFocus || null;
        this.doBlur = data.doBlur || null;
        this.doClick = data.doClick || null;
        var arr = data.rule.split(" ");
        var b = parseInt(arr[1]);
        if(b == 1){
            if(arr[0] ==  "right"){
                for (var i = 0; i < data.num; i++) {
                    this.focus[i] = new focusObj(i, whichFcs - data.num);
                    this.focus[i].topFocus = null;
                    this.focus[i].rightFocus = i == (data.num - 1) ? null : i + 1;
                    this.focus[i].bottomFocus = null;
                    this.focus[i].leftFocus = i === 0 ? null : i - 1;
                    this.focus[i].doFocus = this.doFocus || null;
                    this.focus[i].doBlur = this.doBlur || null;
                    this.focus[i].doClick = this.doClick || null;
                }
            }else if(arr[0] == "down"){
                for (var i = 0; i < data.num; i++) {
                    this.focus[i] = new focusObj(i, whichFcs - data.num);
                    this.focus[i].topFocus = i == 0 ? null : i - 1;
                    this.focus[i].rightFocus = null;
                    this.focus[i].bottomFocus = i == (data.num - 1) ? null : i + 1;
                    this.focus[i].leftFocus = null;
                    this.focus[i].doFocus = this.doFocus || null;
                    this.focus[i].doBlur = this.doBlur || null;
                    this.focus[i].doClick = this.doClick || null;
                }
            }
        }else{
            for (var i = 0 ; i < data.num; i++) {
                this.focus[i] = new focusObj(i, whichFcs - data.num);
                this.focus[i].topFocus = (i - b) >= 0 ? (i - b) : null;
                this.focus[i].rightFocus = (i + 1) % b === 0 ? null : i + 1;
                this.focus[i].bottomFocus = (i + b) < data.num ? (i + b) : null;
                this.focus[i].leftFocus = i % b === 0 ? null : i - 1;
                this.focus[i].doFocus = this.doFocus || null;
                this.focus[i].doBlur = this.doBlur || null;
                this.focus[i].doClick = this.doClick || null;
            }
        }
    };
    var moduleInit = function (data) {
        console.log("%c开始初始化------moduleInit","color:green");
        if(data.length){
            for( var i = 0; i < data.length; i++) {
                whichFcs += data[i].num;
                console.log("%c开始初始化模块------" + data[i].name,"color:blue");
                focusControl[data[i].name] = new moduleObj(data[i], whichFcs);
                console.log("%c初始化完成------" + data[i].name,"color:blue");
            }
        }else{
            whichFcs += data.num;
            console.log("%c开始初始化模块------" + data.name,"color:blue");
            focusControl[data.name] = new moduleObj(data, whichFcs);
            console.log("%c初始化完成------" + data.name,"color:blue");
        }
        console.log("%c初始化完成------moduleInit","color:green");
    };
    var onFocusStyle = function (async) {
        async = async === undefined ? true : async;
        if(currentModule.focusStyle == "frame"){
            var index;
            var setOutline = function(obj) {
                obj.style.border = "4px solid red";
                //obj.style.outlineOffset = "1px";
                //obj.style.webkitBoxShadow="0 0 5px 5px #000";
                index = 1;
            };
            var delOutline = function(obj) {
                obj.style.border = "4px solid transparent";
                //obj.style.outlineOffset = "0px";
                //obj.style.webkitBoxShadow = "none";
                index = 0;
            };
            var changeColor = function (obj) {
                if (index === 0) {
                    setOutline(obj);
                } else {
                    delOutline(obj);
                }
            };
            setOutline(focusBox);
            T = setInterval(function(){
                changeColor(focusBox);
            }, 500);
        }
        if(currentModule.doFocus !== null && async !== false){
            console.warn("开始执行onfocs函数");
            currentFocus.doFocus();
            console.warn("执行完成onfocs函数");
        }
    };
    var getFocus = function(focusStr){
        if(focusStr) GetCurrentFocus(focusStr);
        console.log("当前焦点块" , currentModule.name,",当前焦点" , currentFocus.ID);
        focusBox = document.createElement("div");
        focusBox.id = "focus-box";
        focusBox.style.top = currentFocus.y - 4 + "px";
        focusBox.style.left = currentFocus.x - 4 + "px";
        focusBox.style.width = currentFocus.w + "px";
        focusBox.style.height = currentFocus.h + "px";
        focusBox.style.position = "fixed";
        focusBox.style.zIndex = "2147483647";
        document.body.appendChild(focusBox);
        onFocusStyle();
        lastModule = currentModule;
        lastFocus = currentFocus;
    };
    var loseFocus = function(){
        if(lastModule && lastModule.doBlur !== null){
            console.warn("开始执行onblur函数");
            lastFocus.doBlur();
            console.warn("执行完成onblur函数");
        }
        if (document.getElementById("focus-box") !== null) {
            var fcsBox = document.getElementById("focus-box");
            document.body.removeChild(fcsBox);
            clearInterval(T);
        }
    };
    var moveFocus = function (key) {
        switch (key) {
            case 8:
                if (lastPage !== null) {
                    window.location = lastPage;
                } else {
                    history.go(-1);
                }
                break;
            case 13:
                if (currentFocus){ //如果焦点框存在，且当前当前焦点不是-1
                    if (currentFocus.doClick === null) {      //如果当前焦点的点击事件不存在
                        if(currentFocus.link !== null){
                            location.href = currentFocus.link;
                        }
                    } else {
                        currentFocus.doClick();
                    }
                }
                break;
            case 37:
                if(currentFocus.leftFocus !== null){
                    currentFocus = currentModule.focus[currentFocus.leftFocus];
                }else if(currentModule.leftModule){
                    GetCurrentFocus(currentModule.leftModule ,"left");
                }
                break;
            case 38:
                if(currentFocus.topFocus !== null){
                    currentFocus = currentModule.focus[currentFocus.topFocus];
                }else if(currentModule.topModule){
                    GetCurrentFocus(currentModule.topModule, "top");
                }
                break;
            case 39:
                if(currentFocus.rightFocus !== null){
                    currentFocus = currentModule.focus[currentFocus.rightFocus];
                }else if(currentModule.rightModule){
                    GetCurrentFocus(currentModule.rightModule, "right");
                }
                break;
            case 40:
                if(currentFocus.bottomFocus !== null){
                    currentFocus = currentModule.focus[currentFocus.bottomFocus];
                }else if(currentModule.bottomModule){
                    GetCurrentFocus(currentModule.bottomModule, "bottom");
                }
        }
        if(currentFocus != lastFocus || currentModule != lastModule) {
            if(!currentFocus.alive){
                currentFocus = lastFocus;
                currentModule = lastModule;
                console.log("这个焦点已经停用");
                console.log("回到上个焦点块" , currentModule.name,",上个焦点" , currentFocus.ID);
            }else{
                loseFocus();
                getFocus();
            }
        }
    };
    return{
        mainInit : function (data) {
            console.log("%c开始初始化----mainInit","color:red");
            fcs = document.getElementsByClassName("fcs");
            lastPage = data.lastPage || null;
            moduleInit(data.data);
            if(data.firstFocus)getFocus(data.firstFocus);
            if(data.method){
                //window.addEventListener(data.method,moveFocus);
                window.document[data.method] = function(keyEvent){
                    keyEvent = keyEvent ? keyEvent : window.event;
                    keyEvent.which = keyEvent.which ? keyEvent.which : keyEvent.keyCode;
                    moveFocus(keyEvent.which);
                };
            }
            console.log("%c初始化完成------mainInit","color:red");
        }
        ,
        getFocus : function(str){
            loseFocus();
            getFocus(str);
        },
        loseFocus : loseFocus,
        removeModule : function(module){
            if(focusControl[module] === undefined) return;
            whichFcs -= focusControl[module].focus.length;
            delete focusControl[module];
        },
        addModule : function(data){
            moduleInit(data);
        },
        moveFocus : moveFocus
    };
})();