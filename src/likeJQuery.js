let _ = function(selector, context) {
    return new _.fn.init(selector, context);
};
_.fn = _.prototype;
_.fn = {
    init : function(selector, context) {
        var nodeList;
        if(typeof selector == "object"){
            nodeList = [];
            nodeList[0] = selector;
        }else{
            nodeList = (context || document).querySelectorAll(selector);
        }
        this.length = nodeList.length;
        for (var i = 0; i < this.length; i += 1) {
            this[i] = nodeList[i];
        }
        return this;
    },
    splice: Array.prototype.splice,
    eq: function(id){
        this[0] = this[id];
        this.splice(1, this.length - 1);
        return this
    },
    each : function(fn) {
        var i = 0, length = this.length;
        for (; i < length; i += 1) {
            fn.call(this[i], i, this[i]);
        }
        return this;
    },
    addClass : function(str){
        return this.each(function() {
            if(this.className.indexOf(str) == -1) this.className = this.className + " " + str;
        });
    },
    removeClass : function(str){
        return this.each(function() {
            var a = this.className.split(/\s+/);
            for (var i = 0; i < a.length; i++) {
                if (a[i] == str)
                    a.splice(i, 1)
            }
            this.className = a.join(" ");
        });
    },
    show : function() {
        return this.each(function() {
            this.style.visibility = "visible";
        });
    },
    hide : function() {
        return this.each(function() {
            this.style.visibility = "hidden";
        });
    },
    html : function(ctx) {
        if(ctx == undefined) return this[0].innerHTML;
        return this.each(function() {
            this.innerHTML = ctx;
        });
    },
    text : function(ctx) {
        if(ctx == undefined) return this[0].innerText;
        return this.each(function() {
            this.innerText = ctx;
        });
    },
    css : function(a, b){
        return this.each(function() {
            if(b != undefined) {
                this.style[a] = b
            }else{
                for(var o in a){
                    this.style[o] = a[o];
                }
            }
        });
    },
    attr : function(name, vaule){
        if(vaule == undefined) return this[0].getAttribute(name);
        return this.each(function() {
            this.setAttribute(name, vaule);
        });
    },
    click: function(func){
        return this.each(function() {
            this.onclick = function(){
                func.call(_(this));
            };
        });
    },
    blur: function(func){
        return this.each(function() {
            this.onblur = function(){
                func.call(_(this));
            };
        });
    },
    focus: function(func){
        return this.each(function() {
            this.onfocus = function(){
                func.call(_(this));
            };
        });
    }
};
_.fn.init.prototype = _.fn;
/*
 * 对象扩展
 * @params target 'Object' 原对象
 * @params source 'Object' 需要增加的内容
 * @return target 'Object' 扩展后的对象
 * */
_.extend = function(target, source) {
    for (var p in source) {
        if (source.hasOwnProperty(p)) {
            target[p] = source[p];
        }
    }
    return target;
};
export {_}
