var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { IsInt, IsString, IsBoolean, IsOptional, IsObject, Min } from 'class-validator';
let PoseSnapshotDto = (() => {
    var _a;
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    let _poseName_decorators;
    let _poseName_initializers = [];
    let _poseName_extraInitializers = [];
    let _isCorrect_decorators;
    let _isCorrect_initializers = [];
    let _isCorrect_extraInitializers = [];
    let _errorMessage_decorators;
    let _errorMessage_initializers = [];
    let _errorMessage_extraInitializers = [];
    let _jointAngles_decorators;
    let _jointAngles_initializers = [];
    let _jointAngles_extraInitializers = [];
    return _a = class PoseSnapshotDto {
            constructor() {
                this.timestamp = __runInitializers(this, _timestamp_initializers, void 0);
                this.poseName = (__runInitializers(this, _timestamp_extraInitializers), __runInitializers(this, _poseName_initializers, void 0));
                this.isCorrect = (__runInitializers(this, _poseName_extraInitializers), __runInitializers(this, _isCorrect_initializers, void 0));
                this.errorMessage = (__runInitializers(this, _isCorrect_extraInitializers), __runInitializers(this, _errorMessage_initializers, void 0));
                this.jointAngles = (__runInitializers(this, _errorMessage_extraInitializers), __runInitializers(this, _jointAngles_initializers, void 0));
                __runInitializers(this, _jointAngles_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _timestamp_decorators = [IsInt(), Min(0)];
            _poseName_decorators = [IsString()];
            _isCorrect_decorators = [IsBoolean()];
            _errorMessage_decorators = [IsOptional(), IsString()];
            _jointAngles_decorators = [IsObject()];
            __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: obj => "timestamp" in obj, get: obj => obj.timestamp, set: (obj, value) => { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
            __esDecorate(null, null, _poseName_decorators, { kind: "field", name: "poseName", static: false, private: false, access: { has: obj => "poseName" in obj, get: obj => obj.poseName, set: (obj, value) => { obj.poseName = value; } }, metadata: _metadata }, _poseName_initializers, _poseName_extraInitializers);
            __esDecorate(null, null, _isCorrect_decorators, { kind: "field", name: "isCorrect", static: false, private: false, access: { has: obj => "isCorrect" in obj, get: obj => obj.isCorrect, set: (obj, value) => { obj.isCorrect = value; } }, metadata: _metadata }, _isCorrect_initializers, _isCorrect_extraInitializers);
            __esDecorate(null, null, _errorMessage_decorators, { kind: "field", name: "errorMessage", static: false, private: false, access: { has: obj => "errorMessage" in obj, get: obj => obj.errorMessage, set: (obj, value) => { obj.errorMessage = value; } }, metadata: _metadata }, _errorMessage_initializers, _errorMessage_extraInitializers);
            __esDecorate(null, null, _jointAngles_decorators, { kind: "field", name: "jointAngles", static: false, private: false, access: { has: obj => "jointAngles" in obj, get: obj => obj.jointAngles, set: (obj, value) => { obj.jointAngles = value; } }, metadata: _metadata }, _jointAngles_initializers, _jointAngles_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { PoseSnapshotDto };
//# sourceMappingURL=pose-snapshot.dto.js.map