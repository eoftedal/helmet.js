var helmet = {
	"compile" : function(template) {
		var tags = [];
		var augmented = template.replace(/<%=((?:.|\r|\n)*?)%>/g, function(match, group) {
			var k = helmet.key();
			tags.push({key: k, content: group });
			return k;
		});
		var d = document.createElement("div");
		d.innerHTML = augmented;
		for (var t in tags) {
			helmet.detect(d, tags[t]);
		}
		augmented = augmented.replace(/"/g, '\\"');
		for (var t in tags) {
			var func = "escapeHtml";
			if (tags[t].type === "attribute") {
				func = "escapeHtmlAttribute";
			}
			augmented = augmented.replace(new RegExp(tags[t].key, "g"), '" + helmet.' + func + '(' + tags[t].content + ') + "' )
		}
		augmented = 'with(scope) { return "' + augmented + '"; }';
		return { "render": new Function("scope", augmented) };
	},

	"key" : function() {
		return Math.random() + "" + Math.random();
	},

	"detect" : function(div, tag) {
		for (var i = 0; i < div.childNodes.length; i++) {
			var node = div.childNodes[i];
			if (node.nodeType == 3) {
				if (node.nodeValue.indexOf(tag.key) > -1) {
					tag.type = "content";
					return true;
				}
			} else {
				for (var a = 0; a < node.attributes.length; a++) {
					var attr = node.attributes[a];
					if (attr.nodeValue.indexOf(tag.key) > -1) {
						tag.type = "attribute"
						return true;
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
		return data.replace(/&/, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},

	"escapeHtmlAttribute" : function(data) {
		if (!data) return data;
		if (data.constructor === Number) return data;
		var result = [];
		for (var i = 0; i < data.length; i++) {
			var c = data.charCodeAt(i);
			if (c >= 97  && c <= 122 || c >= 65  && c <= 90 || c >= 48  && c <= 57) {
				result.push(String.fromCharCode(c));
			} else {
				result.push("&#x" + c.toString(16) + ";");
			}
		}
		return result.join("");
	}

};