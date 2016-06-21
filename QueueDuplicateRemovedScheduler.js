var Queue = require("./Queue.js");

function QueueDuplicateRemovedScheduler() {
    this.duplicateRemover = {};
    this._queue = new Queue();
    this.pushWhenNoDuplicate = function (request, spider) {
        this._queue.enqueue(request);
    }
    this.resetDuplicateCheck = function (spider) {
        this.duplicateRemover = {};
    }
    this.push = function (request, spider) {
        if (this.duplicateRemover[request.identity] == null || this.shouldReserved(request)) {
            this.pushWhenNoDuplicate(request, spider);
        }
    }
    this.poll = function (spider) {
        return this._queue.isEmpty() ? null : this._queue.dequeue();
    }

    this.shouldReserved = function (request) {
        var cycleTriedTimes = request.getExtra(Request.cycleTriedTimes);
        if (cycleTriedTimes == null) {
            return false;
        }
        else {
            return cycleTriedTimes > 0;
        }
    }
    this.dispose = function () {
        this.duplicateRemover = null;
    }
    this.getLeftRequestsCount = function (spider) {
        return this._queue.getLength();
    }

    this.getTotalRequestsCount = function (spider) {
        return Object.getOwnPropertyNames(this.duplicateRemover).length;
    }
    this.init = function () {
    }
    return this;
}
module.exports = QueueDuplicateRemovedScheduler;