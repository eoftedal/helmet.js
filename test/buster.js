var config = module.exports;

config["My tests"] = {
    rootPath: "../",
    environment: "browser", // or "node"
    sources: [
        "lib/helmet.js"
    ],
    tests: [
        "test/*-test.js"
    ]
}