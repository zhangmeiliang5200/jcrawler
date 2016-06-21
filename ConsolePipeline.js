function ConsolePipeline() {
    this.process = function (resultItems, spider) {
        for (property in resultItems.fields) {
            console.log(property + ":\t" + resultItems.fields[property]);
        }
    }

    this.dispose = function () {
    }
    return this;
}
module.exports = ConsolePipeline