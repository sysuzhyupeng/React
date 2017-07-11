// var Tokenizer = require('./tokenizer')
// var types = require('./tokentypes')

var typesName = {};
typesName[types.TK_TEXT] = "text node";
typesName[types.TK_IF] = "{if}";
typesName[types.TK_END_IF] = "{/if}";
typesName[types.TK_ELSE_IF] = "{elseif ..}";
typesName[types.TK_ELSE] = "{else}";
typesName[types.TK_EACH] = "{each ... }";
typesName[types.TK_END_EACH] = "{/each}";
typesName[types.TK_GT] = ">";
typesName[types.TK_SLASH_GT] = "/>";
typesName[types.TK_TAG_NAME] = "open tag name";
typesName[types.TK_ATTR_NAME] = "attribute name";
typesName[types.TK_ATTR_EQUAL] = "=";
typesName[types.TK_ATTR_STRING] = "attribute string";
typesName[types.TK_CLOSE_TAG] = "close tag";
typesName[types.TK_EOF] = "EOF";

function Parser(input){
	this.tokens = new Tokenzier(input);
}

var pp = Parser.prototype;

//当前的token的type是否与type一致
pp.is = function(type){
	return this.tokens.peekToken().type === type;
}

pp.parse = function(){
	this.tokens.index = 0;
	var root = this.parseStat();
	this.eat(types.TK_EOF);
	return root;
}

pp.parseStat = function(){
	var stat = {
		type: 'Stat',
		members: []
	}
	//当type为if each 标签名，文本时
	if(
		this.is(types.TK_IF) ||
	    this.is(types.TK_EACH) ||
	    this.is(types.TK_TAG_NAME) ||
	    this.is(types.TK_TEXT)
	){
		pushMembers(stat.members, [this.parseFrag()]);
		pushMembers(stat.members, this.parseStat().members);
	} else {

	}
	return stat;
}

/*
 * push stat's memeber and concat all text
 */
function pushMembers(target, candidates){
  	for(var i = 0, len = candidates.length; i < len; i++){
  		var lasIdx = target.length - 1;
  		if(isString(target[lasIdx]) && isString(candidates[i])){
  			target[lasIdx] += candidates[i];
  		} else {
  			target.push(candidates[i]);
  		}
  	}
}

function isString(){
	return typeof str === 'string';
}


pp.eat = function(type){
	var token = this.tokens.nextToken();
	if(token.type !== type){
		this.error('expect a(n) ' + typesName[type] + ', but got a(n) ' + typesName[token.type])
	}
	return token;
}