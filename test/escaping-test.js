buster.spec.expose();

describe("Helmet", function() {
	it("should escape content between tags", function() {
		var template = "<div><%= data %></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "<h1>" });
		expect(out).toEqual("<div>&lt;h1&gt;</div>");
	});

	it("should reject content as tagname tags", function() {
		var template = "<<%= data %>>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "img src=x onerror=alert(1)" });
		expect(out).toEqual("<unsafe-location>");
	});

	it("should escape content between tags", function() {
		var template = "<div><%= data %>x<%= data %></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "<h1>" });
		expect(out).toEqual("<div>&lt;h1&gt;x&lt;h1&gt;</div>");
	});
	it("should escape content between tags together with text", function() {
		var template = "<div>Hei <%= data %></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "<h1>" });
		expect(out).toEqual("<div>Hei &lt;h1&gt;</div>");
	});
	it("should escape content in nested tags", function() {
		var template = "<div><a><%= data %></a></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "<h1>" });
		expect(out).toEqual("<div><a>&lt;h1&gt;</a></div>");
	});
	it("should escape content in attributes", function() {
		var template = "<div title='<%= data %>'>hello</div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "<h1>" });
		expect(out).toEqual("<div title='&#x3c;h1&#x3e;'>hello</div>");
	});
	it("should escape content in attributes together with data", function() {
		var template = "<div title='Hei <%= data %>'>hello</div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "<h1>" });
		expect(out).toEqual("<div title='Hei &#x3c;h1&#x3e;'>hello</div>");
	});
	it("should escape content in attributes in nested tags", function() {
		var template = "<div><div title='<%= data %>'>hello</div></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "<h1>" });
		expect(out).toEqual("<div><div title='&#x3c;h1&#x3e;'>hello</div></div>");
	});

	it("should use url encoding when inside url", function() {
		var template = "<div><a href='http://www.google.com/?q=<%= data %>'>hello</a></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "a&b" });
		expect(out).toEqual("<div><a href='http://www.google.com/?q=a%26b'>hello</a></div>");
	});

	it("should javascript escape if inside string", function() {
		var template = "<div><a onclick=\"var a = '<%= data %>'\">hello</a></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "a'x" });
		expect(out).toEqual("<div><a onclick=\"var a = 'a\\x27x'\">hello</a></div>");
	});

	it("should javascript escape if inside string with double quotes", function() {
		var template = "<div><a onclick='var a = \"<%= data %>\"'>hello</a></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "a'x" });
		expect(out).toEqual("<div><a onclick='var a = \"a\\x27x\"'>hello</a></div>");
	});

	it("should refuse javascript if outside string", function() {
		var template = "<div><a onclick=\"var a = <%= data %>\">hello</a></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "a'x" });
		expect(out).toEqual("<div><a onclick=\"var a = /* unsafe-location */\">hello</a></div>");
	});
	it("should refuse javascript if outside string with string before", function() {
		var template = "<div><a onclick=\"var a = '' + <%= data %>\">hello</a></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "a'x" });
		expect(out).toEqual("<div><a onclick=\"var a = '' + /* unsafe-location */\">hello</a></div>");
	});


	it("should javascript escape if inside script-tag", function() {
		var template = "<div><script>var a = '<%= data %>'</script></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "a'x" });
		expect(out).toEqual("<div><script>var a = 'a\\x27x'</script></div>");
	});
	it("should refuse javascript if inside script-tag", function() {
		var template = "<div><script>var a = <%= data %></script></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "a'x" });
		expect(out).toEqual("<div><script>var a = /* unsafe-location */</script></div>");
	});
	it("should refuse javascript if inside script-tag", function() {
		var template = "<div><script>var a = '\\\''<%= data %></script></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "a'x" });
		expect(out).toEqual("<div><script>var a = '\\\''/* unsafe-location */</script></div>");
	});


	it("should passthrough for <%- %>", function() {
		var template = "<div><%- data %></div>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : "<h1>" });
		expect(out).toEqual("<div><h1></div>");
	});

	it("should run js in <% %>", function() {
		var template = 	"<ul>\n"+
						"<% for (var i in data) { %>\n" + 
							"<li><%= i %></li>\n" + 
						"<% } %>\n" +
						"</ul>";
		var compiled = helmet.compile(template);
		var out = compiled.render({ "data" : [0,1,2] });
		expect(out).toEqual("<ul>\n\n<li>0</li>\n\n<li>1</li>\n\n<li>2</li>\n\n</ul>");
	});

});