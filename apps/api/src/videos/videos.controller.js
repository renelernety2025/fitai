var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Logger, } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
let VideosController = (() => {
    let _classDecorators = [Controller('videos')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _findAllAdmin_decorators;
    let _findAll_decorators;
    let _getUploadUrl_decorators;
    let _findOne_decorators;
    let _create_decorators;
    let _publish_decorators;
    let _reprocess_decorators;
    let _delete_decorators;
    let _handleWebhook_decorators;
    var VideosController = _classThis = class {
        constructor(videosService, s3Service, mediaConvertService, preprocessingService) {
            this.videosService = (__runInitializers(this, _instanceExtraInitializers), videosService);
            this.s3Service = s3Service;
            this.mediaConvertService = mediaConvertService;
            this.preprocessingService = preprocessingService;
            this.logger = new Logger(VideosController.name);
        }
        findAllAdmin() {
            return this.videosService.findAllAdmin();
        }
        findAll(category, difficulty) {
            return this.videosService.findAll({ category, difficulty });
        }
        getUploadUrl(filename, contentType) {
            return this.s3Service.getPresignedUploadUrl(filename, contentType);
        }
        findOne(id) {
            return this.videosService.findById(id);
        }
        async create(dto) {
            const video = await this.videosService.create(dto);
            this.mediaConvertService.createTranscodeJob(dto.s3RawKey, video.id).catch((err) => {
                this.logger.error(`Transcode job failed for ${video.id}: ${err.message}`);
            });
            return video;
        }
        publish(id) {
            return this.videosService.publish(id);
        }
        reprocess(id) {
            return this.preprocessingService.startPipeline(id);
        }
        delete(id) {
            return this.videosService.delete(id);
        }
        async handleWebhook(body) {
            // SNS sends a confirmation request first
            if (body.Type === 'SubscriptionConfirmation') {
                this.logger.log(`SNS subscription confirmation: ${body.SubscribeURL}`);
                return { ok: true };
            }
            let message = body;
            if (body.Type === 'Notification' && typeof body.Message === 'string') {
                message = JSON.parse(body.Message);
            }
            const detail = message.detail || message;
            const status = detail.status;
            const videoId = detail.userMetadata?.videoId;
            if (!videoId) {
                this.logger.warn('Webhook received without videoId');
                return { ok: true };
            }
            if (status === 'COMPLETE') {
                await this.mediaConvertService.handleJobComplete(videoId);
            }
            else if (status === 'ERROR') {
                await this.mediaConvertService.handleJobError(videoId, detail.errorMessage || 'Unknown error');
            }
            return { ok: true };
        }
    };
    __setFunctionName(_classThis, "VideosController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAllAdmin_decorators = [Get('admin/all'), UseGuards(JwtAuthGuard, AdminGuard)];
        _findAll_decorators = [Get()];
        _getUploadUrl_decorators = [Get('upload-url'), UseGuards(JwtAuthGuard)];
        _findOne_decorators = [Get(':id')];
        _create_decorators = [Post(), UseGuards(JwtAuthGuard, AdminGuard)];
        _publish_decorators = [Put(':id/publish'), UseGuards(JwtAuthGuard, AdminGuard)];
        _reprocess_decorators = [Put(':id/reprocess'), UseGuards(JwtAuthGuard, AdminGuard)];
        _delete_decorators = [Delete(':id'), UseGuards(JwtAuthGuard, AdminGuard)];
        _handleWebhook_decorators = [Post('mediaconvert-webhook')];
        __esDecorate(_classThis, null, _findAllAdmin_decorators, { kind: "method", name: "findAllAdmin", static: false, private: false, access: { has: obj => "findAllAdmin" in obj, get: obj => obj.findAllAdmin }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUploadUrl_decorators, { kind: "method", name: "getUploadUrl", static: false, private: false, access: { has: obj => "getUploadUrl" in obj, get: obj => obj.getUploadUrl }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: obj => "findOne" in obj, get: obj => obj.findOne }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _publish_decorators, { kind: "method", name: "publish", static: false, private: false, access: { has: obj => "publish" in obj, get: obj => obj.publish }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _reprocess_decorators, { kind: "method", name: "reprocess", static: false, private: false, access: { has: obj => "reprocess" in obj, get: obj => obj.reprocess }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleWebhook_decorators, { kind: "method", name: "handleWebhook", static: false, private: false, access: { has: obj => "handleWebhook" in obj, get: obj => obj.handleWebhook }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VideosController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VideosController = _classThis;
})();
export { VideosController };
//# sourceMappingURL=videos.controller.js.map