var helmet = {
	"safeInAttributes":"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890%-_",

	"compile" : function(template) {
		var tags = [];
		var t;
		var augmented = template.replace(/<%=([\s\S]*?)%>/g, function(match, group) {
			var k = helmet.key();
			tags.push({key: k, content: group });
			return k;
		});
		var d = document.createElement("div");
		d.innerHTML = augmented;
		for (t in tags) {
			helmet.detect(d, tags[t]);
		}
		augmented = augmented.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/(\r\n|\r|\n)/g, "\\n");
		for (t in tags) {
			if (!tags[t].func) {
				tags[t].func = "unsafe";
				console.log("Unsafe location: " + tags[t].group);
			}
			augmented = augmented.replace(new RegExp(tags[t].key, "g"), '" + helmet.' + tags[t].func + '(' + tags[t].content + ') + "' );
		}
		augmented = augmented.replace(/<%-([\s\S]*?)%>/g, '" + $1 + "');
		augmented = augmented.replace(/<%([\s\S]*?)%>/g, '");\n $1 \n __helmet.push("');
		augmented = 'with(scope) { var __helmet = [];\n __helmet.push("' + augmented + '");\nreturn __helmet.join("") }';
		return { "render": new Function("scope", augmented) };
	},

	"key" : function() {
		return ("helmet" + Math.random() + "" + Math.random()).replace(/0\./g, "");
	},

	"detect" : function(div, tag) {
		for (var i = 0; i < div.childNodes.length; i++) {
			var node = div.childNodes[i];
			if (node.nodeName.indexOf(tag.key) > -1) {
				tag.func = null;
				return true;
			}
			if (node.nodeType === Node.TEXT_NODE) {
				if (node.nodeValue.indexOf(tag.key) > -1) {
					if (helmet.isScriptTag(node.nodeName) || helmet.isScriptTag(node.parentNode.nodeName)) {
						tag.func = helmet.checkJS(node.nodeValue, tag);
					} else if (helmet.isStyle(node.nodeName) || helmet.isStyle(node.parentNode.nodeName)) {
						tag.func = null; //unsafe
					} else {
						tag.func = "escapeHtml";
					}
					return true;
				}
			} else {
				if (node.attributes) {
					for (var a = 0; a < node.attributes.length; a++) {
						var attr = node.attributes[a];
						if (attr.nodeValue.indexOf(tag.key) > -1) {
							if (helmet.isUri(attr.nodeName)) {
								tag.func = "escapeUri";	
							} else if (helmet.isStyle(attr.nodeName)) {
								tag.func = null; //unsafe
							} else if (helmet.isEventHandler(attr.nodeName)) {
								tag.func = helmet.checkJS(attr.nodeValue, tag);
							} else {
								tag.func = "escapeHtmlAttribute";
							}
							return true;
						}
					}
				}
				if (helmet.detect(node, tag)){
					return true;
	 			}
	 		}
		}
	},

	"escapeHtml" : function(data) {
		if (!data) return data;
		if (data.constructor === Number) return data;
		var d = document.createElement("div");
		d.textContent = (d.innerText = data);
		return d.innerHTML;
	},

	"escapeHtmlAttribute" : function(data) {
		data = data + "";
		var result = [];
		for (var i = 0; i < data.length; i++) {
			if (helmet.safeInAttributes.indexOf(data.charAt(i)) > -1) {
				result.push(data.charAt(i));
			} else {
				result.push("&#x" + helmet.zeropad(data.charCodeAt(i).toString(16), 2) + ";");
			}
		}
		return result.join("");
	},
	"escapeJavaScriptString" : function(data) {
		data = data + "";
		var result = [];
		for (var i = 0; i < data.length; i++) {
			var c = data.charCodeAt(i);
			if (c >= 97  && c <= 122 || c >= 65  && c <= 90 || c >= 48  && c <= 57) {
				result.push(String.fromCharCode(c));
			} else if (c <= 0xff) {
				result.push("\\x" + helmet.zeropad(c.toString(16), 2));
			} else {
				result.push("\\u" + helmet.zeropad(c.toString(16), 4));
			}
		}
		return result.join("");
	},
	"zeropad": function(numberStr, zeros) {
		return ("0000" + numberStr).substring(4 + numberStr.length - zeros);
	},
	"escapeUri" : function(data) {
		return helmet.escapeHtmlAttribute(window.encodeURIComponent(data));
	},
	"unsafe" : function(data) {
		return "unsafe-location";
	},
	"unsafeJS" : function(data) {
		return "/* unsafe-location */";
	},
	"isEventHandler": function(name) {
		return (/^on.*$/i).test(name);
	},
	"isUri": function(name) {
		return (/(href|src|formaction|action)/i).test(name);
	},
	"isStyle": function(name) {
		return (/style/i).test(name);
	},
	"isScriptTag" : function(name) {
		return (/script/i).test(name);
	},
	"checkJS": function(attrValue, tag) {
		var inString = false;
		var ix = attrValue.indexOf(tag.key);
		for (var i = 0; i < ix; i++) {
			if (attrValue[i] === "'" || attrValue[i] === '"') {
				var j = i - 1;
				while (j >= 0 && attrValue[j] === '\\'){
					j--;
				}
				if (((i - j)%2) === 1) {
					if (attrValue[i] === inString) {
						inString = false;
					} else if(!inString) {
						inString = attrValue[i];
					}
				}
			}
		}
		if (inString) {
			return "escapeJavaScriptString";
		} else {
			console.log("Unsafe location in: " + attrValue.replace(tag.key, tag.content));
			return "unsafeJS";
		}
	}

};
