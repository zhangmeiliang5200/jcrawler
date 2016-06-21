function TestConsolePipeline() {
    this.process = function (resultItems, spider) {
        console.log("url:\t" + resultItems.fields["url"]);
    }

    this.dispose = function () {
    }
    return this;
}

module.exports = TestConsolePipeline