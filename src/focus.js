
import {_} from '../../../../js/likeJQuery'

(() => {
    console.log('Welcome to the focus.');
    _('a').click = function(){return false};
    let [focusract, cm, cf, T] = [];

    let _init = Symbol();
    class Focus {
        constructor(ele, i, column, length) {
            this.click = null;
            this.blur = null;
            this.focus = null;
            Object.assign(Focus.prototype, _.fn);
            Object.assign(this, _(ele));
            this[_init](i, parseInt(column), length);
        }

        [_init](i, b, length) {
            this.ID = i;
            this.top = (i - b) >= 0 ? (i - b) : null;
            this.right = (i + 1) % b === 0 ? null : (i == length - 1 ? null : i + 1);
            this.bottom = (i + b) < length ? (i + b) : (Math.floor(i/b) == Math.floor((length - 1)/b) ? null : length - 1);
            this.left = i % b === 0 ? null : i - 1;
        }

        getFocus() {
            focusract.css({
                "top" :  this[0].getBoundingClientRect().top - 4 + "px",
                "left" :  this[0].getBoundingClientRect().left - 4 + "px",
                "width" :  this[0].offsetWidth + 4 + "px",
                "height" :  this[0].offsetHeight + 4 + "px"
            });
            if (T) clearInterval(T);
            switch (cm.style) {
                case "blink":
                    focusract.css("borderRadius", "8px").blink();
                    break;
                case "border":
                    focusract.css("borderRadius", "8px");
                    break;
                case "circle":
                    focusract.css("borderRadius", cf[0].offsetWidth/2 + "px").blink();
                    break;
                case "none":
                    focusract.hide();
                    break;
            }
            cf && cf.addClass('current');
            (cf && cf.focus) ? cf.focus() : (cm && cm.focus && cm.focus.call(cf));
        }
    }

    class Module {
        constructor(name, data) {
            if(name === undefined) return console.warn("Please make sure module name exists!");
            let eleFocus = _('#' + name + ' a');
            eleFocus.length == 0 && (eleFocus = _('#' + name));
            let module = {
                nodeList : eleFocus,
                name : name,
                length : eleFocus.length,
                column : 1,                                 //模块里面的焦点排列规则
                style : 'blink',                            //获得焦点的样式为一个焦点框
                top : '',                            //获得焦点的样式为一个焦点框
                right : '',                            //获得焦点的样式为一个焦点框
                bottom : '',                            //获得焦点的样式为一个焦点框
                left : '',                            //获得焦点的样式为一个焦点框
                focus: null,                       //这个模块所有焦点获得焦点时执行的函数
                blur: null,                        //这个模块所有焦点失去焦点时执行的函数
                click: null                        //这个模块所有焦点点击时执行的函数
            };
            Object.assign(this, module, data);
            this.createFocus();
        }

        createFocus() {
            for(let i = 0; i < this.length; i++){
                this[i] = new Focus(this.nodeList[i], i, this.column, this.length);
            }
        }
    }

    class ctrl {
        addModule(module) {
            for(let [k, v] of Object.entries(module)) this.creatModule(k, v)
        }

        creatFrame() {
            let frame = document.createElement("div");
            frame.id = "focus";
            frame.className = "focus";
            document.body.appendChild(frame);
            focusract = this.focusract = _(frame);
            focusract.css({
                "position" : "fixed",
                "border" : "3px solid white"
            });
            focusract.blink = function(flag) {
                this.show();
                T = setInterval(() => (flag = !flag) ? this.show() : this.hide(), 500);
            }
        }

        creatModule(ID, data) {
            this[ID] = new Module(ID, data);
        }

        getFocus(str) {
            let c = this.queryFocus(str);
            if(!c.f) return false;
            cf && cf.removeClass('current');
            (cf && cf.blur) ? cf.blur() : (cm && cm.blur && cm.blur.call(cf));
            if(c.m) this.currentModule = cm = c.m;
            this.currentFocus = cf = c.f;
            c.f.getFocus();
        }

        queryFocus(para) {
            if(typeof para == "number"){
                return {
                    f: cm[para]
                };
            }else if(typeof para == "string"){
                let a = para.split(",");
                if(this[a[0]] === undefined) return console.error("The module what you checked was not defined!");
                let m = this[a[0]];
                if(m[a[1]] === undefined) return console.error("The focus what you checked was not defined!");
                return {
                    m: this[a[0]],
                    f: m[a[1]]
                };
            }
            return {};
        }

        focusMoveControl(key) {
            if(!cf) return console.error("Can't move focus, bacause don't have current focus");
            let direction = '';
            switch (key) {
                case 8:
                    return focusCtrl.config.backurl && (location.href = focusCtrl.config.backurl);
                case 13:
                    return cf[0].href ? (location.href = cf[0].href) : (cf.click ? cf.click() : (cm.click && cm.click.call(cf)));
                case 37:
                    direction = 'left';
                    break;
                case 38:
                    direction = 'top';
                    break;
                case 39:
                    direction = 'right';
                    break;
                case 40:
                    direction = 'bottom';
            }
            (direction != "") && (cf[direction] == null ? (cm[direction] && this.getFocus(cm[direction])) : this.getFocus(cf[direction]));
        }

        removeModule(module) {
            return  delete this[module];
        }

        mainInit(para) {
            if(typeof para == 'undefined') para = {};
            let _config = {
                backurl : '',               //返回地址，默认返回键的地址
                control : 'onkeydown',      //按键方式，默认onkeydown
                firstFocus : 'footer,0'     //初始焦点，默认返回键获得焦点
            };
            let _module = {"footer" : {}};  //模块对象，默认是footer模块
            this.config = Object.assign(_config, para.config);
            delete para.config;
            let module = Object.assign(_module, para);
            this.creatFrame();
            this.addModule(module);
            this.getFocus(this.config.firstFocus);
            let control = this.config.control,
                that = this;
            if(control && control != "none"){
                window.document.onkeydown = function(keyEvent){
                    keyEvent = keyEvent ? keyEvent : window.event;
                    //keyEvent.which = keyEvent.which ? keyEvent.which : keyEvent.keyCode;
                    that.focusMoveControl(keyEvent.which);
                };
            }
        };
    }
    window.focusCtrl = new ctrl();
})();
