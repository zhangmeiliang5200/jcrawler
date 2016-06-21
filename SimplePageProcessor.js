 function SimplePageProcessor() {
    this.site = null;
    this.process = function (page) {
        page.addResultItem("html", page.content);
        page.addResultItem("url", page.request.url);
    }
    this.dispose = function () {

    }
    return this;
}
module.exports = SimplePageProcessor;