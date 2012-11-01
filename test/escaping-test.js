buster.spec.expose();

describe("Helmet", function() {
	it("should escape content between tags", function() {
		var template = "<div><%= data %></div>";
		var render = helmet.compile(template).render;
		var out = render({ "data" : "<h1>" });
		expect(out).toEqual("<div>&lt;h1&gt;</div>");
	});
	it("should escape content between tags", function() {
		var template = "<div><%= data %>x<%= data %></div>";
		var render = helmet.compile(template).render;
		var out = render({ "data" : "<h1>" });
		expect(out).toEqual("<div>&lt;h1&gt;x&lt;h1&gt;</div>");
	});
	it("should escape content between tags together with text", function() {
		var template = "<div>Hei <%= data %></div>";
		var render = helmet.compile(template).render;
		var out = render({ "data" : "<h1>" });
		expect(out).toEqual("<div>Hei &lt;h1&gt;</div>");
	});
	it("should escape content in nested tags", function() {
		var template = "<div><a><%= data %></a></div>";
		var render = helmet.compile(template).render;
		var out = render({ "data" : "<h1>" });
		expect(out).toEqual("<div><a>&lt;h1&gt;</a></div>");
	});
	it("should escape content in attributes", function() {
		var template = "<div title='<%= data %>'>hello</div>";
		var render = helmet.compile(template).render;
		var out = render({ "data" : "<h1>" });
		expect(out).toEqual("<div title='&#x3c;h1&#x3e;'>hello</div>");
	});
	it("should escape content in attributes together with data", function() {
		var template = "<div title='Hei <%= data %>'>hello</div>";
		var render = helmet.compile(template).render;
		var out = render({ "data" : "<h1>" });
		expect(out).toEqual("<div title='Hei &#x3c;h1&#x3e;'>hello</div>");
	});
	it("should escape content in attributes in nested tags", function() {
		var template = "<div><div title='<%= data %>'>hello</div></div>";
		var render = helmet.compile(template).render;
		var out = render({ "data" : "<h1>" });
		expect(out).toEqual("<div><div title='&#x3c;h1&#x3e;'>hello</div></div>");
	});
});