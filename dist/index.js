"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var BatchedArray = /** @class */ (function () {
    function BatchedArray(source, detach) {
        if (detach === void 0) { detach = false; }
        this.convert = function (interval) {
            var magnitude = interval.magnitude, unit = interval.unit;
            switch (unit) {
                default:
                case TimeUnit.Milliseconds:
                    return magnitude;
                case TimeUnit.Seconds:
                    return magnitude * 1000;
                case TimeUnit.Minutes:
                    return magnitude * 1000 * 60;
            }
        };
        var resolved = source || [];
        this.source = detach ? Array.from(resolved) : resolved;
    }
    BatchedArray.from = function (source, detach) {
        if (detach === void 0) { detach = false; }
        return new BatchedArray(source, detach);
    };
    Object.defineProperty(BatchedArray.prototype, "length", {
        get: function () {
            return this.source.length;
        },
        enumerable: true,
        configurable: true
    });
    BatchedArray.prototype.fixedBatch = function (batcher) {
        var batches = [];
        var i = 0;
        if ("batchSize" in batcher) {
            var batchSize = batcher.batchSize;
            while (i < this.length) {
                var cap = Math.min(i + batchSize, this.length);
                batches.push(this.source.slice(i, i = cap));
            }
        }
        else if ("batchCount" in batcher) {
            var batchCount = batcher.batchCount, mode = batcher.mode;
            var resolved = mode || Mode.Balanced;
            if (batchCount < 1) {
                throw new Error("Batch count must be a positive integer!");
            }
            if (batchCount === 1) {
                return [this.source];
            }
            if (batchCount >= this.length) {
                return this.source.map(function (element) { return [element]; });
            }
            var size = void 0;
            if (length % batchCount === 0) {
                size = Math.floor(length / batchCount);
                while (i < length) {
                    batches.push(this.source.slice(i, i += size));
                }
            }
            else if (resolved === Mode.Balanced) {
                while (i < length) {
                    size = Math.ceil((length - i) / batchCount--);
                    batches.push(this.source.slice(i, i += size));
                }
            }
            else {
                batchCount--;
                size = Math.floor(length / batchCount);
                if (length % size === 0) {
                    size--;
                }
                while (i < size * batchCount) {
                    batches.push(this.source.slice(i, i += size));
                }
                batches.push(this.source.slice(size * batchCount));
            }
        }
        return batches;
    };
    ;
    BatchedArray.prototype.predicateBatch = function (batcher) {
        var batches = [];
        var batch = [];
        var executor = batcher.executor, initial = batcher.initial;
        var accumulator = initial;
        for (var _i = 0, _a = this.source; _i < _a.length; _i++) {
            var element = _a[_i];
            var _b = executor(element, accumulator), updated = _b.updated, createNewBatch = _b.createNewBatch;
            accumulator = updated;
            if (!createNewBatch) {
                batch.push(element);
            }
            else {
                batches.push(batch);
                batch = [element];
            }
        }
        batches.push(batch);
        return batches;
    };
    ;
    BatchedArray.prototype.predicateBatchAsync = function (batcher) {
        return __awaiter(this, void 0, void 0, function () {
            var batches, batch, executorAsync, initial, accumulator, _i, _a, element, _b, updated, createNewBatch;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        batches = [];
                        batch = [];
                        executorAsync = batcher.executorAsync, initial = batcher.initial;
                        accumulator = initial;
                        _i = 0, _a = this.source;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        element = _a[_i];
                        return [4 /*yield*/, executorAsync(element, accumulator)];
                    case 2:
                        _b = _c.sent(), updated = _b.updated, createNewBatch = _b.createNewBatch;
                        accumulator = updated;
                        if (!createNewBatch) {
                            batch.push(element);
                        }
                        else {
                            batches.push(batch);
                            batch = [element];
                        }
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        batches.push(batch);
                        return [2 /*return*/, batches];
                }
            });
        });
    };
    ;
    BatchedArray.prototype.batch = function (batcher) {
        if ("executor" in batcher) {
            return this.predicateBatch(batcher);
        }
        else {
            return this.fixedBatch(batcher);
        }
    };
    ;
    BatchedArray.prototype.batchAsync = function (batcher) {
        if ("executorAsync" in batcher) {
            return this.predicateBatchAsync(batcher);
        }
        else {
            return this.batch(batcher);
        }
    };
    ;
    BatchedArray.prototype.batchedForEach = function (specifications) {
        if (this.length) {
            var batcher = specifications.batcher, handler = specifications.handler;
            var completed = 0;
            var batches = this.batch(batcher);
            var quota = batches.length;
            for (var _i = 0, batches_1 = batches; _i < batches_1.length; _i++) {
                var batch = batches_1[_i];
                var context = {
                    completedBatches: completed,
                    remainingBatches: quota - completed,
                };
                handler(batch, context);
                completed++;
            }
        }
    };
    ;
    BatchedArray.prototype.batchedMap = function (specifications) {
        if (!this.length) {
            return [];
        }
        var batcher = specifications.batcher, converter = specifications.converter;
        var collector = [];
        var completed = 0;
        var batches = this.batch(batcher);
        var quota = batches.length;
        for (var _i = 0, batches_2 = batches; _i < batches_2.length; _i++) {
            var batch = batches_2[_i];
            var context = {
                completedBatches: completed,
                remainingBatches: quota - completed,
            };
            converter(batch, context).forEach(function (convert) { return collector.push(convert); });
            completed++;
        }
        return collector;
    };
    ;
    BatchedArray.prototype.batchedForEachAsync = function (specifications) {
        return __awaiter(this, void 0, void 0, function () {
            var batcher, handler, completed, batches, quota, _i, batches_3, batch, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.length) return [3 /*break*/, 5];
                        batcher = specifications.batcher, handler = specifications.handler;
                        completed = 0;
                        return [4 /*yield*/, this.batchAsync(batcher)];
                    case 1:
                        batches = _a.sent();
                        quota = batches.length;
                        _i = 0, batches_3 = batches;
                        _a.label = 2;
                    case 2:
                        if (!(_i < batches_3.length)) return [3 /*break*/, 5];
                        batch = batches_3[_i];
                        context = {
                            completedBatches: completed,
                            remainingBatches: quota - completed,
                        };
                        return [4 /*yield*/, handler(batch, context)];
                    case 3:
                        _a.sent();
                        completed++;
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ;
    BatchedArray.prototype.batchedMapAsync = function (specifications) {
        return __awaiter(this, void 0, void 0, function () {
            var batcher, converter, collector, completed, batches, quota, _i, batches_4, batch, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.length) {
                            return [2 /*return*/, []];
                        }
                        batcher = specifications.batcher, converter = specifications.converter;
                        collector = [];
                        completed = 0;
                        return [4 /*yield*/, this.batchAsync(batcher)];
                    case 1:
                        batches = _a.sent();
                        quota = batches.length;
                        _i = 0, batches_4 = batches;
                        _a.label = 2;
                    case 2:
                        if (!(_i < batches_4.length)) return [3 /*break*/, 5];
                        batch = batches_4[_i];
                        context = {
                            completedBatches: completed,
                            remainingBatches: quota - completed,
                        };
                        return [4 /*yield*/, converter(batch, context)];
                    case 3:
                        (_a.sent()).forEach(function (convert) { return collector.push(convert); });
                        completed++;
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, collector];
                }
            });
        });
    };
    ;
    BatchedArray.prototype.batchedForEachInterval = function (specifications) {
        return __awaiter(this, void 0, void 0, function () {
            var batcher, handler, interval, batches, quota;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.length) {
                            return [2 /*return*/];
                        }
                        batcher = specifications.batcher, handler = specifications.handler, interval = specifications.interval;
                        return [4 /*yield*/, this.batchAsync(batcher)];
                    case 1:
                        batches = _a.sent();
                        quota = batches.length;
                        return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                var iterator, completed, _loop_1, state_1;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            iterator = batches[Symbol.iterator]();
                                            completed = 0;
                                            _loop_1 = function () {
                                                var next;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            next = iterator.next();
                                                            return [4 /*yield*/, new Promise(function (resolve) {
                                                                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                                        var batch, context;
                                                                        return __generator(this, function (_a) {
                                                                            switch (_a.label) {
                                                                                case 0:
                                                                                    batch = next.value;
                                                                                    context = {
                                                                                        completedBatches: completed,
                                                                                        remainingBatches: quota - completed,
                                                                                    };
                                                                                    return [4 /*yield*/, handler(batch, context)];
                                                                                case 1:
                                                                                    _a.sent();
                                                                                    resolve();
                                                                                    return [2 /*return*/];
                                                                            }
                                                                        });
                                                                    }); }, _this.convert(interval));
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            if (++completed === quota) {
                                                                return [2 /*return*/, "break"];
                                                            }
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            };
                                            _a.label = 1;
                                        case 1:
                                            if (!true) return [3 /*break*/, 3];
                                            return [5 /*yield**/, _loop_1()];
                                        case 2:
                                            state_1 = _a.sent();
                                            if (state_1 === "break")
                                                return [3 /*break*/, 3];
                                            return [3 /*break*/, 1];
                                        case 3:
                                            resolve();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    ;
    BatchedArray.prototype.batchedMapInterval = function (specifications) {
        return __awaiter(this, void 0, void 0, function () {
            var batcher, converter, interval, collector, batches, quota;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.length) {
                            return [2 /*return*/, []];
                        }
                        batcher = specifications.batcher, converter = specifications.converter, interval = specifications.interval;
                        collector = [];
                        return [4 /*yield*/, this.batchAsync(batcher)];
                    case 1:
                        batches = _a.sent();
                        quota = batches.length;
                        return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                var iterator, completed, _loop_2, state_2;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            iterator = batches[Symbol.iterator]();
                                            completed = 0;
                                            _loop_2 = function () {
                                                var next;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            next = iterator.next();
                                                            return [4 /*yield*/, new Promise(function (resolve) {
                                                                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                                        var batch, context;
                                                                        return __generator(this, function (_a) {
                                                                            switch (_a.label) {
                                                                                case 0:
                                                                                    batch = next.value;
                                                                                    context = {
                                                                                        completedBatches: completed,
                                                                                        remainingBatches: quota - completed,
                                                                                    };
                                                                                    return [4 /*yield*/, converter(batch, context)];
                                                                                case 1:
                                                                                    (_a.sent()).forEach(function (convert) { return collector.push(convert); });
                                                                                    resolve();
                                                                                    return [2 /*return*/];
                                                                            }
                                                                        });
                                                                    }); }, _this.convert(interval));
                                                                })];
                                                        case 1:
                                                            _a.sent();
                                                            if (++completed === quota) {
                                                                resolve(collector);
                                                                return [2 /*return*/, "break"];
                                                            }
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            };
                                            _a.label = 1;
                                        case 1:
                                            if (!true) return [3 /*break*/, 3];
                                            return [5 /*yield**/, _loop_2()];
                                        case 2:
                                            state_2 = _a.sent();
                                            if (state_2 === "break")
                                                return [3 /*break*/, 3];
                                            return [3 /*break*/, 1];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    ;
    return BatchedArray;
}());
exports.default = BatchedArray;
var Mode;
(function (Mode) {
    Mode[Mode["Balanced"] = 0] = "Balanced";
    Mode[Mode["Even"] = 1] = "Even";
})(Mode = exports.Mode || (exports.Mode = {}));
;
var TimeUnit;
(function (TimeUnit) {
    TimeUnit[TimeUnit["Milliseconds"] = 0] = "Milliseconds";
    TimeUnit[TimeUnit["Seconds"] = 1] = "Seconds";
    TimeUnit[TimeUnit["Minutes"] = 2] = "Minutes";
})(TimeUnit = exports.TimeUnit || (exports.TimeUnit = {}));
;
