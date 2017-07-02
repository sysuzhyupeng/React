function Router(){

}
// var linkArr = document.getElementsByTagName('linker');
// for(var i = 0, len = linkArr.length; i < len; i++){
// 	linkArr[i].addEventListener('click', function(){
// 		var to = this.getAttribute('to');
// 		console.log('to', );
// 		var state = {
// 			id: 'a'
// 		}
// 		history.pushState(state, 'lottery', to);
// 	}, false);
// }
// window.addEventListener('popstate', function(e){
// 	var state = e.state;
// 	console.log('e', e);
// }, false);


// var render = template(tplString) // template 把模板编译成 render 函数而不是 HTML 字符串
// var root1 = render(state1) // 根据初始状态返回的 virtual-dom

// var dom = root.render() // 根据 virtual-dom 构建一个真正的 dom 元素
// document.body.appendChild(dom)

// var root2 = render(state2) // 状态变更，重新渲染另外一个 virtual-dom
// var patches = diff(root1, root2) // virtual-dom 的 diff 算法
// patch(dom, patches) // 更新真正的 dom 元素


//模板引擎
var tpl = 'Hei, my name is <%name%>, and I\'m <%info.age%> years old.';
var data = {
	'name': 'zhyupeng',
	'info': {
		'age': '20'
	}
}

var fn = new Function("data", 
    "var r = []; for(var i in data){ r.push(data[i]); } return r.join(' ')");

fn({"name": "barretlee", "age": "20"});

var reg = /<%([^%>]+)?%>/g;
while(match = reg.exec(tpl)) {
    // console.log(match);
}
//获得match 定位

var tplEngine = function(tpl, data){
	var reg = /<%([^%>]+)?%>/g,
		code = 'var r=[];\n',
		cursor = 0; //主要作用是定位代码最后一截
	var add = function(line){
		code += 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
	}
	while(match = reg.exec(tpl)){
		add(tpl.slice(cursor, match.index)); //增加非逻辑部分 
		add(match[1]); //添加逻辑部分 match[0] = "<%" + match[1] + "%>";
		cursor = match.index + match[0].length;
	}
	add(tpl.substr(cursor, tpl.length - cursor));
	code += 'return r.join("");'; // 返回结果，在这里我们就拿到了装入数组后的代码
    console.log(code);

    return tpl;
}

 var tpl = '<% for(var i = 0; i < this.posts.length; i++) {' +　
        'var post = posts[i]; %>' +
        '<% if(!post.expert){ %>' +
            '<span>post is null</span>' +
        '<% } else { %>' +
            '<a href="#"><% post.expert %> at <% post.time %></a>' +
        '<% } %>' +
    '<% } %>';
tplEngine(tpl, data);
//编译成一个字符串之后，new Function


/*
	得到这样的token
	{ type: 10, label: 'div' }
	{ type: 8, label: '>' }
	{ type: 10, label: 'h1' }
	{ type: 8, label: '>' }
	{ type: 1, label: '{title}' }
	{ type: 13, label: '</h1>' }
*/
types = {
	TK_TEXT: 1, // 文本节点
	TK_IF: 2, // {if ...}
	TK_END_IF: 3, // {/if}
	TK_ELSE_IF: 4, // {elseif ...}
	TK_ELSE: 5, // {else}
	TK_EACH: 6, // {each ...}
	TK_END_EACH: 7, // {/each}
	TK_GT: 8, // >
	TK_SLASH_GT: 9, // />
	TK_TAG_NAME: 10, // <div|<span|<img|...
	TK_ATTR_NAME: 11, // 属性名
	TK_ATTR_EQUAL: 12, // =
	TK_ATTR_STRING: 13, // "string"
	TK_CLOSE_TAG: 13, // </div>|</span>|</a>|...
	TK_EOF: 100 // end of file
}

//主要是对each、if、HTML元素进行处理
function Tokenzier(input){
	this.input = input;
	//当前识别到字符位置索引
	this.index = 0;
	//是否读取结束
	this.eof = false;
}
var pp = Tokenizer.prototype;
pp.nextToken = function(){
	this.eatSpaces();
	return(
		//识别失败就会尝试下一种
		this.readCloseTag() ||
	    this.readTagName() ||
	    this.readAttrName() ||
	    this.readAttrEqual() ||
	    this.readAttrString() ||
	    this.readGT() ||
	    this.readSlashGT() ||
	    this.readIF() ||
	    this.readElseIf() ||
	    this.readElse() ||
	    this.readEndIf() ||
	    this.readEach() ||
	    this.readEndEach() ||
	    this.readText() ||
	    this.readEOF() ||
	    //所有类型都试过都无法识别那么就是语法错误，直接抛出异常。
	    this.error()
	)
}
//对当前token进行匹配
//peek出队操作，相当于js中的shift
pp.peekToken = function(){
	//保存当前索引
	var index = this.index;
	var token = this.nextToken();
	//将索引回退到之前索引
	this.index = index;
	return token;
}
/*
 * Read token one by one
 */
//读取标签名
pp.readTagName = function(){
	if(this.char() === '<'){
		this.index++;
		this.eatSpaces();
		var start = this.index;
		//<Header 
		//当前字符满足字母(下划线)或数字
		while(this.char().match(/[\w\d]/)){
			this.index++;
		}
		var tagName = this.input.slice(start, this.index);
		//將此时的this.context设为10
		this.setContext(types.TK_TAG_NAME);
		return {
			type: types.TK_TAG_NAME,
			label: tagName
		}
	}
}
//读取属性名
pp.readAttrName = function(){
	//判断上下文是否符合，此时context为10
	if(this.inContext(types.TK_TAG_NAME) && this.char()){
		//比标签名多了一个-，因为可能出现data-id的属性名
		var reg =  /[\w\-\d]/;
		if(!reg.test(this.char()) return;
		var start = this.index;
		while (this.char() && reg.test(this.char())){
	      	this.index++;
	    }
	    return {
	    	type: types.TK_ATTR_NAME,
	    	label: this.input.slice(start, this.index);
	    }
	}
}
//读取=号
pp.readAttrEqual = function(){
	if(this.inContext(types.TK_TAG_NAME) && this.char() === '='){
		this.index++;
		return {
			type: types.TK_ATTR_EQUAL,
     		label: '='
		}
	}
}
//读取属性值
pp.readAttrString = function(){
	//当匹配单引号或双引号时
	if(this.inContext(types.TK_TAG_NAME) && /['"]/.test(this.char())){
		//quote保存引号
		var quote = this.char();
		var start = this.index;
		this.index++;
		while (!isUndefined(this.char()) && this.char() !== quote) {
	      	this.index++;
	    }
	    //最后一个也是引号
	    this.index++;
	    return {
	    	type: types.TK_ATTR_STRING,
	    	//从引号下一位开始
      		label: this.input.slice(start + 1, this.index - 1)
	    }
	}
}
//读取标签结束
pp.readCloseTag = function(){
	return this.captureByRegx(
		//</header>
		 /^\<\s*?\/\s*?[\w\d-]+?\s*?\>/, 
    	types.TK_CLOSE_TAG
	)
}
//读取大于号
pp.readGT = function(){
	if(this.char() === '>'){
		this.index++;
		this.setContext(types.Tk_GT)
		return {
	      	type: types.TK_GT,
	      	label: '>'
	    } 
	}
}
//读取 />
pp.readSlashGT = function(){
	return this.captureByRegx(
	    /^\/\>/,
	    types.TK_SLASH_GT
	)
}
//读取if
pp.readIF = function(){
  	return this.captureByRegx(
	    /^\{\s*?if\s[\S\s]*?\}/,
	    types.TK_IF
    )
}
//读取else
pp.readElse = function(){
	return this.captureByRegx(
	    /^\{\s*else\s*\}/,
	    types.TK_ELSE
	)
}
//读取elseif
pp.readElseIf = function(){
	return this.captureByRegx(
	    /^\{\s*elseif\s*[\S\s]+?\}/,
	    types.TK_ELSE_IF
	)
}
//读取/if
pp.readEndIf = function(){
	return this.captureByRegx(
	    /^\{\s*\/if\s*\}/,
	    types.TK_END_IF
	)
}
//读取each
pp.readEach = function(){
  	return this.captureByRegx(
	    /^\{\s*each\s*[\S\s]*?\}/,
	    types.TK_EACH
	)
}
//读取标签中的文本
pp.readText = function(){
	if(!this.inContext(type.TK_TAG_NAME)){
		var start = this.index;
		if(!this.char()) return;
		this.index++;
		//当没有遇到<或者{,因为{要被解析成要替换的变量
		while(this.char() && !(/[\<\{]/.test(this.char())){
			this.index++;
		}
		return {
			type: types.TK_TEXT,
      		label: this.input.slice(start, this.index)
		}
	}
}
//end of file，是否读取结束
pp.readEOF = function () {
	if (this.index >= this.input.length) {
	    this.eof = true;
	    return {
	      	type: types.TK_EOF,
	      	label: '$'
	    }
	}
}
/* 
 * Helpers Functions
 */
pp.eatSpaces = function(){
	//遇到空白符向前移一位
	while(/\s/.test(this.char())){
		this.index++;
	}
}

pp.setContext = function(type){
	this.context = type;
}

//判断上下文是否符合，如在读取tag的时候context为10
//读取attr的时候进行对比
pp.inContext = function (type){
    return this.context === type
}

pp.char = function(){
	//返回当前字符
  	return this.input[this.index]
}

//单个type类型的，直接匹配正则，设置context之后返回type和label
pp.captureByRegx = function (regx, type) {
	var input = this.input.slice(this.index);
	var capture = input.match(regx);
	if(capture){
	    capture = capture[0];
	    this.index += capture.length;
	    //将上下文类型设为当前类型
	    this.setContext(type);
	    return {
	        type: type,
	        label: capture
	    }
	}
}

pp.test = function () {
  	while(!this.eof) {
    	console.log(this.nextToken())
  	}
}

pp.error = function () {
  	throw new Error('Unexpected token: \'' + this.char() + '\'')
}

function isUndefined (value) {
    return value === void 666
}