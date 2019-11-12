/**
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
    var focusBox = null,     //生成的焦点框节点
        lastPage = null,     //上一页的地址
        currentModule = null,//当前模块
        currentFocus = null, //当前焦点
        lastModule = null,   //上一个模块
        lastFocus = null,    //上一个焦点
        T = null;            //焦点框的定时器

    String.prototype.myRemoveStr = function(val){
        //var reg = new RegExp("\\s+" + val + "|" + val + "\\s+");
        var arr = this.split(/\s+/);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) arr.splice(i, 1);
        }
        return arr.join(" ");
    };
    String.prototype.myAddStr = function(val){
        if(this.indexOf(val) !== -1) return this;
        return  this + " " + val;
    };

    var GetCurrentFocus = function (currentStr){
        var m = currentStr.split(",");
        if(focusControl[m[0]] === undefined) return;
        currentModule = focusControl[m[0]];
        if(currentModule.focus[m[1]] === undefined) return;
        currentFocus = currentModule.focus[m[1]];
    };
    var focusObj = function (num, element) {
        this.alive = true;
        this.ID = num;
        this.fcs = element;
        this.className = element.className;
        this.x = element.getBoundingClientRect().left;
        this.y = element.getBoundingClientRect().top;
        this.w = element.offsetWidth;
        this.h = element.offsetHeight;
        this.link = element.title ? element.title : null;
        this.doClick = null;
        this.doBlur = null;
    };
    var moduleObj = function (data) {
        this.nodeList = document.getElementById(data.name).getElementsByClassName("fcs");
        this.length = this.nodeList.length;
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
        this.createFocus();
    };
    moduleObj.prototype.createFocus = function(){
        for(var i = 0; i < this.length; i++){
            this.focus[i] = new focusObj(i, this.nodeList[i]);
            this.focus[i].doFocus = this.doFocus;
            this.focus[i].doBlur = this.doBlur;
            this.focus[i].doClick = this.doClick;
        }
        i = 0;
        if(this.rule == "down"){
            for (; i < this.length; i++) {
                this.focus[i].topFocus = i == 0 ? null : i - 1;
                this.focus[i].rightFocus = null;
                this.focus[i].bottomFocus = i == (this.length - 1) ? null : i + 1;
                this.focus[i].leftFocus = null;
            }
        }else{
            var arr = this.rule.split(",");
            var b = parseInt(arr[1]) || this.length;//焦点模块的列数
            for (; i < this.length; i++) {
                this.focus[i].topFocus = (i - b) >= 0 ? (i - b) : null;
                this.focus[i].rightFocus = (i + 1) % b === 0 ? null : i + 1;
                this.focus[i].bottomFocus = (i + b) < this.length ? (i + b) : null;
                this.focus[i].leftFocus = i % b === 0 ? null : i - 1;
            }
        }
    };
    var moduleInit = function (data) {
        for( var i = 0; i < data.length; i++) {
            focusControl[data[i].name] = new moduleObj(data[i]);
        }
    };
    var onFocusStyle = function () {
        if (T) clearInterval(T);
        focusBox.style.borderColor = "transparent";
        if(currentModule.focusStyle == "frame"){
            focusBox.style.borderColor = "red";
            var index;
            var changeColor = function (obj) {
                if (!index) {
                    obj.style.borderColor = "red";
                    index = 1;
                } else {
                    obj.style.borderColor = "transparent";
                    index = 0;
                }
            };
            T = setInterval(function(){
                changeColor(focusBox);
            }, 500);
        }
        if(currentModule.doFocus) currentFocus.doFocus();
    };
    var firstFocusInit = function(focusStr){
        focusBox = document.createElement("div");
        focusBox.id = "focus-box";
        focusBox.style.border = "4px solid";
        focusBox.style.position = "fixed";
        focusBox.style.zIndex = "2147483647";
        document.body.appendChild(focusBox);
        getFocus(focusStr);
    };
    var getFocus = function(focusStr){
        if(lastModule && lastModule.doBlur) lastFocus.doBlur();
        if(focusStr) GetCurrentFocus(focusStr);
        focusBox.style.top = currentFocus.y - 4 + "px";
        focusBox.style.left = currentFocus.x - 4 + "px";
        focusBox.style.width = currentFocus.w + "px";
        focusBox.style.height = currentFocus.h + "px";
        onFocusStyle();
        lastModule = currentModule;
        lastFocus = currentFocus;
    };
    var moveFocus = function (key) {
        if(!currentFocus) return;
        switch (key) {
            case 8:
                if (lastPage) window.location = lastPage;
                break;
            case 13:
                if(currentFocus.doClick) {
                    currentFocus.doClick()
                }else{
                    location.href = currentFocus.link;
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
            if(currentFocus.alive){
                getFocus();
            }else{
                currentFocus = lastFocus;
                currentModule = lastModule;
            }
        }
    };
    return {
        mainInit : function (data) {
            lastPage = data.lastPage || null;
            moduleInit(data.data);
            firstFocusInit(data.firstFocus);
            if(data.method){
                //window.addEventListener(data.method,moveFocus);
                window.document[data.method] = function(keyEvent){
                    keyEvent = keyEvent ? keyEvent : window.event;
                    keyEvent.which = keyEvent.which ? keyEvent.which : keyEvent.keyCode;
                    moveFocus(keyEvent.which);
                };
            }
        },
        getFocus : function(str){
            getFocus(str);
        },
        removeFocus : function(){
            currentFocus = null;
            if (T) clearInterval(T);
            focusBox.style.border = "4px solid transparent";
        },
        removeModule : function(module){
            if(focusControl[module] === undefined) return;
            delete focusControl[module];
        },
        addModule : function(data){
            moduleInit(data);
        },
        moveFocus : moveFocus
    };
})();