var component = window._react_ =  {
	root: document.getElementById('container'),
	data: {  // react -> getInitialState;
		name: 'zhyupeng'
	},
	setData: function(key, val) { // react -> setState
		var self = this;
		self.data[key] = val;
		self.render();
	},
	//render -> dom
	//react：render -> vdom -> (diff) -> dom
	render: function() { // react -> render
		var self = this;
		var template = '<div onclick="_react_.changeName()">hello,{name}</div>';
		var html = template.replace(/\{.*\}/g, function(res){
			//除去花括号
			var key = res.substr(1, res.length - 2);
			return self.data[key];
		})
		self.root.innerHTML = html;
	},
	start:function(){  // react -> React.createClass
		var self = this;
		self.render();
		self.ready();
	},
	ready: function(){ //react -> componentDidMount;
		var self = this;
		setTimeout(function(){
			self.setData('name', 'React');
		}, 2000);
	},
	changeName: function () {  // react -> changeName
	    var self = this;
	    self.setData('name', 'aaaa')
	}
	/*
	var vdom = {
	  	tagName: 'H1',
	  	className: '',
	  	innerHTML: 'hello, Jack!',
	  	onClick: function () {
		    // do something...
		  },
	  	children: [
		    // 子元素
		  ]
	  	...
	}
	 */
}
component.start();