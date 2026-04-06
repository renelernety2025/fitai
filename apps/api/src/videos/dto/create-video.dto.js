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
import { IsString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { VideoCategory, VideoDifficulty } from '@prisma/client';
let CreateVideoDto = (() => {
    var _a;
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _difficulty_decorators;
    let _difficulty_initializers = [];
    let _difficulty_extraInitializers = [];
    let _durationSeconds_decorators;
    let _durationSeconds_initializers = [];
    let _durationSeconds_extraInitializers = [];
    let _thumbnailUrl_decorators;
    let _thumbnailUrl_initializers = [];
    let _thumbnailUrl_extraInitializers = [];
    let _s3RawKey_decorators;
    let _s3RawKey_initializers = [];
    let _s3RawKey_extraInitializers = [];
    let _choreographyUrl_decorators;
    let _choreographyUrl_initializers = [];
    let _choreographyUrl_extraInitializers = [];
    return _a = class CreateVideoDto {
            constructor() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.category = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.difficulty = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _difficulty_initializers, void 0));
                this.durationSeconds = (__runInitializers(this, _difficulty_extraInitializers), __runInitializers(this, _durationSeconds_initializers, void 0));
                this.thumbnailUrl = (__runInitializers(this, _durationSeconds_extraInitializers), __runInitializers(this, _thumbnailUrl_initializers, void 0));
                this.s3RawKey = (__runInitializers(this, _thumbnailUrl_extraInitializers), __runInitializers(this, _s3RawKey_initializers, void 0));
                this.choreographyUrl = (__runInitializers(this, _s3RawKey_extraInitializers), __runInitializers(this, _choreographyUrl_initializers, void 0));
                __runInitializers(this, _choreographyUrl_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [IsString()];
            _description_decorators = [IsString()];
            _category_decorators = [IsEnum(VideoCategory)];
            _difficulty_decorators = [IsEnum(VideoDifficulty)];
            _durationSeconds_decorators = [IsInt(), Min(1)];
            _thumbnailUrl_decorators = [IsString()];
            _s3RawKey_decorators = [IsString()];
            _choreographyUrl_decorators = [IsOptional(), IsString()];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _difficulty_decorators, { kind: "field", name: "difficulty", static: false, private: false, access: { has: obj => "difficulty" in obj, get: obj => obj.difficulty, set: (obj, value) => { obj.difficulty = value; } }, metadata: _metadata }, _difficulty_initializers, _difficulty_extraInitializers);
            __esDecorate(null, null, _durationSeconds_decorators, { kind: "field", name: "durationSeconds", static: false, private: false, access: { has: obj => "durationSeconds" in obj, get: obj => obj.durationSeconds, set: (obj, value) => { obj.durationSeconds = value; } }, metadata: _metadata }, _durationSeconds_initializers, _durationSeconds_extraInitializers);
            __esDecorate(null, null, _thumbnailUrl_decorators, { kind: "field", name: "thumbnailUrl", static: false, private: false, access: { has: obj => "thumbnailUrl" in obj, get: obj => obj.thumbnailUrl, set: (obj, value) => { obj.thumbnailUrl = value; } }, metadata: _metadata }, _thumbnailUrl_initializers, _thumbnailUrl_extraInitializers);
            __esDecorate(null, null, _s3RawKey_decorators, { kind: "field", name: "s3RawKey", static: false, private: false, access: { has: obj => "s3RawKey" in obj, get: obj => obj.s3RawKey, set: (obj, value) => { obj.s3RawKey = value; } }, metadata: _metadata }, _s3RawKey_initializers, _s3RawKey_extraInitializers);
            __esDecorate(null, null, _choreographyUrl_decorators, { kind: "field", name: "choreographyUrl", static: false, private: false, access: { has: obj => "choreographyUrl" in obj, get: obj => obj.choreographyUrl, set: (obj, value) => { obj.choreographyUrl = value; } }, metadata: _metadata }, _choreographyUrl_initializers, _choreographyUrl_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CreateVideoDto };
//# sourceMappingURL=create-video.dto.js.map